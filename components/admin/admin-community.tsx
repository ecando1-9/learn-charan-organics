"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, UserPlus, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Group } from "@/lib/types";

type Profile = { id: string; full_name: string | null; email: string };

export function AdminCommunity() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<Profile[]>([]);
  const [addingUser, setAddingUser] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });

  const supabase = createClient();

  async function fetchGroups() {
    setLoading(true);
    const { data } = await supabase.from("lms_groups").select("*").order("created_at", { ascending: false });
    setGroups((data ?? []) as Group[]);
    setLoading(false);
  }

  type ProfileWithEnrollments = Profile & { isPaid: boolean; enrolledCourses: string[] };
  const [students, setStudents] = useState<ProfileWithEnrollments[]>([]);

  async function fetchStudents() {
    // Fetch all profiles
    const { data: profiles } = await supabase.from("lms_profiles").select("id, full_name, email").order("full_name");
    
    // Fetch active enrollments
    const { data: enrollments } = await supabase.from("lms_enrollments").select("user_id, course_id, lms_courses(title)").eq("status", "active");

    const mapped = (profiles ?? []).map((p: any) => {
      const userEnrollments = (enrollments ?? []).filter((e: any) => e.user_id === p.id);
      return {
        ...p,
        isPaid: userEnrollments.length > 0,
        enrolledCourses: userEnrollments.map((e: any) => e.lms_courses?.title).filter(Boolean)
      };
    });

    setStudents(mapped as ProfileWithEnrollments[]);
  }

  async function fetchGroupMembers(groupId: string) {
    const { data } = await supabase
      .from("lms_group_members")
      .select("user_id, lms_profiles(id, full_name, email)")
      .eq("group_id", groupId);
    setGroupMembers((data ?? []).map((d: any) => d.lms_profiles) as Profile[]);
  }

  useEffect(() => { fetchGroups(); fetchStudents(); }, []);

  const router = useRouter();

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    try {
      const { error } = await supabase.from("lms_groups").insert({ name: form.name, description: form.description || null });
      if (error) {
        alert("Failed to create group: " + error.message);
        return;
      }
      setForm({ name: "", description: "" });
      setShowForm(false);
      await fetchGroups();
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  async function handleDeleteGroup(id: string) {
    if (!confirm("Delete this group and all its messages?")) return;
    setIsPending(true);
    try {
      const { error } = await supabase.from("lms_groups").delete().eq("id", id);
      if (error) {
        alert("Failed to delete group: " + error.message);
        return;
      }
      if (activeGroup?.id === id) setActiveGroup(null);
      await fetchGroups();
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  async function openGroup(g: Group) {
    setActiveGroup(g);
    await fetchGroupMembers(g.id);
  }

  async function handleAddMember() {
    if (!activeGroup || !addingUser) return;
    await supabase.from("lms_group_members").upsert({ group_id: activeGroup.id, user_id: addingUser }, { onConflict: "group_id,user_id" });
    setAddingUser("");
    fetchGroupMembers(activeGroup.id);
  }

  async function handleRemoveMember(userId: string) {
    if (!activeGroup) return;
    await supabase.from("lms_group_members").delete().eq("group_id", activeGroup.id).eq("user_id", userId);
    fetchGroupMembers(activeGroup.id);
  }

  const memberIds = groupMembers.map((m) => m.id);
  const nonMembers = students.filter((s) => !memberIds.includes(s.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">Admin</p>
          <h1 className="text-3xl font-black text-forest dark:text-cream">Community Groups</h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">Create groups and add students so they can chat and share resources.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-full bg-leaf px-4 py-2 text-sm font-bold text-white hover:bg-forest transition">
          <Plus size={16} /> New Group
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreateGroup} className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 space-y-4">
          <h2 className="font-black text-forest dark:text-cream">Create Group</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink/70 dark:text-cream/70">Group Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Soap Making Batch 2025"
                className="w-full rounded-2xl border border-forest/20 bg-linen px-4 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:border-white/10 dark:bg-white/5 dark:text-cream" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink/70 dark:text-cream/70">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What is this group about?"
                className="w-full rounded-2xl border border-forest/20 bg-linen px-4 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:border-white/10 dark:bg-white/5 dark:text-cream" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={isPending}
              className="rounded-full bg-leaf px-5 py-2 text-sm font-bold text-white hover:bg-forest transition disabled:opacity-50">
              {isPending ? "Creating..." : "Create Group"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-full border border-forest/20 px-5 py-2 text-sm font-bold text-ink/70 hover:bg-linen transition dark:border-white/10 dark:text-cream/70">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Groups list */}
        <div className="space-y-3">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-[2rem] bg-forest/10" />)
          ) : groups.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-soft dark:bg-white/5">
              <Users className="mx-auto mb-3 text-leaf" size={32} />
              <p className="font-black text-forest dark:text-cream">No groups yet</p>
              <p className="text-sm text-ink/60 dark:text-cream/60">Click "New Group" to create your first community group.</p>
            </div>
          ) : groups.map((g) => (
            <div key={g.id}
              onClick={() => openGroup(g)}
              className={`cursor-pointer rounded-[2rem] bg-white p-5 shadow-soft transition dark:bg-white/5 ${
                activeGroup?.id === g.id ? "ring-2 ring-leaf" : "hover:shadow-md"
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-forest dark:text-cream">{g.name}</p>
                  {g.description && <p className="text-xs text-ink/60 dark:text-cream/60 mt-0.5">{g.description}</p>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }}
                  className="grid size-8 place-items-center rounded-full text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Members panel */}
        {activeGroup ? (
          <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5">
            <h2 className="font-black text-forest dark:text-cream">{activeGroup.name} — Members</h2>
            <p className="mt-1 text-sm text-ink/60 dark:text-cream/60 mb-4">Add or remove students from this group.</p>

            {/* Add member */}
            <div className="mb-4 flex gap-2">
              <select value={addingUser} onChange={e => setAddingUser(e.target.value)}
                className="flex-1 rounded-2xl border border-forest/20 bg-linen px-3 py-2 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:border-white/10 dark:bg-white/5 dark:text-cream">
                <option value="">Select student to add...</option>
                {nonMembers.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name ?? s.email} {s.isPaid ? "✅ (Paid Student)" : ""}
                  </option>
                ))}
              </select>
              <button onClick={handleAddMember} disabled={!addingUser}
                className="inline-flex items-center gap-1 rounded-full bg-leaf px-4 py-2 text-sm font-bold text-white hover:bg-forest transition disabled:opacity-50">
                <UserPlus size={14} /> Add
              </button>
            </div>

            {/* Members list */}
            <div className="space-y-2">
              {groupMembers.length === 0 ? (
                <p className="text-sm text-ink/50 dark:text-cream/50">No members yet. Add students above.</p>
              ) : groupMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-2xl bg-linen px-4 py-2.5 dark:bg-white/5">
                  <div>
                    <p className="text-sm font-bold text-forest dark:text-cream">{m.full_name ?? m.email}</p>
                    {m.full_name && <p className="text-xs text-ink/50 dark:text-cream/50">{m.email}</p>}
                  </div>
                  <button onClick={() => handleRemoveMember(m.id)}
                    className="grid size-7 place-items-center rounded-full text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-[2rem] bg-white/50 p-12 text-center shadow-soft dark:bg-white/5">
            <div>
              <Users className="mx-auto mb-3 text-leaf/50" size={40} />
              <p className="text-sm text-ink/50 dark:text-cream/50">Select a group to manage its members</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
