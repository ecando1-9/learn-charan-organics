"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkUserIsAdmin, syncAuthUsersToLmsProfiles } from "@/lib/supabase/profile";

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

  // Check user profile & role reliably
  const isAdmin = await checkUserIsAdmin(user.id, user.email);

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

  const clientToUse = isAdmin ? createAdminClient() : supabase;
  const { error } = await clientToUse.from("lms_group_messages").insert({
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

  const isAdmin = await checkUserIsAdmin(user.id, user.email);

  if (!isAdmin) {
    return { error: "Only admins can change group settings." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
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

  const isAdmin = await checkUserIsAdmin(user.id, user.email);

  if (!isAdmin) {
    return { error: "Only admins can create community groups." };
  }

  const adminClient = createAdminClient();
  const { data: group, error } = await adminClient
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
  await adminClient.from("lms_group_members").insert({
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

  const isAdmin = await checkUserIsAdmin(user.id, user.email);

  if (!isAdmin) {
    return { error: "Only admins can manage group members." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
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

  const isAdmin = await checkUserIsAdmin(user.id, user.email);

  if (!isAdmin) {
    return { error: "Only admins can manage group members." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
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

  const isAdmin = await checkUserIsAdmin(user.id, user.email);
  const adminClient = createAdminClient();

  function withSlug(g: any) {
    const s = (g.slug || g.name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return { ...g, slug: s || "group" };
  }

  // 1. Fetch all groups
  const { data: allGroups } = await adminClient
    .from("lms_groups")
    .select("*")
    .order("created_at", { ascending: false });

  if (!allGroups || allGroups.length === 0) {
    return { groups: [], isAdmin };
  }

  // Find the default official announcement group (Welcome or announcement group)
  const defaultGroup = allGroups.find(
    (g: any) =>
      g.name.toLowerCase().includes("welcome") ||
      g.name.toLowerCase().includes("announcement") ||
      g.admin_only_messaging === true
  ) || allGroups[0];

  let visibleGroups: any[] = [];

  if (isAdmin) {
    // Admin sees all groups
    visibleGroups = allGroups;
  } else {
    // Make sure student is in default group
    if (defaultGroup) {
      await adminClient
        .from("lms_group_members")
        .upsert({ group_id: defaultGroup.id, user_id: user.id }, { onConflict: "group_id,user_id" });
    }

    // For non-admin, find groups user is specifically enrolled in
    const { data: memberRows } = await supabase
      .from("lms_group_members")
      .select("group_id")
      .eq("user_id", user.id);

    const allowedGroupIds = new Set((memberRows ?? []).map((m: any) => m.group_id).filter(Boolean));
    if (defaultGroup) {
      allowedGroupIds.add(defaultGroup.id);
    }

    visibleGroups = allGroups.filter((g: any) => allowedGroupIds.has(g.id));
  }

  if (visibleGroups.length === 0) {
    return { groups: [], isAdmin };
  }

  // 2. Fetch the latest messages for visible groups to sort by most recent activity
  const groupIds = visibleGroups.map((g: any) => g.id);
  const { data: messages } = await adminClient
    .from("lms_group_messages")
    .select("group_id, body, file_name, file_type, created_at")
    .in("group_id", groupIds)
    .order("created_at", { ascending: false });

  // Map latest message per group
  const latestMessageMap = new Map<string, { body: string; created_at: string }>();
  (messages ?? []).forEach((m: any) => {
    if (!latestMessageMap.has(m.group_id)) {
      const preview = m.body?.trim() || (m.file_name ? `📎 ${m.file_name}` : "Shared an attachment");
      latestMessageMap.set(m.group_id, {
        body: preview,
        created_at: m.created_at,
      });
    }
  });

  const enriched = visibleGroups.map((g: any) => {
    const latest = latestMessageMap.get(g.id);
    const item = withSlug(g);
    return {
      ...item,
      last_message_text: latest?.body || g.description || "Tap to open chat...",
      last_message_at: latest?.created_at || g.created_at,
      has_messages: Boolean(latest),
    };
  });

  // Sort groups: latest message coming or sending at the very top!
  enriched.sort((a: any, b: any) => {
    const timeA = new Date(a.last_message_at).getTime();
    const timeB = new Date(b.last_message_at).getTime();
    return timeB - timeA;
  });

  return { groups: enriched, isAdmin };
}

function resolveDisplayName(profile?: { full_name?: string | null; email?: string | null; id?: string }): string {
  if (!profile) return "Student";
  const fn = profile.full_name?.trim();
  if (fn && fn.toLowerCase() !== "student" && fn.toLowerCase() !== "member" && fn.toLowerCase() !== "user") {
    return fn;
  }
  if (profile.email && profile.email.includes("@")) {
    const handle = profile.email.split("@")[0];
    return handle.charAt(0).toUpperCase() + handle.slice(1);
  }
  if (profile.id) return `Student ${profile.id.slice(0, 4)}`;
  return "Student";
}

async function getCurrentUserRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, isAdmin: false };

  const isAdmin = await checkUserIsAdmin(user.id, user.email);

  return { supabase, user, isAdmin };
}

function communityProfile(p: any, canSeeEmail: boolean) {
  return {
    ...p,
    full_name: resolveDisplayName(p),
    email: p.email ?? "",
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
    const admin = createAdminClient();
    const chunkSize = 50;
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      const { data: profiles } = await admin
        .from("lms_profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", chunk);

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
  const { isAdmin } = await getCurrentUserRole();
  const admin = createAdminClient();

  const { data: rawMembers, error } = await admin
    .from("lms_group_members")
    .select("id, group_id, user_id, joined_at")
    .eq("group_id", groupId);

  if (error || !rawMembers || rawMembers.length === 0) {
    return [];
  }

  const userIds = Array.from(new Set(rawMembers.map((m: any) => m.user_id).filter(Boolean)));
  const profileMap = new Map<string, any>();

  if (userIds.length > 0) {
    const chunkSize = 50;
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      const { data: profiles } = await admin
        .from("lms_profiles")
        .select("id, full_name, email, avatar_url, role")
        .in("id", chunk);

      (profiles ?? []).forEach((p: any) => {
        profileMap.set(p.id, communityProfile(p, isAdmin));
      });
    }
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
  const { isAdmin } = await getCurrentUserRole();
  if (!isAdmin) return [];

  // Ensure all registered auth users are synced into lms_profiles
  try {
    await syncAuthUsersToLmsProfiles();
  } catch (err) {
    console.warn("[getAllStudents] Auto-sync auth users error:", err);
  }

  const admin = createAdminClient();

  // Get ALL registered students and active enrollments
  const [profilesRes, enrollmentsRes] = await Promise.all([
    admin
      .from("lms_profiles")
      .select("id, full_name, email, role")
      .neq("role", "admin")
      .order("full_name"),
    admin
      .from("lms_enrollments")
      .select("user_id, course_id, status")
      .eq("status", "active"),
  ]);

  const profiles = profilesRes.data ?? [];
  const enrollments = enrollmentsRes.data ?? [];

  const courseIds = Array.from(new Set(enrollments.map((e: any) => e.course_id).filter(Boolean)));
  const courseMap = new Map<string, string>();

  if (courseIds.length > 0) {
    const { data: courses } = await admin
      .from("lms_courses")
      .select("id, title")
      .in("id", courseIds);

    (courses ?? []).forEach((c: any) => courseMap.set(c.id, c.title));
  }

  return profiles.map((p: any) => {
    const userEnrolls = enrollments.filter((e: any) => e.user_id === p.id);
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

  const isAdmin = await checkUserIsAdmin(user.id, user.email);

  if (!isAdmin) {
    return { error: "Only admins can delete community groups." };
  }

  const adminClient = createAdminClient();
  await adminClient.from("lms_group_messages").delete().eq("group_id", groupId);
  await adminClient.from("lms_group_members").delete().eq("group_id", groupId);

  const { error } = await adminClient.from("lms_groups").delete().eq("id", groupId);

  if (error) return { error: error.message };

  revalidatePath("/community");
  return { success: true };
}
