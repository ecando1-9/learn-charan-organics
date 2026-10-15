"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getServerAppUrl } from "@/lib/site-url";
import { sendPasswordResetEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export type PasswordResetResult = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * Dynamically resolves the origin of the website requesting the password reset.
 * Ensures the link targets THIS website (learn.charanorganics.com or localhost),
 * NEVER falling back to another domain (like www.charanorganics.com).
 */
async function getActiveOrigin(): Promise<string> {
  try {
    const headersList = await headers();
    const origin = headersList.get("origin");
    if (origin && origin !== "null" && origin !== "undefined") {
      return origin.trim().replace(/\/$/, "");
    }
    const host = headersList.get("x-forwarded-host") || headersList.get("host");
    if (host) {
      const proto =
        headersList.get("x-forwarded-proto") ||
        (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
      return `${proto}://${host}`.trim().replace(/\/$/, "");
    }
  } catch {
    // In case headers() is called outside request context
  }
  return getServerAppUrl();
}

/**
 * Initiates a password reset request.
 * CRITICAL: Checks whether the user exists in the system before attempting to send any email.
 * If user does not exist, returns an explicit error to prevent false positives.
 */
export async function requestPasswordReset(emailInput: string): Promise<PasswordResetResult> {
  const email = (emailInput || "").trim().toLowerCase();

  // Basic email validation
  if (!email || !email.includes("@") || !email.includes(".")) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (err: any) {
    console.error("[requestPasswordReset] Admin client initialization failed:", err);
    return {
      success: false,
      error: "Authentication service is temporarily unavailable. Please try again in a few moments.",
    };
  }

  // 1. Verify user existence in lms_profiles
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
    console.warn("[requestPasswordReset] lms_profiles query notice:", dbErr?.message || dbErr);
  }

  // 2. If not found in lms_profiles, check auth.users directly via admin API
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
      console.warn("[requestPasswordReset] listUsers check notice:", authErr?.message || authErr);
    }
  }

  // 3. User does NOT exist in the database — halt immediately and report error
  if (!userExists) {
    return {
      success: false,
      error: "No account found with this email address. Please check your spelling or register for a new account.",
    };
  }

  // User exists! Dynamically resolve origin for THIS website
  const origin = await getActiveOrigin();
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
      console.error("[requestPasswordReset] generateLink error:", linkRes.error.message);
    } else if (linkRes.data?.properties) {
      actionLink = linkRes.data.properties.action_link;
      hashedToken = linkRes.data.properties.hashed_token;
      emailOtp = linkRes.data.properties.email_otp;
    }
  } catch (genErr: any) {
    console.error("[requestPasswordReset] generateLink exception:", genErr?.message || genErr);
  }

  /**
   * DIRECT ACADEMY RESET LINK:
   * Points directly to THIS website's /auth/callback route with the token_hash.
   * This completely bypasses Supabase's default Site URL redirect (which sent users to www.charanorganics.com).
   */
  const directResetUrl = hashedToken
    ? `${origin}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=recovery&next=/reset-password`
    : (actionLink || `${origin}/reset-password`);

  // Deliver via Resend if API key is present
  if (process.env.RESEND_API_KEY && (hashedToken || actionLink)) {
    const emailResult = await sendPasswordResetEmail({
      toEmail: email,
      userName,
      resetLink: directResetUrl,
      otpCode: emailOtp || undefined,
      appUrl: origin,
    });

    if (emailResult.success) {
      return {
        success: true,
        message: "Password reset link sent! Check your inbox (and spam folder) to set a new password.",
      };
    }
    console.warn("[requestPasswordReset] Resend email failed, trying Supabase native reset:", emailResult.error);
  }

  // Fallback: Trigger Supabase Auth's built-in reset email
  try {
    const supabase = await createClient();
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetErr) {
      console.error("[requestPasswordReset] Supabase resetPasswordForEmail error:", resetErr.message);
      return {
        success: false,
        error: resetErr.message || "Failed to send reset email. Please try again later.",
      };
    }

    return {
      success: true,
      message: "Password reset link sent! Check your inbox to set a new password.",
    };
  } catch (err: any) {
    console.error("[requestPasswordReset] Unexpected error:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server action to update user password when a session is active.
 */
export async function resetPasswordAction(newPassword: string): Promise<PasswordResetResult> {
  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters long.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: "Password updated successfully!",
    };
  } catch (err: any) {
    console.error("[resetPasswordAction] Error:", err);
    return {
      success: false,
      error: err?.message || "Failed to update password.",
    };
  }
}
