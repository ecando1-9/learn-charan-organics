import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureLmsProfile } from "@/lib/supabase/profile";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next");
  const authError = requestUrl.searchParams.get("error");
  const authErrorDescription = requestUrl.searchParams.get("error_description");

  // Determine safe redirect destination
  let destination = "/dashboard";
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    destination = next;
  }

  // Handle explicit errors passed from auth provider
  if (authError) {
    console.error("[auth/callback] Provider error:", authError, authErrorDescription);
    if (destination.includes("reset-password")) {
      return NextResponse.redirect(
        new URL(
          `/reset-password?error=${encodeURIComponent(authErrorDescription || "invalid_link")}`,
          requestUrl.origin
        )
      );
    }
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(authErrorDescription || "Authentication failed")}`, requestUrl.origin)
    );
  }

  const supabase = await createClient();

  // 1. Direct recovery link with token_hash (from Academy reset emails)
  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (verifyError) {
      console.error("[auth/callback] verifyOtp failed:", verifyError.message);
      return NextResponse.redirect(
        new URL(
          `/reset-password?error=${encodeURIComponent(
            verifyError.message.includes("expired") ? "expired" : verifyError.message
          )}`,
          requestUrl.origin
        )
      );
    }

    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      await ensureLmsProfile(data.user);
    }

    return NextResponse.redirect(new URL(destination, requestUrl.origin));
  }

  // 2. PKCE code exchange
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[auth/callback] exchangeCodeForSession failed:", exchangeError.message);
      if (destination.includes("reset-password")) {
        return NextResponse.redirect(
          new URL("/reset-password?error=expired", requestUrl.origin)
        );
      }
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      );
    }

    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      // Uses admin/service-role client internally to bypass RLS
      await ensureLmsProfile(data.user);
    }
  }

  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
