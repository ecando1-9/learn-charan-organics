"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ensureLmsProfile, getDefaultLmsRole } from "@/lib/supabase/profile";

/**
 * Server Action: ensure lms_profiles row exists for the current session user
 * without promoting normal signups to admin.
 */
export async function syncUserProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await ensureLmsProfile(user);
  } catch (err: any) {
    console.error("[syncUserProfile] Error:", err?.message || err);
  }
}

/**
 * Grants Admin role to current logged in user instantly.
 */
export async function grantAdminRoleToCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };

    const admin = createAdminClient();

    const { error } = await admin
      .from("lms_profiles")
      .upsert(
        {
          id: user.id,
          email: user.email ?? "",
          full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Admin",
          avatar_url: user.user_metadata?.avatar_url ?? null,
          role: getDefaultLmsRole(user.email),
        },
        { onConflict: "id" }
      );

    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Failed to grant admin role" };
  }
}
