"use client";

import { useEffect, useState, useRef } from "react";
import { X, MessageSquare, ArrowDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MessageBubble } from "@/components/community/message-bubble";

interface RealtimeMessagesProps {
  groupId: string;
  initialMessages: any[];
  currentUserId: string;
}

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const now = ctx.currentTime;
    // Pleasant dual chime tone: 600Hz -> 840Hz
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.12);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  } catch (_) {}
}

export function RealtimeMessages({
  groupId,
  initialMessages,
  currentUserId,
}: RealtimeMessagesProps) {
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [popupNotification, setPopupNotification] = useState<{
    id: string;
    sender: string;
    text: string;
  } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`group_messages:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lms_group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const newMsg = payload.new;

          // Fetch sender profile details if not included in payload
          const { data: profile } = await supabase
            .from("lms_profiles")
            .select("full_name, email, avatar_url")
            .eq("id", newMsg.user_id)
            .single();

          const senderName = profile?.full_name || "Community Member";
          const formattedMsg = {
            ...newMsg,
            profile: profile ?? { full_name: senderName, email: "" },
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, formattedMsg];
          });

          // If message is from someone else, show alert popup and play chime
          if (newMsg.user_id !== currentUserId) {
            playNotificationChime();
            setPopupNotification({
              id: newMsg.id,
              sender: senderName,
              text: newMsg.body || "Shared a file / attachment",
            });

            // Auto-hide popup after 5 seconds
            setTimeout(() => {
              setPopupNotification((curr) => (curr?.id === newMsg.id ? null : curr));
            }, 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, supabase, currentUserId]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto space-y-3 px-3 py-4 sm:px-6 bg-[#efeae2] dark:bg-[#0b141a] relative scrollbar-thin"
    >
      {/* Floating Incoming Message Notification Popup */}
      {popupNotification && (
        <div className="sticky top-2 z-30 mx-auto max-w-md w-full px-2 sm:px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            onClick={() => {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
              setPopupNotification(null);
            }}
            className="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-white/95 dark:bg-[#202c33]/95 backdrop-blur-md shadow-xl border border-emerald-500/30 text-xs cursor-pointer hover:shadow-2xl transition ring-1 ring-emerald-500/20"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="grid size-8 place-items-center rounded-full bg-emerald-600 text-white shrink-0 font-bold shadow-xs">
                <MessageSquare size={14} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-900 dark:text-cream truncate text-xs">
                    {popupNotification.sender}
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full shrink-0">
                    New Message
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-cream/70 truncate mt-0.5">
                  {popupNotification.text}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowDown size={11} /> Scroll
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopupNotification(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-cream rounded-full transition"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="bg-white/90 dark:bg-[#202c33] backdrop-blur px-4 py-2 rounded-full shadow-sm text-xs text-gray-600 dark:text-cream/70 font-semibold border border-gray-200 dark:border-white/10">
            🔒 End-to-end community group chat. Send a message to start!
          </div>
        </div>
      ) : (
        messages.map((msg: any) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.user_id === currentUserId}
          />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
