import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function ensureLmsProfile(supabase: SupabaseClient, user: User) {
  const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
  const avatarUrl = user.user_metadata?.avatar_url ?? null;

  return supabase.from("lms_profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      email: user.email ?? "",
      avatar_url: avatarUrl
    },
    { onConflict: "id" }
  );
}
