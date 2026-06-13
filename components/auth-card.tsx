"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Chrome, Eye, EyeOff, GraduationCap, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const title = mode === "login" ? "Welcome back" : mode === "register" ? "Create your student account" : "Reset your password";

  async function handleGoogleLogin() {
    setLoading(true);
    setMessage("");
    const origin = getBrowserAppUrl();
    // Store next destination before OAuth redirect so the callback URL stays
    // clean (no query params). Supabase requires exact URL match against allow list.
    sessionStorage.setItem("authRedirectNext", redirectTo);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`
      }
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  }

  async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getBrowserAppUrl()}/login`
      });
      setMessage(error ? error.message : "Password reset link sent. Check your email.");
      setLoading(false);
      return;
    }

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getBrowserAppUrl()}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          data: { full_name: fullName }
        }
      });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await ensureLmsProfile(supabase, data.user);
        if (profileError) {
          setMessage(profileError.message);
          setLoading(false);
          return;
        }
      }

      if (data.session) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      setMessage("Account created. Please verify your email to continue.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await ensureLmsProfile(supabase, data.user);
      if (profileError) {
        setMessage(profileError.message);
        setLoading(false);
        return;
      }
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="glass w-full max-w-md rounded-[2rem] p-6">
      <Link href="/" className="mx-auto grid size-14 place-items-center rounded-2xl bg-forest text-white"><GraduationCap /></Link>
      <h1 className="mt-6 text-center text-3xl font-black text-forest dark:text-cream">{title}</h1>
      <form onSubmit={handleEmailAuth} className="mt-6 grid gap-3">
        {mode !== "forgot" && <Button type="button" disabled={loading} variant="secondary" className="w-full" onClick={handleGoogleLogin}><Chrome size={18} /> Continue with Google</Button>}
        {mode !== "forgot" && <div className="relative py-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-ink/45 dark:text-cream/45">or</div>}
        {mode === "register" && <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="rounded-2xl bg-white p-4 outline-none dark:bg-white/10" placeholder="Full name" />}
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="rounded-2xl bg-white p-4 outline-none dark:bg-white/10" placeholder="Email address" />
        {mode !== "forgot" && (
          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 dark:bg-white/10">
            <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} required minLength={6} className="min-h-14 w-full bg-transparent outline-none" placeholder="Password" />
            <button type="button" className="grid size-10 shrink-0 place-items-center rounded-full text-forest/70 transition hover:bg-forest/10 dark:text-cream/70" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </label>
        )}
        <Button disabled={loading}><Mail size={18} /> {loading ? "Please wait" : mode === "forgot" ? "Send reset link" : mode === "register" ? "Create account" : "Login"}</Button>
      </form>
      {message && <p className="mt-4 rounded-2xl bg-white/70 p-3 text-center text-sm font-semibold text-forest dark:bg-white/10 dark:text-cream">{message}</p>}
      <div className="mt-5 text-center text-sm text-ink/60 dark:text-cream/60">
        {mode === "login" && <><Link className="font-bold text-leaf" href="/forgot-password">Forgot password?</Link><br />New here? <Link className="font-bold text-leaf" href="/register">Register</Link></>}
        {mode === "register" && <>Already enrolled? <Link className="font-bold text-leaf" href="/login">Login</Link></>}
        {mode === "forgot" && <Link className="font-bold text-leaf" href="/login">Back to login</Link>}
      </div>
    </div>
  );
}
