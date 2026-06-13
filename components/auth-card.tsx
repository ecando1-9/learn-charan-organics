"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getBrowserAppUrl } from "@/lib/site-url";
import { ensureLmsProfile } from "@/lib/supabase/profile";

export function AuthCard({ mode }: { mode: "login" | "register" | "forgot" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(false);

  const title =
    mode === "login" ? "Welcome back" :
    mode === "register" ? "Create your account" :
    "Reset your password";

  const subtitle =
    mode === "login" ? "Sign in to continue learning" :
    mode === "register" ? "Start your learning journey today" :
    "We'll send you a reset link";

  async function handleGoogleLogin() {
    setLoading(true);
    setMessage(null);
    const origin = getBrowserAppUrl();
    sessionStorage.setItem("authRedirectNext", redirectTo);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` }
    });
    if (error) { setMessage({ text: error.message, type: "error" }); setLoading(false); }
  }

  async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getBrowserAppUrl()}/login`
      });
      setMessage({ text: error ? error.message : "Reset link sent! Check your inbox.", type: error ? "error" : "success" });
      setLoading(false);
      return;
    }

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${getBrowserAppUrl()}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          data: { full_name: fullName }
        }
      });
      if (error) { setMessage({ text: error.message, type: "error" }); setLoading(false); return; }
      if (data.user) {
        const { error: profileError } = await ensureLmsProfile(supabase, data.user);
        if (profileError) { setMessage({ text: profileError.message, type: "error" }); setLoading(false); return; }
      }
      if (data.session) { router.push(redirectTo); router.refresh(); return; }
      setMessage({ text: "Account created! Please verify your email to continue.", type: "success" });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage({ text: error.message, type: "error" }); setLoading(false); return; }
    if (data.user) {
      const { error: profileError } = await ensureLmsProfile(supabase, data.user);
      if (profileError) { setMessage({ text: profileError.message, type: "error" }); setLoading(false); return; }
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="rounded-3xl border border-forest/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.30)] p-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <Link href="/" className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-forest/20 ring-1 ring-forest/10 transition hover:scale-105">
            <img src="https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png" alt="Charan Organics" className="h-full w-full object-contain p-1.5" />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-black text-forest dark:text-cream">{title}</h1>
            <p className="mt-1 text-sm text-ink/55 dark:text-cream/55">{subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          {/* Google button */}
          {mode !== "forgot" && (
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="
                flex w-full items-center justify-center gap-3
                rounded-xl border border-forest/12 dark:border-white/12
                bg-white dark:bg-white/[0.06]
                px-4 py-3
                text-sm font-semibold text-ink dark:text-cream
                shadow-sm
                transition-all duration-200
                hover:bg-forest/[0.04] dark:hover:bg-white/10
                hover:border-forest/20
                focus:outline-none focus:ring-2 focus:ring-leaf/30
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {/* Official Google G logo */}
              <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Continue with Google
            </button>
          )}

          {/* Divider */}
          {mode !== "forgot" && (
            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-forest/10 dark:bg-white/10" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-ink/35 dark:text-cream/35">or</span>
              <div className="flex-1 h-px bg-forest/10 dark:bg-white/10" />
            </div>
          )}

          {/* Full name — register only */}
          {mode === "register" && (
            <div className="group">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="
                  w-full rounded-xl
                  border border-forest/12 dark:border-white/12
                  bg-white dark:bg-white/[0.06]
                  px-4 py-3 text-sm font-medium
                  text-ink dark:text-cream
                  placeholder:text-ink/35 dark:placeholder:text-cream/35
                  outline-none
                  transition-all duration-200
                  hover:border-forest/25 dark:hover:border-white/20
                  focus:border-leaf/50 focus:ring-2 focus:ring-leaf/15
                  focus:bg-white dark:focus:bg-white/10
                "
              />
            </div>
          )}

          {/* Email */}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Email address"
            className="
              w-full rounded-xl
              border border-forest/12 dark:border-white/12
              bg-white dark:bg-white/[0.06]
              px-4 py-3 text-sm font-medium
              text-ink dark:text-cream
              placeholder:text-ink/35 dark:placeholder:text-cream/35
              outline-none
              transition-all duration-200
              hover:border-forest/25 dark:hover:border-white/20
              focus:border-leaf/50 focus:ring-2 focus:ring-leaf/15
              focus:bg-white dark:focus:bg-white/10
            "
          />

          {/* Password */}
          {mode !== "forgot" && (
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
                placeholder="Password"
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
          )}

          {/* Forgot password link */}
          {mode === "login" && (
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs font-bold text-leaf hover:text-forest dark:hover:text-cream transition">
                Forgot password?
              </Link>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              mt-1 flex w-full items-center justify-center gap-2.5
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
              <><Loader2 size={16} className="animate-spin" /> Please wait…</>
            ) : (
              <><Mail size={16} />
                {mode === "forgot" ? "Send reset link" : mode === "register" ? "Create account" : "Sign in"}
              </>
            )}
          </button>
        </form>

        {/* Status message */}
        {message && (
          <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold text-center ${
            message.type === "success"
              ? "bg-leaf/10 text-leaf border border-leaf/20"
              : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"
          }`}>
            {message.text}
          </div>
        )}

        {/* Footer links */}
        <p className="mt-6 text-center text-sm text-ink/55 dark:text-cream/55">
          {mode === "login" && (
            <>New here?{" "}<Link className="font-bold text-leaf hover:text-forest dark:hover:text-cream transition" href="/register">Create an account</Link></>
          )}
          {mode === "register" && (
            <>Already have an account?{" "}<Link className="font-bold text-leaf hover:text-forest dark:hover:text-cream transition" href="/login">Sign in</Link></>
          )}
          {mode === "forgot" && (
            <Link className="font-bold text-leaf hover:text-forest dark:hover:text-cream transition" href="/login">← Back to sign in</Link>
          )}
        </p>
      </div>

      {/* Trust badges */}
      <p className="mt-6 text-center text-xs text-ink/35 dark:text-cream/35 font-medium">
        🔒 Secured by Supabase Auth &nbsp;·&nbsp; Charan Organics Academy
      </p>
    </div>
  );
}
