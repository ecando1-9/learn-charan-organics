import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureLmsProfile } from "@/lib/supabase/profile";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await ensureLmsProfile(supabase, data.user);
    }
  }

  // Always redirect to dashboard after Google OAuth.
  // The /dashboard page handles role-based routing from there.
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
