"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Lock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { syncUserProfile } from "@/app/actions/sync-profile";
import type { CourseDurationVariant } from "@/lib/types";

interface Props {
  slug: string;
  basePrice: number;
  variants?: CourseDurationVariant[];
  isAuthenticated?: boolean;
}

export function CourseEnrollWidget({
  slug,
  basePrice,
  variants = [],
  isAuthenticated = false,
}: Props) {
  const router = useRouter();

  // Find initial default variant or fallback
  const defaultVariant = variants.find((v) => v.isDefault) || variants[0];
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    defaultVariant ? defaultVariant.id : "default"
  );

  // Auth modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authFullName, setAuthFullName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (showAuthModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showAuthModal]);

  const activePlan = variants.find((v) => v.id === selectedPlanId) || {
    id: "default",
    name: "Full Access",
    price: basePrice,
  };

  const targetEnrollUrl = `/enroll?course=${slug}&plan=${activePlan.id}`;

  function handleEnrollClick() {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    router.push(targetEnrollUrl);
  }

  async function handleModalAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    const supabase = createClient();

    try {
      if (authTab === "register") {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: { full_name: authFullName.trim() },
            emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=${encodeURIComponent(targetEnrollUrl)}`,
          },
        });
        if (signUpErr) {
          setAuthError(signUpErr.message);
          setAuthLoading(false);
          return;
        }
        if (data.user) {
          try {
            await syncUserProfile();
          } catch (_) {}
        }
        if (data.session) {
          setShowAuthModal(false);
          setAuthLoading(false);
          router.push(targetEnrollUrl);
          router.refresh();
          return;
        }
        setAuthSuccessMsg("Account created! Please verify your email or sign in below.");
        setAuthTab("login");
        setAuthLoading(false);
        return;
      }

      // Login
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword,
      });

      if (signInErr) {
        setAuthError(signInErr.message);
        setAuthLoading(false);
        return;
      }

      if (data.user) {
        try {
          await syncUserProfile();
        } catch (_) {}
      }

      setShowAuthModal(false);
      setAuthLoading(false);
      router.push(targetEnrollUrl);
      router.refresh();
    } catch (err: any) {
      setAuthError(err?.message || "Authentication failed. Please try again.");
      setAuthLoading(false);
    }
  }

  async function handleModalGoogleLogin() {
    setAuthLoading(true);
    setAuthError(null);
    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    if (typeof window !== "undefined") {
      sessionStorage.setItem("authRedirectNext", targetEnrollUrl);
    }
    const { error: oAuthErr } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` },
    });
    if (oAuthErr) {
      setAuthError(oAuthErr.message);
      setAuthLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Price & Plan Count Header */}
      <div className="flex items-baseline justify-between border-b border-forest/10 pb-3 dark:border-white/10">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50 dark:text-cream/50">
            {variants.length > 1 ? "Selected Plan Price" : "Course Fee"}
          </span>
          <div className="text-3xl font-black text-forest dark:text-cream leading-tight">
            {formatCurrency(activePlan.price)}
          </div>
        </div>
        {variants.length > 1 && (
          <span className="text-[11px] font-black text-leaf bg-leaf/10 dark:text-emerald-400 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
            {variants.length} Access Plans Available
          </span>
        )}
      </div>

      {/* Duration Plans Selector */}
      {variants.length > 0 && (
        <div className="space-y-2.5">
          <p className="font-bold text-forest dark:text-cream text-xs flex items-center gap-1.5">
            <Clock size={13} className="text-leaf" /> Choose Access Duration:
          </p>

          <div className="space-y-2">
            {variants.map((v) => {
              const isSelected = v.id === activePlan.id;

              return (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedPlanId(v.id);
                  }}
                  className={`group/plan relative flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-500/10 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                      : "border-forest/10 bg-white/70 hover:border-forest/30 dark:border-white/10 dark:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {/* Radio Indicator */}
                    <div
                      className={`grid size-4 shrink-0 place-items-center rounded-full border-2 transition ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-600 dark:border-emerald-500"
                          : "border-forest/30 dark:border-cream/30"
                      }`}
                    >
                      {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-forest dark:text-cream text-xs sm:text-sm leading-snug">
                          {v.name}
                        </span>
                        {v.isBestValue && (
                          <span className="rounded-full bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 shadow-sm">
                            ⭐ BEST VALUE
                          </span>
                        )}
                        {v.savingsLabel && (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black px-2 py-0.5 border border-emerald-300 dark:border-emerald-700">
                            🔥 {v.savingsLabel}
                          </span>
                        )}
                      </div>
                      {v.monthlyRate ? (
                        <p className="text-[10px] text-ink/50 dark:text-cream/50 mt-0.5">
                          Only ₹{v.monthlyRate}/month
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-black text-leaf dark:text-emerald-400">
                      ₹{v.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security & Verification Banner */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
        <span>💳 Instant UPI QR Checkout & Fast Manual Approval</span>
      </div>

      {/* Primary Proceed CTA Button: Prompts Login First if Unauthenticated */}
      <div className="pt-1 space-y-2">
        <button
          type="button"
          onClick={handleEnrollClick}
          className="w-full flex items-center justify-between gap-2 py-3.5 sm:py-4 px-6 text-xs sm:text-sm font-black rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-700/25 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Lock size={16} />
            <span>
              {isAuthenticated ? "Proceed to Checkout" : "Sign In to Enroll"} &middot; {formatCurrency(activePlan.price)}
            </span>
          </span>
          <ArrowRight size={16} />
        </button>

        {!isAuthenticated && (
          <p className="text-[11px] text-center text-ink/50 dark:text-cream/50">
            🔒 Student account required &middot; Please sign in to proceed to payment
          </p>
        )}
      </div>

      {/* ══════════════ AUTH MODAL POPUP ══════════════ */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            setShowAuthModal(false);
            setAuthError(null);
            setAuthSuccessMsg(null);
          }}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-forest/15 dark:border-white/10 shadow-2xl p-6 sm:p-7 space-y-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                setShowAuthModal(false);
                setAuthError(null);
                setAuthSuccessMsg(null);
              }}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-forest/5 hover:bg-forest/10 dark:bg-white/10 text-forest dark:text-cream transition cursor-pointer"
              title="Close"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="mx-auto size-12 rounded-2xl bg-forest/5 dark:bg-white/10 grid place-items-center mb-2">
                <img
                  src="https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png"
                  alt="Charan Organics"
                  className="size-8 object-contain"
                />
              </div>
              <h3 className="text-xl font-black text-forest dark:text-cream">
                {authTab === "login" ? "Sign In to Enroll" : "Create Student Account"}
              </h3>
              <p className="text-xs text-ink/60 dark:text-cream/60 max-w-xs mx-auto">
                {authTab === "login"
                  ? "Log in so your masterclass, notes, and certificate unlock in your dashboard."
                  : "Register in 30 seconds to proceed to checkout and secure your course enrollment."}
              </p>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-forest/5 dark:bg-white/5 border border-forest/10 dark:border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthTab("login");
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                }}
                className={`py-2 rounded-xl transition cursor-pointer ${
                  authTab === "login"
                    ? "bg-white text-forest shadow-xs dark:bg-stone-800 dark:text-cream"
                    : "text-ink/60 dark:text-cream/60 hover:text-forest"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab("register");
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                }}
                className={`py-2 rounded-xl transition cursor-pointer ${
                  authTab === "register"
                    ? "bg-white text-forest shadow-xs dark:bg-stone-800 dark:text-cream"
                    : "text-ink/60 dark:text-cream/60 hover:text-forest"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              disabled={authLoading}
              onClick={handleModalGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-forest/15 dark:border-white/12 bg-white dark:bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-ink dark:text-cream shadow-xs transition hover:bg-forest/5 disabled:opacity-60 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-forest/10 dark:bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink/40 dark:text-cream/40">
                Or with Email
              </span>
              <div className="flex-1 h-px bg-forest/10 dark:bg-white/10" />
            </div>

            {/* Form */}
            <form onSubmit={handleModalAuth} className="space-y-3">
              {authTab === "register" && (
                <div>
                  <label className="block text-[11px] font-bold text-forest dark:text-cream mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="e.g. Priyadarshini Sharma"
                    className="w-full rounded-2xl border border-forest/15 bg-linen px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-leaf dark:bg-white/5 dark:border-white/15 dark:text-cream"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-forest dark:text-cream mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full rounded-2xl border border-forest/15 bg-linen px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-leaf dark:bg-white/5 dark:border-white/15 dark:text-cream"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-forest dark:text-cream mb-1">
                  Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showAuthPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Enter password (min 6 characters)"
                    className="w-full rounded-2xl border border-forest/15 bg-linen px-3.5 py-2.5 pr-10 text-xs font-semibold outline-none focus:border-leaf dark:bg-white/5 dark:border-white/15 dark:text-cream"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthPassword(!showAuthPassword)}
                    className="absolute right-3 text-ink/40 hover:text-forest dark:text-cream/40 cursor-pointer"
                  >
                    {showAuthPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccessMsg && (
                <div className="rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{authSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-forest hover:bg-leaf py-3 text-xs font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {authLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : authTab === "login" ? (
                  <span>Sign In & Proceed to Checkout</span>
                ) : (
                  <span>Create Account & Proceed</span>
                )}
              </button>
            </form>

            <div className="pt-1 text-center">
              <Link
                href={`/login?redirectTo=${encodeURIComponent(targetEnrollUrl)}`}
                className="text-[11px] font-bold text-leaf hover:underline"
              >
                Prefer dedicated login page? Sign in here &rarr;
              </Link>
            </div>

            <p className="text-[10px] text-center text-ink/40 dark:text-cream/40">
              🔒 Secured by Supabase Auth &middot; Charan Organics Academy
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
