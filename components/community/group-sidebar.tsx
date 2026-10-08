"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users2, Search, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createGroup } from "@/app/actions/community";

export function GroupSidebar({ groups, isAdmin }: { groups: any[]; isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const isIndex = pathname === "/community";
  const [search, setSearch] = useState("");

  // Create Group Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim()) return;
    setIsPending(true);
    setError(null);

    const res = await createGroup(groupName, groupDesc);
    setIsPending(false);

    if (res.error) {
      setError(res.error);
    } else {
      setGroupName("");
      setGroupDesc("");
      setShowCreateModal(false);
      if (res.group?.id) {
        router.push(`/community/${res.group.id}`);
      }
    }
  }

  const filteredGroups = groups.filter((g) =>
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
                className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
              >
                <Plus size={16} /> New Group
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
        <div className="flex-1 overflow-y-auto divide-y divide-gray-200/50 dark:divide-white/5">
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
                    <div className="font-bold text-gray-900 dark:text-cream truncate text-sm">
                      {group.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-cream/60 truncate mt-0.5">
                      {group.description || "Tap to open chat..."}
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
