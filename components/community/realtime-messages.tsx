"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageBubble } from "@/components/community/message-bubble";

interface RealtimeMessagesProps {
  groupId: string;
  initialMessages: any[];
  currentUserId: string;
}

export function RealtimeMessages({
  groupId,
  initialMessages,
  currentUserId,
}: RealtimeMessagesProps) {
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
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

          const formattedMsg = {
            ...newMsg,
            profile: profile ?? { full_name: "Member", email: "" },
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, formattedMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, supabase]);

  return (
    <div className="flex-1 overflow-y-auto space-y-3 px-3 py-4 sm:px-6 bg-[#efeae2] dark:bg-[#0b141a] relative scrollbar-thin">
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
