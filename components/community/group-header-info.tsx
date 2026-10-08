"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users2, UserPlus, X, ShieldCheck, Trash2, ArrowLeft, Search, Lock, AlertTriangle } from "lucide-react";
import {
  addMemberToGroup,
  removeMemberFromGroup,
  getAllStudents,
  toggleAdminOnlyMessaging,
  deleteGroup,
} from "@/app/actions/community";

interface GroupHeaderInfoProps {
  group: any;
  members: any[];
  isAdmin: boolean;
  currentUserId: string;
}

export function GroupHeaderInfo({ group, members, isAdmin, currentUserId }: GroupHeaderInfoProps) {
  const router = useRouter();
  const [showDrawer, setShowDrawer] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isAdminOnly, setIsAdminOnly] = useState<boolean>(group.admin_only_messaging ?? false);
  
  // Confirmation Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);

  async function openDrawer() {
    setShowDrawer(true);
    if (isAdmin && students.length === 0) {
      setLoadingStudents(true);
      const res = await getAllStudents();
      setStudents(res);
      setLoadingStudents(false);
    }
  }

  async function handleToggleAdminOnly(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    setIsAdminOnly(checked);
    setIsPending(true);
    const res = await toggleAdminOnlyMessaging(group.id, checked);
    setIsPending(false);
    if (res.error) {
      setIsAdminOnly(!checked);
      setMessage("Error updating group permissions: " + res.error);
    } else {
      setMessage(
        checked
          ? "🔒 Announcement Mode activated: Only admins can message."
          : "💬 Discussion Mode activated: All members can message."
      );
      setTimeout(() => setMessage(null), 3500);
    }
  }

  async function handleAddMember(studentId?: string) {
    const targetId = studentId || selectedStudent?.id;
    if (!targetId) return;
    setIsPending(true);
    setMessage(null);
    const res = await addMemberToGroup(group.id, targetId);
    setIsPending(false);

    if (res.error) {
      setMessage("Error: " + res.error);
    } else {
      setSelectedStudent(null);
      setStudentSearch("");
      setMessage("Member added successfully! ✅");
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleConfirmRemoveMember() {
    if (!memberToRemove) return;
    setIsPending(true);
    await removeMemberFromGroup(group.id, memberToRemove.id);
    setIsPending(false);
    setMemberToRemove(null);
  }

  async function handleConfirmDeleteGroup() {
    setIsPending(true);
    const res = await deleteGroup(group.id);
    setIsPending(false);
    if (res.error) {
      setMessage("Error deleting group: " + res.error);
      setShowDeleteModal(false);
    } else {
      router.push("/community");
      router.refresh();
    }
  }

  const memberIds = members.map((m) => m.user_id || m.profile?.id);
  const nonMembers = students.filter(
    (s) =>
      !memberIds.includes(s.id) &&
      ((s.full_name?.toLowerCase() || "").includes(studentSearch.toLowerCase()) ||
        (s.email?.toLowerCase() || "").includes(studentSearch.toLowerCase()))
  );

  const filteredMembers = members.filter((m) => {
    const name = m.profile?.full_name?.toLowerCase() || "";
    const email = isAdmin ? m.profile?.email?.toLowerCase() || "" : "";
    return name.includes(memberSearch.toLowerCase()) || email.includes(memberSearch.toLowerCase());
  });

  return (
    <>
      {/* Header Bar */}
      <div className="border-b border-gray-200 dark:border-white/10 bg-[#e9edef] dark:bg-[#202c33] px-4 py-3 sm:px-6 flex items-center justify-between shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center gap-3 cursor-pointer" onClick={openDrawer}>
          <a
            href="/community"
            className="lg:hidden text-emerald-600 dark:text-emerald-400 hover:bg-black/5 p-2 -ml-2 rounded-full"
            onClick={(e) => e.stopPropagation()}
          >
            <ArrowLeft size={20} />
          </a>
          <div className="grid size-10 place-items-center rounded-full bg-emerald-700 text-white font-black text-xs shrink-0">
            {group.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-gray-900 dark:text-cream leading-tight flex items-center gap-2">
              {group.name}
              {isAdminOnly && (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock size={10} /> Announcement
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-500 dark:text-cream/60 truncate max-w-[200px] sm:max-w-md">
              {members.length} members {group.description ? `• ${group.description}` : ""}
            </p>
          </div>
        </div>

        {/* Action Badge */}
        <button
          onClick={openDrawer}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-600/10 hover:bg-emerald-600/20 px-3.5 py-1.5 rounded-full transition shadow-sm"
        >
          <Users2 size={15} /> Group Info
        </button>
      </div>

      {/* Group Info & Member Management Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#111b21] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-[#e9edef] dark:bg-[#202c33] flex items-center justify-between">
              <h3 className="font-black text-gray-900 dark:text-cream text-lg flex items-center gap-2">
                <Users2 className="text-emerald-600" size={20} /> Group Info & Settings
              </h3>
              <button
                onClick={() => setShowDrawer(false)}
                className="grid size-8 place-items-center rounded-full text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Group Details */}
              <div className="text-center p-4 bg-emerald-50 dark:bg-white/5 rounded-2xl border border-emerald-500/20">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-700 text-white font-black text-xl mb-3 shadow-md">
                  {group.name.substring(0, 2).toUpperCase()}
                </div>
                <h4 className="font-black text-lg text-gray-900 dark:text-cream">{group.name}</h4>
                <p className="text-xs text-gray-500 dark:text-cream/60 mt-1">
                  {group.description || "No description set."}
                </p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {members.length} members
                </p>
              </div>

              {message && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/30">
                  {message}
                </div>
              )}

              {/* Admin Settings: Announcement Mode Toggle */}
              {isAdmin && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-cream flex items-center gap-1.5">
                        <Lock size={14} className="text-amber-500" /> Announcement Only Mode
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-cream/60 mt-0.5">
                        When enabled, only admins can send messages.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAdminOnly}
                        onChange={handleToggleAdminOnly}
                        disabled={isPending}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Admin: Add Member Section with Live Search */}
              {isAdmin && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <UserPlus size={15} /> Add Member to Group
                  </h5>

                  {loadingStudents ? (
                    <p className="text-xs text-gray-500">Loading students...</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-cream/40"
                        />
                        <input
                          type="text"
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          placeholder="Search student by name or email..."
                          className="w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-white/10 dark:bg-[#202c33] dark:text-cream placeholder:text-gray-400 dark:placeholder:text-cream/40"
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-200/50 dark:divide-white/5">
                        {nonMembers.length === 0 ? (
                          <p className="text-[11px] text-gray-400 dark:text-cream/40 py-2 text-center">
                            {studentSearch ? "No matching students found." : "All students added to this group."}
                          </p>
                        ) : (
                          nonMembers.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-white/10 transition cursor-pointer"
                              onClick={() => handleAddMember(s.id)}
                            >
                              <div className="overflow-hidden">
                                <p className="text-xs font-bold text-gray-900 dark:text-cream truncate flex items-center gap-1.5">
                                  {s.full_name || "Student"}
                                  {s.isPaid && (
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">
                                      Enrolled
                                    </span>
                                  )}
                                </p>
                                {isAdmin && s.email && (
                                  <p className="text-[10px] text-gray-400 truncate">{s.email}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                disabled={isPending}
                                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 transition shrink-0"
                              >
                                <UserPlus size={12} /> Add
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Members List with Search */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-cream/50">
                    Group Members ({members.length})
                  </h5>
                </div>

                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-cream/40"
                  />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search group members..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-1.5 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-white/10 dark:bg-[#202c33] dark:text-cream"
                  />
                </div>

                <div className="space-y-2">
                  {filteredMembers.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No matching members found.</p>
                  ) : (
                    filteredMembers.map((m) => {
                      const profile = m.profile || {};
                      const isMemAdmin = profile.role === "admin";
                      const isSelf = (m.user_id || profile.id) === currentUserId;

                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-xl bg-gray-50 p-2.5 dark:bg-white/5 border border-gray-200/50 dark:border-white/5"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="grid size-8 place-items-center rounded-full bg-emerald-700 text-white font-bold text-xs shrink-0">
                              {(profile.full_name || profile.email || "M").substring(0, 2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-gray-900 dark:text-cream flex items-center gap-1.5 truncate">
                                <span className="truncate">{profile.full_name || "Student"}</span>
                                {isMemAdmin && (
                                  <span className="rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0.5 font-bold flex items-center gap-0.5 shrink-0">
                                    <ShieldCheck size={10} /> Admin
                                  </span>
                                )}
                                {isSelf && <span className="text-[10px] text-gray-400 shrink-0">(You)</span>}
                              </p>
                              {isAdmin && profile.email && (
                                <p className="text-[10px] text-gray-500 dark:text-cream/50 truncate">
                                  {profile.email}
                                </p>
                              )}
                            </div>
                          </div>

                          {isAdmin && !isSelf && (
                            <button
                              onClick={() =>
                                setMemberToRemove({
                                  id: m.user_id || profile.id,
                                  name: profile.full_name || "User",
                                })
                              }
                              disabled={isPending}
                              className="grid size-7 place-items-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                              title="Remove member"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Delete Group Action for Admin */}
              {isAdmin && (
                <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 py-2.5 px-4 text-xs font-bold text-red-600 dark:text-red-400 transition"
                  >
                    <Trash2 size={15} /> Delete Group
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111b21] p-6 shadow-2xl border border-gray-200 dark:border-white/10 text-center space-y-4">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-cream">Delete Community Group?</h3>
              <p className="text-xs text-gray-500 dark:text-cream/60 mt-1">
                Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-cream">"{group.name}"</span>? All messages and member records will be permanently deleted.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-gray-300 dark:border-white/10 py-2 text-xs font-bold text-gray-700 dark:text-cream hover:bg-gray-100 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGroup}
                disabled={isPending}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
              >
                {isPending ? "Deleting..." : "Delete Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111b21] p-6 shadow-2xl border border-gray-200 dark:border-white/10 text-center space-y-4">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-cream">Remove Member?</h3>
              <p className="text-xs text-gray-500 dark:text-cream/60 mt-1">
                Are you sure you want to remove <span className="font-bold text-gray-900 dark:text-cream">{memberToRemove.name}</span> from this group?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-gray-300 dark:border-white/10 py-2 text-xs font-bold text-gray-700 dark:text-cream hover:bg-gray-100 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveMember}
                disabled={isPending}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
              >
                {isPending ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
