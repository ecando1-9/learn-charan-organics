"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function sendGroupMessage(
  groupId: string,
  body: string,
  resourceLink?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify membership
  const { data: member } = await supabase
    .from("lms_group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) return { error: "Not a member of this group" };

  const { error } = await supabase.from("lms_group_messages").insert({
    group_id: groupId,
    user_id: user.id,
    body: body.trim(),
    resource_link: resourceLink?.trim() || null,
  });

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

  if (isAdmin) {
    const { data } = await supabase
      .from("lms_groups")
      .select("*")
      .order("created_at", { ascending: false });
    return { groups: data ?? [], isAdmin };
  }

  const { data } = await supabase
    .from("lms_group_members")
    .select(`
      group_id,
      joined_at,
      lms_groups (
        id,
        name,
        description,
        cover_image_url,
        created_at
      )
    `)
    .eq("user_id", user.id);

  const mappedGroups = (data ?? []).map((row: any) => ({
    ...row.lms_groups,
    joined_at: row.joined_at,
  }));

  return { groups: mappedGroups, isAdmin };
}

export async function getGroupMessages(groupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("lms_group_messages")
    .select(`
      id, group_id, user_id, body, resource_link, created_at,
      lms_profiles ( full_name, email, avatar_url )
    `)
    .eq("group_id", groupId)
    .order("created_at", { ascending: true })
    .limit(100);

  return (data ?? []).map((row: any) => ({
    ...row,
    profile: row.lms_profiles,
  }));
}

export async function getGroupMembers(groupId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lms_group_members")
    .select(`
      id, group_id, user_id, joined_at,
      lms_profiles ( full_name, email, avatar_url )
    `)
    .eq("group_id", groupId);

  return (data ?? []).map((row: any) => ({
    ...row,
    profile: row.lms_profiles,
  }));
}
