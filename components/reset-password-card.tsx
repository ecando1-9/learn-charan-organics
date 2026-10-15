"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle2, AlertTriangle, ShieldCheck, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  // Fallback 6-digit code mode
  const [useOtpMode, setUseOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkAuthSession() {
      // 1. Check for URL error parameters in query string
      const urlError = searchParams.get("error");
      if (urlError) {
        if (mounted) {
          setMessage({
            text:
              urlError === "expired"
                ? "This password reset link has expired. You can use your 6-digit code below or request a new link."
                : `Reset link error: ${urlError}`,
            type: "error",
          });
          setCheckingSession(false);
        }
        return;
      }

      // 2. Check for URL error in hash fragment (e.g. from Supabase verify redirect)
      if (typeof window !== "undefined" && window.location.hash.includes("error")) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const hashError = hashParams.get("error_description") || hashParams.get("error");
        if (hashError && mounted) {
          setMessage({
            text: hashError.includes("expired")
              ? "This password reset link has expired. You can use your 6-digit security code below or request a new link."
              : hashError.replace(/\+/g, " "),
            type: "error",
          });
          setCheckingSession(false);
          return;
        }
      }

      // 3. Direct verification if token_hash is in URL query parameters
      const token_hash = searchParams.get("token_hash");
      if (token_hash) {
        try {
          const type = (searchParams.get("type") as any) || "recovery";
          const { error: tokenErr } = await supabase.auth.verifyOtp({
            token_hash,
            type,
          });

          if (!tokenErr && mounted) {
            setHasValidSession(true);
            setCheckingSession(false);
            return;
          } else if (tokenErr && mounted) {
            setMessage({
              text: tokenErr.message.includes("expired")
                ? "This password reset link has expired. You can enter your 6-digit code below or request a new link."
                : tokenErr.message,
              type: "error",
            });
          }
        } catch (err) {
          console.warn("[ResetPassword] token_hash verification notice:", err);
        }
      }

      // 4. Exchange PKCE code if present
      const code = searchParams.get("code");
      if (code) {
        try {
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeErr && mounted) {
            setHasValidSession(true);
            setCheckingSession(false);
            return;
          }
        } catch (err) {
          console.warn("[ResetPassword] Code exchange notice:", err);
        }
      }

      // 5. Check for existing session or hash fragment access_token
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          setHasValidSession(true);
          setCheckingSession(false);
          return;
        }

        if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
          if (mounted) {
            setHasValidSession(true);
            setCheckingSession(false);
          }
          return;
        }
      } catch (err) {
        console.warn("[ResetPassword] Session check notice:", err);
      }

      // 6. Listen to auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        if (event === "PASSWORD_RECOVERY" || session) {
          setHasValidSession(true);
          setCheckingSession(false);
        }
      });

      const timeoutId = setTimeout(() => {
        if (mounted) {
          setCheckingSession(false);
        }
      }, 1000);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timeoutId);
      };
    }

    checkAuthSession();

    return () => {
      mounted = false;
    };
  }, [searchParams, supabase]);

  // Handle password update when an active session is established
  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        text: "Passwords do not match. Please re-enter both carefully.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setMessage({
          text: error.message || "Failed to update password. Your reset session may have expired.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      setMessage({
        text: "Password updated successfully! Redirecting you to sign in...",
        type: "success",
      });

      setPassword("");
      setConfirmPassword("");

      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
        router.push("/login?reset=success");
      }, 1500);
    } catch (err: any) {
      setMessage({
        text: err?.message || "An unexpected error occurred while updating your password.",
        type: "error",
      });
      setLoading(false);
    }
  }

  // Handle password reset using 6-digit OTP code directly
  async function handleOtpReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const cleanEmail = otpEmail.trim().toLowerCase();
    const cleanCode = otpCode.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setMessage({ text: "Please enter your registered email address.", type: "error" });
      return;
    }

    if (!cleanCode || cleanCode.length < 6) {
      setMessage({ text: "Please enter the 6-digit security code sent to your email.", type: "error" });
      return;
    }

    if (password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters long.", type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      // 1. Verify OTP with Supabase
      const { data, error: otpErr } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: "recovery",
      });

      if (otpErr) {
        setMessage({
          text: otpErr.message || "Invalid or expired 6-digit code. Please request a new code.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      // 2. Update to new password
      const { error: updateErr } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateErr) {
        setMessage({
          text: updateErr.message || "Failed to update password. Please try again.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      setMessage({
        text: "Password reset successfully! Redirecting to sign in...",
        type: "success",
      });

      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
        router.push("/login?reset=success");
      }, 1500);
    } catch (err: any) {
      setMessage({
        text: err?.message || "An error occurred while verifying your code.",
        type: "error",
      });
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="rounded-3xl border border-forest/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.30)] p-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <Link
            href="/"
            className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-forest/20 ring-1 ring-forest/10 transition hover:scale-105"
          >
            <img
              src="https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png"
              alt="Charan Organics"
              className="h-full w-full object-contain p-1.5"
            />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-black text-forest dark:text-cream">Create New Password</h1>
            <p className="mt-1 text-sm text-ink/55 dark:text-cream/55">
              Charan Organics Academy Account Security
            </p>
          </div>
        </div>

        {/* Loading initial session check */}
        {checkingSession ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-ink/50 dark:text-cream/50">
            <Loader2 size={28} className="animate-spin text-leaf" />
            <p className="text-xs font-semibold">Verifying secure reset link…</p>
          </div>
        ) : hasValidSession ? (
          /* Active Reset Password Form */
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-ink/70 dark:text-cream/70">
                New Password
              </label>
              <div className="
                flex items-center gap-2
                rounded-xl
                border border-forest/12 dark:border-white/12
                bg-white dark:bg-white/[0.06]
                px-4
                transition-all duration-200
                hover:border-forest/25 dark:hover:border-white/20
                focus-within:border-leaf/50 focus-within:ring-2 focus-within:ring-leaf/15
                focus-within:bg-white dark:focus-within:bg-white/10
              ">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="
                    min-h-[46px] flex-1 bg-transparent text-sm font-medium
                    text-ink dark:text-cream
                    placeholder:text-ink/35 dark:placeholder:text-cream/35
                    outline-none
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-ink/40 dark:text-cream/40 hover:text-forest dark:hover:text-cream transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-ink/70 dark:text-cream/70">
                Confirm New Password
              </label>
              <div className="
                flex items-center gap-2
                rounded-xl
                border border-forest/12 dark:border-white/12
                bg-white dark:bg-white/[0.06]
                px-4
                transition-all duration-200
                hover:border-forest/25 dark:hover:border-white/20
                focus-within:border-leaf/50 focus-within:ring-2 focus-within:ring-leaf/15
                focus-within:bg-white dark:focus-within:bg-white/10
              ">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Re-enter your new password"
                  className="
                    min-h-[46px] flex-1 bg-transparent text-sm font-medium
                    text-ink dark:text-cream
                    placeholder:text-ink/35 dark:placeholder:text-cream/35
                    outline-none
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-ink/40 dark:text-cream/40 hover:text-forest dark:hover:text-cream transition"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password match indicator */}
            {confirmPassword && (
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {password === confirmPassword ? (
                  <span className="flex items-center gap-1 text-leaf">
                    <CheckCircle2 size={13} /> Passwords match
                  </span>
                ) : (
                  <span className="text-red-500">
                    Passwords do not match
                  </span>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || password.length < 6 || password !== confirmPassword}
              className="
                mt-2 flex w-full items-center justify-center gap-2.5
                rounded-xl bg-forest
                px-4 py-3
                text-sm font-bold text-white
                shadow-md shadow-forest/20
                transition-all duration-200
                hover:bg-forest/90 hover:shadow-lg hover:shadow-forest/25 hover:-translate-y-px
                focus:outline-none focus:ring-2 focus:ring-forest/40 focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
                active:translate-y-0
              "
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Updating Password…
                </>
              ) : (
                <>
                  <KeyRound size={16} /> Update Password
                </>
              )}
            </button>
          </form>
        ) : useOtpMode ? (
          /* 6-Digit Code Fallback Form */
          <form onSubmit={handleOtpReset} className="space-y-3.5 animate-in fade-in duration-200">
            <div className="text-center pb-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-leaf bg-leaf/10 px-3 py-1 rounded-full">
                <ShieldCheck size={13} /> Enter 6-Digit Security Code
              </span>
            </div>

            {/* Email input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-ink/70 dark:text-cream/70">
                Your Email Address
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-forest/12 dark:border-white/12 bg-white dark:bg-white/[0.06] px-4">
                <Mail size={16} className="text-leaf shrink-0" />
                <input
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="min-h-[44px] flex-1 bg-transparent text-sm font-medium text-ink dark:text-cream placeholder:text-ink/35 dark:placeholder:text-cream/35 outline-none"
                />
              </div>
            </div>

            {/* 6-Digit Code */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-ink/70 dark:text-cream/70">
                6-Digit Security Code
              </label>
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                maxLength={8}
                placeholder="123456"
                className="w-full text-center font-mono tracking-widest text-lg font-black min-h-[46px] rounded-xl border border-forest/12 dark:border-white/12 bg-white dark:bg-white/[0.06] px-4 text-forest dark:text-cream outline-none focus:border-leaf/50 focus:ring-2 focus:ring-leaf/15"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-ink/70 dark:text-cream/70">
                New Password
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-forest/12 dark:border-white/12 bg-white dark:bg-white/[0.06] px-4">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="min-h-[44px] flex-1 bg-transparent text-sm font-medium text-ink dark:text-cream placeholder:text-ink/35 dark:placeholder:text-cream/35 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="grid size-8 shrink-0 place-items-center text-ink/40 dark:text-cream/40 hover:text-forest transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-ink/70 dark:text-cream/70">
                Confirm New Password
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-forest/12 dark:border-white/12 bg-white dark:bg-white/[0.06] px-4">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  className="min-h-[44px] flex-1 bg-transparent text-sm font-medium text-ink dark:text-cream placeholder:text-ink/35 dark:placeholder:text-cream/35 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="grid size-8 shrink-0 place-items-center text-ink/40 dark:text-cream/40 hover:text-forest transition"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 6 || password !== confirmPassword}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-forest/90 transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Verifying Code…
                </>
              ) : (
                <>
                  <KeyRound size={16} /> Verify &amp; Reset Password
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setUseOtpMode(false)}
              className="w-full text-center text-xs font-bold text-ink/50 hover:text-forest dark:text-cream/50 transition pt-1"
            >
              ← Back to link options
            </button>
          </form>
        ) : (
          /* Invalid or Expired Link state with 6-digit code alternative */
          <div className="space-y-5 text-center animate-in fade-in duration-200">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h2 className="text-base font-bold text-forest dark:text-cream">
                Reset Link Expired or Not Detected
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-ink/60 dark:text-cream/60">
                Password reset links expire after 1 hour or after being used. If you have the 6-digit code from your email, you can enter it directly below.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setUseOtpMode(true)}
                className="
                  flex w-full items-center justify-center gap-2
                  rounded-xl bg-leaf text-white
                  px-4 py-3
                  text-sm font-bold
                  shadow-md shadow-leaf/20
                  transition-all duration-200
                  hover:bg-forest hover:shadow-lg
                "
              >
                <ShieldCheck size={16} />
                Enter 6-Digit Code from Email
              </button>

              <Link
                href="/forgot-password"
                className="
                  flex w-full items-center justify-center gap-2
                  rounded-xl bg-forest/5 dark:bg-white/10
                  px-4 py-2.5
                  text-xs font-bold text-forest dark:text-cream
                  hover:bg-forest/10 dark:hover:bg-white/15 transition
                "
              >
                <KeyRound size={15} />
                Request a Fresh Reset Link
              </Link>
            </div>
          </div>
        )}

        {/* Status message */}
        {message && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold text-center ${
              message.type === "success"
                ? "bg-leaf/10 text-leaf border border-leaf/20"
                : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Back to sign in */}
        <p className="mt-6 text-center text-sm text-ink/55 dark:text-cream/55">
          <Link
            className="font-bold text-leaf hover:text-forest dark:hover:text-cream transition"
            href="/login"
          >
            ← Back to sign in
          </Link>
        </p>
      </div>

      {/* Trust badges */}
      <p className="mt-6 text-center text-xs text-ink/35 dark:text-cream/35 font-medium">
        🔒 Secured by Supabase Auth &nbsp;·&nbsp; Charan Organics Academy
      </p>
    </div>
  );
}
