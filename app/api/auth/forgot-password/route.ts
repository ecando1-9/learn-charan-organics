import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerAppUrl } from "@/lib/site-url";
import { sendPasswordResetEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();

    // 1. Validate email
    if (!email || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch (err: any) {
      console.error("[forgot-password API] Admin client initialization failed:", err);
      return NextResponse.json(
        { success: false, error: "Authentication service is temporarily unavailable." },
        { status: 500 }
      );
    }

    // 2. Check if user exists in lms_profiles
    let userExists = false;
    let userName: string | undefined = undefined;

    try {
      const { data: profile } = await adminClient
        .from("lms_profiles")
        .select("id, email, full_name")
        .ilike("email", email)
        .maybeSingle();

      if (profile) {
        userExists = true;
        userName = profile.full_name || undefined;
      }
    } catch (dbErr: any) {
      console.warn("[forgot-password API] lms_profiles query notice:", dbErr?.message || dbErr);
    }

    // 3. Fallback check in auth.users
    if (!userExists) {
      try {
        const { data: usersData, error: usersErr } = await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

        if (!usersErr && usersData?.users) {
          const found = usersData.users.find((u) => u.email?.toLowerCase() === email);
          if (found) {
            userExists = true;
            userName = found.user_metadata?.full_name || found.user_metadata?.name || undefined;
          }
        }
      } catch (authErr: any) {
        console.warn("[forgot-password API] listUsers notice:", authErr?.message || authErr);
      }
    }

    // Halt if user does NOT exist
    if (!userExists) {
      return NextResponse.json(
        {
          success: false,
          error: "No account found with this email address. Please check your spelling or register for a new account.",
        },
        { status: 404 }
      );
    }

    // 4. Resolve origin dynamically from incoming request
    const origin =
      request.headers.get("origin") ||
      request.nextUrl.origin ||
      getServerAppUrl();

    const redirectTo = `${origin}/auth/callback?next=/reset-password`;

    let actionLink: string | null = null;
    let hashedToken: string | null = null;
    let emailOtp: string | null = null;

    try {
      const linkRes = await adminClient.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo,
        },
      });

      if (linkRes.error) {
        console.error("[forgot-password API] generateLink error:", linkRes.error.message);
      } else if (linkRes.data?.properties) {
        actionLink = linkRes.data.properties.action_link;
        hashedToken = linkRes.data.properties.hashed_token;
        emailOtp = linkRes.data.properties.email_otp;
      }
    } catch (genErr: any) {
      console.error("[forgot-password API] generateLink exception:", genErr?.message || genErr);
    }

    // Direct Academy reset link — completely bypasses Supabase default Site URL
    const directResetUrl = hashedToken
      ? `${origin}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=recovery&next=/reset-password`
      : (actionLink || `${origin}/reset-password`);

    // 5. Send via Resend
    if (process.env.RESEND_API_KEY && (hashedToken || actionLink)) {
      const emailResult = await sendPasswordResetEmail({
        toEmail: email,
        userName,
        resetLink: directResetUrl,
        otpCode: emailOtp || undefined,
        appUrl: origin,
      });

      if (emailResult.success) {
        return NextResponse.json({
          success: true,
          message: "Password reset link sent! Check your inbox (and spam folder) to set a new password.",
        });
      }
      console.warn("[forgot-password API] Resend email notice, trying Supabase native reset:", emailResult.error);
    }

    // Fallback: Supabase native email
    try {
      const supabase = await createClient();
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetErr) {
        return NextResponse.json(
          { success: false, error: resetErr.message || "Failed to send reset email." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Password reset link sent! Check your inbox to set a new password.",
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err?.message || "Failed to send email." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[forgot-password API] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
