import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "yuvakiranreddy7@gmail.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function getDefaultLmsRole(email?: string | null) {
  return email && ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "student";
}

/**
 * Ensures lms_profiles row exists without overwriting existing role (admin/student).
 */
export async function ensureLmsProfile(user: User) {
  try {
    const admin = createAdminClient();

    // Step 1: Check if profile already exists
    const { data: existing } = await admin
      .from("lms_profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    const fullName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      "";
    const avatarUrl = user.user_metadata?.avatar_url ?? null;

    if (existing) {
      // Update profile info without touching existing role!
      await admin
        .from("lms_profiles")
        .update({
          full_name: fullName || undefined,
          email: user.email ?? "",
          avatar_url: avatarUrl || undefined,
        })
        .eq("id", user.id);
    } else {
      await admin.from("lms_profiles").upsert(
        {
          id: user.id,
          full_name: fullName,
          email: user.email ?? "",
          avatar_url: avatarUrl,
          role: getDefaultLmsRole(user.email),
        },
        { onConflict: "id", ignoreDuplicates: true }
      );
    }
  } catch (err: any) {
    console.error("[ensureLmsProfile] Unexpected error:", err?.message || err);
  }
}

export async function syncAuthUsersToLmsProfiles() {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw error;
  }

  const users = data.users ?? [];
  if (users.length === 0) return;

  const userIds = users.map((user) => user.id);
  const { data: existingProfiles } = await admin
    .from("lms_profiles")
    .select("id")
    .in("id", userIds);

  const existingIds = new Set((existingProfiles ?? []).map((profile) => profile.id));
  const missingProfiles = users
    .filter((user) => !existingIds.has(user.id))
    .map((user) => ({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
      email: user.email ?? "",
      avatar_url: user.user_metadata?.avatar_url ?? null,
      role: getDefaultLmsRole(user.email),
    }));

  if (missingProfiles.length > 0) {
    const { error: insertError } = await admin
      .from("lms_profiles")
      .upsert(missingProfiles, { onConflict: "id", ignoreDuplicates: true });

    if (insertError) {
      throw insertError;
    }
  }
}
