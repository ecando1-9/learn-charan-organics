"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users2, Search, Plus, X, Loader2, MessageSquare, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { createGroup } from "@/app/actions/community";
import { createClient } from "@/lib/supabase/client";

function formatChatTime(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  if (isNaN(d.getTime())) return "";
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  }
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function GroupSidebar({ groups, isAdmin }: { groups: any[]; isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const isIndex = pathname === "/community";
  const [search, setSearch] = useState("");
  const [groupsList, setGroupsList] = useState<any[]>(groups);
  const [incomingToast, setIncomingToast] = useState<{
    groupName: string;
    groupSlug: string;
    sender: string;
    text: string;
  } | null>(null);

  // Sync initial groups
  useEffect(() => {
    setGroupsList(groups);
  }, [groups]);

  // Realtime subscription for incoming messages across all groups
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("community_sidebar_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lms_group_messages",
        },
        async (payload) => {
          const newMsg = payload.new;
          const targetGroup = groupsList.find((g) => g.id === newMsg.group_id);

          if (!targetGroup) return;

          // Fetch sender profile
          const { data: profile } = await supabase
            .from("lms_profiles")
            .select("full_name")
            .eq("id", newMsg.user_id)
            .maybeSingle();

          const senderName = profile?.full_name || "Member";
          const snippet = newMsg.body || (newMsg.file_name ? `📎 ${newMsg.file_name}` : "Shared link");

          // Update group in list & place at top
          setGroupsList((prev) => {
            const updated = prev.map((g) => {
              if (g.id === newMsg.group_id) {
                return {
                  ...g,
                  last_message_text: `${senderName}: ${snippet}`,
                  last_message_at: newMsg.created_at || new Date().toISOString(),
                };
              }
              return g;
            });
            // Re-sort with active group on top
            return updated.sort((a, b) => {
              const timeA = new Date(a.last_message_at || 0).getTime();
              const timeB = new Date(b.last_message_at || 0).getTime();
              return timeB - timeA;
            });
          });

          // Show floating popup if user is not currently in this specific group
          const currentGroupId = pathname.split("/community/")[1];
          if (currentGroupId !== targetGroup.id && currentGroupId !== targetGroup.slug) {
            setIncomingToast({
              groupName: targetGroup.name,
              groupSlug: targetGroup.slug || targetGroup.id,
              sender: senderName,
              text: snippet,
            });

            setTimeout(() => {
              setIncomingToast(null);
            }, 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupsList, pathname]);

  // Create Group Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [adminOnly, setAdminOnly] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim()) return;
    setIsPending(true);
    setError(null);

    const res = await createGroup(groupName, groupDesc, adminOnly);
    setIsPending(false);

    if (res.error) {
      setError(res.error);
    } else {
      setGroupName("");
      setGroupDesc("");
      setAdminOnly(false);
      setShowCreateModal(false);
      if (res.group?.id) {
        router.push(`/community/${res.group.id}`);
      }
    }
  }

  const filteredGroups = groupsList.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div
        className={cn(
          "w-full lg:w-[340px] shrink-0 border-r border-gray-200 dark:border-white/10 flex flex-col bg-[#f0f2f5] dark:bg-[#111b21]",
          !isIndex && "hidden lg:flex" // Hide on mobile if a chat is active
        )}
      >
        {/* Real-time Message Alert Toast */}
        {incomingToast && (
          <div className="p-2.5 bg-emerald-600 text-white animate-in fade-in slide-in-from-top duration-200">
            <Link
              href={`/community/${incomingToast.groupSlug}`}
              onClick={() => setIncomingToast(null)}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="grid size-6 place-items-center rounded-full bg-white/20 shrink-0">
                  <Bell size={12} />
                </span>
                <div className="min-w-0">
                  <p className="font-bold truncate">
                    {incomingToast.groupName} &middot; {incomingToast.sender}
                  </p>
                  <p className="text-[10px] text-white/80 truncate">
                    {incomingToast.text}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-[10px] bg-white text-emerald-800 font-black px-2 py-0.5 rounded-full">
                Open
              </span>
            </Link>
          </div>
        )}

        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-[#e9edef] dark:bg-[#202c33]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 dark:text-cream flex items-center gap-2">
              <Users2 className="text-emerald-600 dark:text-emerald-400" size={22} /> Chats
            </h2>
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                title="Create New Group"
                className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition shadow-sm"
              >
                <Plus size={15} /> New Group
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mt-3 relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-cream/40"
              size={16}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or start new chat..."
              className="w-full bg-white dark:bg-[#111b21] rounded-xl py-2 pl-10 pr-4 text-sm font-medium outline-none border border-gray-200 dark:border-white/10 text-gray-900 dark:text-cream placeholder:text-gray-400 dark:placeholder:text-cream/40 focus:ring-2 ring-emerald-600"
            />
          </div>
        </div>

        {/* Group List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-200/50 dark:divide-white/5 relative">
          {filteredGroups.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-cream/50 text-sm font-medium">
              {search ? "No matching groups found." : "No groups joined yet."}
            </div>
          ) : (
            filteredGroups.map((group) => {
              const targetSlug = group.slug || group.id;
              const isActive = pathname === `/community/${group.id}` || pathname === `/community/${group.slug}`;
              const initials = group.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <Link
                  href={`/community/${targetSlug}`}
                  key={group.id}
                  className={cn(
                    "flex items-center gap-3 p-3.5 transition hover:bg-white/80 dark:hover:bg-[#202c33]",
                    isActive && "bg-white dark:bg-[#2a3942] border-l-4 border-l-emerald-600"
                  )}
                >
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-white font-black shadow-sm text-sm">
                    {initials}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-1">
                      <div className="font-bold text-gray-900 dark:text-cream truncate text-sm">
                        {group.name}
                      </div>
                      {group.last_message_at && (
                        <span className="text-[10px] font-semibold text-gray-400 dark:text-cream/40 shrink-0">
                          {formatChatTime(group.last_message_at)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-cream/60 truncate mt-0.5">
                      {group.last_message_text || group.description || "Tap to open chat..."}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#202c33] border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-cream flex items-center gap-2">
                <Users2 className="text-emerald-600 dark:text-emerald-400" size={20} /> Create New Group
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="grid size-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="mt-4 space-y-4">
              {error && (
                <p className="rounded-xl bg-red-100 p-3 text-xs font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  {error}
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-cream/80 mb-1">
                  Group Name *
                </label>
                <input
                  required
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. VIP Soap formulation Batch 2"
                  className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-white/10 dark:bg-[#111b21] dark:text-cream"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-cream/80 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="What is the purpose of this group?"
                  className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-white/10 dark:bg-[#111b21] dark:text-cream"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-cream">Announcement Only Mode</p>
                  <p className="text-[11px] text-gray-500 dark:text-cream/60">Only admins can post messages</p>
                </div>
                <input
                  type="checkbox"
                  checked={adminOnly}
                  onChange={(e) => setAdminOnly(e.target.checked)}
                  className="size-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full border border-gray-300 px-5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:text-cream/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !groupName.trim()}
                  className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
