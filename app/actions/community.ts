"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function sendGroupMessage(
  groupId: string,
  body: string,
  resourceLink?: string,
  attachment?: { url: string; fileName: string; fileType: string }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Check user profile & role
  const { data: profile } = await supabase
    .from("lms_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";

  // Check group settings (Admin Only Messaging)
  const { data: group } = await supabase
    .from("lms_groups")
    .select("admin_only_messaging")
    .eq("id", groupId)
    .single();

  if (group?.admin_only_messaging && !isAdmin) {
    return { error: "Only admins can send messages in this group." };
  }

  if (!isAdmin) {
    // Verify membership
    const { data: member } = await supabase
      .from("lms_group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member) return { error: "Not a member of this group" };
  }

  const { error } = await supabase.from("lms_group_messages").insert({
    group_id: groupId,
    user_id: user.id,
    body: body.trim(),
    resource_link: resourceLink?.trim() || null,
    file_url: attachment?.url || null,
    file_name: attachment?.fileName || null,
    file_type: attachment?.fileType || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/community/${groupId}`);
  return { success: true };
}

export async function toggleAdminOnlyMessaging(groupId: string, adminOnly: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("lms_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only admins can change group settings." };
  }

  const { error } = await supabase
    .from("lms_groups")
    .update({ admin_only_messaging: adminOnly })
    .eq("id", groupId);

  if (error) return { error: error.message };

  revalidatePath(`/community/${groupId}`);
  return { success: true };
}

export async function createGroup(name: string, description?: string, adminOnly = false) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("lms_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only admins can create community groups." };
  }

  const { data: group, error } = await supabase
    .from("lms_groups")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      created_by: user.id,
      admin_only_messaging: adminOnly,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Automatically add creator as first member
  await supabase.from("lms_group_members").insert({
    group_id: group.id,
    user_id: user.id,
  });

  revalidatePath("/community");
  return { success: true, group };
}

export async function addMemberToGroup(groupId: string, userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("lms_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only admins can manage group members." };
  }

  const { error } = await supabase
    .from("lms_group_members")
    .upsert({ group_id: groupId, user_id: userId }, { onConflict: "group_id,user_id" });

  if (error) return { error: error.message };

  revalidatePath(`/community/${groupId}`);
  return { success: true };
}

export async function removeMemberFromGroup(groupId: string, userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("lms_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only admins can manage group members." };
  }

  const { error } = await supabase
    .from("lms_group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath(`/community/${groupId}`);
  return { success: true };
}

export async function getMyGroups() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { groups: [], isAdmin: false };

  const { data: profile } = await supabase
    .from("lms_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  function withSlug(g: any) {
    const s = (g.slug || g.name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return { ...g, slug: s || "group" };
  }

  if (isAdmin) {
    const { data } = await supabase
      .from("lms_groups")
      .select("*")
      .order("created_at", { ascending: false });
    return { groups: (data ?? []).map(withSlug), isAdmin };
  }

  const { data: memberRows } = await supabase
    .from("lms_group_members")
    .select("group_id")
    .eq("user_id", user.id);

  const groupIds = Array.from(new Set((memberRows ?? []).map((m: any) => m.group_id).filter(Boolean)));

  if (groupIds.length === 0) {
    return { groups: [], isAdmin };
  }

  const { data: groups } = await supabase
    .from("lms_groups")
    .select("*")
    .in("id", groupIds)
    .order("created_at", { ascending: false });

  return { groups: (groups ?? []).map(withSlug), isAdmin };
}

function resolveDisplayName(profile?: { full_name?: string | null; email?: string | null; id?: string }): string {
  if (!profile) return "User";
  const fn = profile.full_name?.trim();
  if (fn && fn.toLowerCase() !== "student" && fn.toLowerCase() !== "member") return fn;
  if (profile.email && profile.email.includes("@")) return profile.email.split("@")[0];
  if (profile.id) return `User (${profile.id.slice(0, 4)})`;
  return "User";
}

async function getCurrentUserRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("lms_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, isAdmin: profile?.role === "admin" };
}

function communityProfile(p: any, canSeeEmail: boolean) {
  return {
    ...p,
    full_name: resolveDisplayName(p),
    email: canSeeEmail ? p.email ?? "" : "",
  };
}

export async function getGroupMessages(groupId: string) {
  const { supabase, isAdmin } = await getCurrentUserRole();

  const { data: rawMessages, error } = await supabase
    .from("lms_group_messages")
    .select("id, group_id, user_id, body, resource_link, file_url, file_name, file_type, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true })
    .limit(300);

  if (error || !rawMessages || rawMessages.length === 0) {
    return [];
  }

  const userIds = Array.from(new Set(rawMessages.map((m: any) => m.user_id).filter(Boolean)));
  const profileMap = new Map<string, any>();

  if (userIds.length > 0) {
    try {
      const admin = createAdminClient();
      const { data: profiles } = await admin
        .from("lms_profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);

      (profiles ?? []).forEach((p: any) => {
        profileMap.set(p.id, communityProfile(p, isAdmin));
      });
    } catch {
      const { data: profiles } = await supabase
        .from("lms_profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);

      (profiles ?? []).forEach((p: any) => {
        profileMap.set(p.id, communityProfile(p, isAdmin));
      });
    }
  }

  return rawMessages.map((m: any) => {
    const prof = profileMap.get(m.user_id);
    return {
      ...m,
      profile: prof || {
        id: m.user_id,
        full_name: resolveDisplayName({ id: m.user_id }),
        email: "",
      },
    };
  });
}

export async function getGroupMembers(groupId: string) {
  const { supabase, isAdmin } = await getCurrentUserRole();

  const { data: rawMembers, error } = await supabase
    .from("lms_group_members")
    .select("id, group_id, user_id, joined_at")
    .eq("group_id", groupId);

  if (error || !rawMembers || rawMembers.length === 0) {
    return [];
  }

  const userIds = Array.from(new Set(rawMembers.map((m: any) => m.user_id).filter(Boolean)));
  const profileMap = new Map<string, any>();

  if (userIds.length > 0) {
    try {
      const admin = createAdminClient();
      const { data: profiles } = await admin
        .from("lms_profiles")
        .select("id, full_name, email, avatar_url, role")
        .in("id", userIds);

      (profiles ?? []).forEach((p: any) => {
        profileMap.set(p.id, communityProfile(p, isAdmin));
      });
    } catch {
      const { data: profiles } = await supabase
        .from("lms_profiles")
        .select("id, full_name, email, avatar_url, role")
        .in("id", userIds);

      (profiles ?? []).forEach((p: any) => {
        profileMap.set(p.id, communityProfile(p, isAdmin));
      });
    }
  }

  const realMembers = rawMembers
    .filter((m: any) => profileMap.has(m.user_id))
    .map((m: any) => ({
      ...m,
      profile: profileMap.get(m.user_id),
    }));

  if (realMembers.length > 0) {
    return realMembers;
  }

  return rawMembers.map((m: any) => {
    const prof = profileMap.get(m.user_id);
    return {
      ...m,
      profile: prof || {
        id: m.user_id,
        full_name: resolveDisplayName({ id: m.user_id }),
        email: "",
      },
    };
  });
}

export async function getAllStudents() {
  const { supabase, isAdmin } = await getCurrentUserRole();
  if (!isAdmin) return [];

  const { data: profiles } = await supabase
    .from("lms_profiles")
    .select("id, full_name, email, role")
    .order("full_name");

  const { data: enrollments } = await supabase
    .from("lms_enrollments")
    .select("user_id, course_id")
    .eq("status", "active");

  const courseIds = Array.from(new Set((enrollments ?? []).map((e: any) => e.course_id).filter(Boolean)));
  const courseMap = new Map<string, string>();

  if (courseIds.length > 0) {
    const { data: courses } = await supabase
      .from("lms_courses")
      .select("id, title")
      .in("id", courseIds);

    (courses ?? []).forEach((c: any) => courseMap.set(c.id, c.title));
  }

  return (profiles ?? []).map((p: any) => {
    const userEnrolls = (enrollments ?? []).filter((e: any) => e.user_id === p.id);
    const displayName = resolveDisplayName(p);
    return {
      ...p,
      full_name: displayName,
      isPaid: userEnrolls.length > 0,
      enrolledCourses: userEnrolls.map((e: any) => courseMap.get(e.course_id)).filter(Boolean),
    };
  });
}

export async function deleteGroup(groupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("lms_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only admins can delete community groups." };
  }

  await supabase.from("lms_group_messages").delete().eq("group_id", groupId);
  await supabase.from("lms_group_members").delete().eq("group_id", groupId);

  const { error } = await supabase.from("lms_groups").delete().eq("id", groupId);

  if (error) return { error: error.message };

  revalidatePath("/community");
  return { success: true };
}
