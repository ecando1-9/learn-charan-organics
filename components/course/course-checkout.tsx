"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  PackageCheck,
  PlayCircle,
  ShieldCheck,
  Upload,
  X,
  Sparkles,
  Clock,
  AlertCircle,
  Phone,
  MessageCircle,
  FileText,
  Award,
  Check,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { submitEnrollmentRequest } from "@/app/actions/enrollment";
import {
  CourseDurationVariant,
  getSelectedVariant,
} from "@/lib/course-variants";
import { PAYMENT_CONFIG, getUpiQrCodeUrl } from "@/lib/payment-config";

export type CheckoutCourse = {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  youtube_url: string | null;
  price_inr: number;
  duration_variants?: any;
  is_free: boolean;
  variants: CourseDurationVariant[];
};

interface Props {
  initialCourses: CheckoutCourse[];
  initialPreselectSlug?: string;
  initialPlanId?: string;
  userEmail?: string | null;
  isAuthenticated?: boolean;
}

function getThumbnail(c: CheckoutCourse) {
  if (c.thumbnail_url) return c.thumbnail_url;
  const match =
    c.youtube_url?.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1] ??
    c.youtube_url?.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1];
  return match
    ? `https://img.youtube.com/vi/${match}/hqdefault.jpg`
    : "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png";
}

export function CourseCheckout({
  initialCourses,
  initialPreselectSlug,
  initialPlanId,
  userEmail,
  isAuthenticated = false,
}: Props) {
  const router = useRouter();

  const [courses] = useState<CheckoutCourse[]>(initialCourses);

  // Selected course IDs
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (initialPreselectSlug) {
      const found = initialCourses.find((c) => c.slug === initialPreselectSlug);
      if (found) return new Set([found.id]);
    }
    return initialCourses.length > 0 ? new Set([initialCourses[0].id]) : new Set();
  });

  // Selected duration variant per course (courseId -> variantId)
  const [durations, setDurations] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialCourses.forEach((c) => {
      if (initialPreselectSlug && c.slug === initialPreselectSlug && initialPlanId) {
        const matched = c.variants.find((v) => v.id === initialPlanId);
        if (matched) {
          map[c.id] = matched.id;
          return;
        }
      }
      const def = c.variants.find((v) => v.isDefault) || c.variants[0];
      if (def) {
        map[c.id] = def.id;
      }
    });
    return map;
  });

  const [utr, setUtr] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [copiedUpiId, setCopiedUpiId] = useState(false);
  const [copiedUpiNumber, setCopiedUpiNumber] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [submittedUtr, setSubmittedUtr] = useState("");
  const [error, setError] = useState("");
  const [showOtherCourses, setShowOtherCourses] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Helper to get active variant for a course
  function getCourseActiveVariant(c: CheckoutCourse): CourseDurationVariant {
    const activeId = durations[c.id];
    return (
      getSelectedVariant(c.variants, activeId) || {
        id: "plan_default",
        name: "Standard Access",
        price: Number(c.price_inr) || 499,
        isDefault: true,
      }
    );
  }

  function getCoursePrice(c: CheckoutCourse): number {
    return getCourseActiveVariant(c).price;
  }

  function toggleCourse(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) {
          next.delete(id);
        }
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function setVariant(courseId: string, variantId: string) {
    setDurations((prev) => ({
      ...prev,
      [courseId]: variantId,
    }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  }

  function copyText(text: string, type: "id" | "number") {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    if (type === "id") {
      setCopiedUpiId(true);
      setTimeout(() => setCopiedUpiId(false), 2000);
    } else {
      setCopiedUpiNumber(true);
      setTimeout(() => setCopiedUpiNumber(false), 2000);
    }
  }

  const selectedCourses = courses.filter((c) => selected.has(c.id));
  const totalAmount = selectedCourses.reduce((sum, c) => sum + getCoursePrice(c), 0);

  // Identified primary course
  const primaryCourse = initialPreselectSlug
    ? courses.find((c) => c.slug === initialPreselectSlug) || courses[0]
    : courses[0];

  const otherCourses = primaryCourse
    ? courses.filter((c) => c.id !== primaryCourse.id)
    : [];

  const qrUrl = getUpiQrCodeUrl(totalAmount, 260);

  const checkoutUrl = typeof window !== "undefined"
    ? window.location.pathname + window.location.search
    : `/enroll${initialPreselectSlug ? `?course=${initialPreselectSlug}` : ""}`;

  async function handleSubmit() {
    if (selected.size === 0) {
      setError("Please select at least one course to enroll.");
      return;
    }
    if (!utr.trim() && !proofFile) {
      setError("Please enter your 12-digit UPI / UTR transaction number or upload a screenshot.");
      return;
    }

    setError("");
    setSubmitting(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in to your student account first so this enrollment is linked to your dashboard.");
      setSubmitting(false);
      return;
    }

    const courseIds = [...selected];
    const courseTitles = selectedCourses
      .map((c) => {
        const v = getCourseActiveVariant(c);
        return `${c.title} (${v.name})`;
      })
      .join(", ");

    const formData = new FormData();
    courseIds.forEach((id) => formData.append("course_ids", id));
    formData.set("course_titles", courseTitles);
    formData.set("amount", String(totalAmount));
    formData.set("utr_number", utr.trim());
    formData.set("selected_all", String(selected.size === courses.length && courses.length > 0));
    if (proofFile) {
      formData.set("proof_file", proofFile);
    }

    const res = await submitEnrollmentRequest(formData);
    setSubmitting(false);

    if (res?.error) {
      setError(res.error);
      return;
    }

    setSubmittedUtr(utr.trim());
    setDone(true);
  }

  /* ══════════════ SUCCESS SCREEN ══════════════ */
  if (done) {
    const waText = encodeURIComponent(
      `Hi Charan Organics Academy, I just submitted my enrollment payment for ${selectedCourses.map((c) => c.title).join(", ")}. Amount: ₹${totalAmount}. UTR: ${submittedUtr || "screenshot attached"}. Please verify.`
    );
    const waUrl = `https://wa.me/${PAYMENT_CONFIG.supportWhatsapp}?text=${waText}`;

    return (
      <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full rounded-3xl bg-white p-7 sm:p-10 text-center shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-6">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <PackageCheck size={44} />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={13} /> Payment Submitted Successfully
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-forest dark:text-cream">
              Enrollment Under Verification
            </h1>
            <p className="text-sm leading-relaxed text-ink/70 dark:text-cream/70 max-w-md mx-auto">
              Thank you! Your payment details and transaction proof have been safely received by our admissions desk.
            </p>
          </div>

          {/* 24-Hour Guarantee Box */}
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-4 text-left space-y-2 text-xs text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">
            <p className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Clock size={16} /> Fast 24-Hour Activation Guarantee:
            </p>
            <p>
              1. Our administration team verifies your UPI payment with bank records.
            </p>
            <p>
              2. Your masterclass HD video, downloadable formulation notes, and certificate will be unlocked <strong>within 24 hours</strong>.
            </p>
            <p>
              3. You can check your active course status anytime in your student dashboard.
            </p>
          </div>

          {/* Direct Support & Fast Track Verification Box */}
          <div className="rounded-2xl bg-linen/70 dark:bg-white/5 border border-forest/10 dark:border-white/10 p-4 space-y-3 text-left">
            <p className="text-xs font-bold text-forest dark:text-cream flex items-center gap-1.5">
              <Phone size={14} className="text-leaf" /> Need Fast Verification or Have Queries?
            </p>
            <p className="text-xs text-ink/65 dark:text-cream/65 leading-relaxed">
              Message us directly with your UTR number to get your course unlocked immediately:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold transition shadow-sm"
              >
                <MessageCircle size={15} /> WhatsApp Helpline ({PAYMENT_CONFIG.supportPhone})
              </a>
              <a
                href={`tel:${PAYMENT_CONFIG.supportPhone}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest/15 px-4 py-2.5 text-xs font-bold text-forest hover:bg-forest/5 dark:text-cream dark:border-white/15 transition"
              >
                <Phone size={14} /> Call {PAYMENT_CONFIG.supportPhone}
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 rounded-full bg-forest px-6 py-3 text-sm font-bold text-white hover:bg-leaf transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push("/courses")}
              className="flex-1 rounded-full border border-forest/15 px-6 py-3 text-sm font-bold text-forest hover:bg-forest/5 dark:text-cream dark:border-white/15 transition"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════ EMPTY COURSES FALLBACK ══════════════ */
  if (!courses || courses.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-10 text-center shadow-soft dark:bg-white/5 my-12 border border-forest/10 dark:border-white/10">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-amber-500/10 text-amber-500">
          <AlertCircle size={32} />
        </div>
        <h2 className="mt-4 text-xl font-black text-forest dark:text-cream">No Paid Courses Active</h2>
        <p className="mt-2 text-sm text-ink/60 dark:text-cream/60 leading-relaxed">
          There are currently no published paid courses available for enrollment. Check back soon or explore our free formulation classes!
        </p>
        <Link
          href="/free-classes"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-xs font-bold text-white hover:bg-leaf transition"
        >
          <PlayCircle size={15} /> View Free Classes
        </Link>
      </div>
    );
  }

  /* ══════════════ MAIN CHECKOUT SCREEN ══════════════ */
  return (
    <div className="min-h-screen pb-20 bg-linen/30 dark:bg-transparent">
      {/* ── Top Header ── */}
      <div className="border-b border-forest/10 bg-white/80 backdrop-blur-md dark:bg-white/5 dark:border-white/10 sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (primaryCourse) {
                  router.push(`/courses/${primaryCourse.slug}`);
                } else {
                  router.back();
                }
              }}
              className="grid size-9 place-items-center rounded-full bg-forest/5 hover:bg-forest/10 dark:bg-white/10 transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-forest dark:text-cream leading-tight">
                Course Enrollment Checkout
              </h1>
              <p className="text-[11px] text-ink/55 dark:text-cream/55">
                Instant UPI Payment &middot; Verified within 24 Hours
              </p>
            </div>
          </div>

          {/* Quick Helpline Pill */}
          <a
            href={`https://wa.me/${PAYMENT_CONFIG.supportWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition"
          >
            <Phone size={13} /> Helpline: {PAYMENT_CONFIG.supportPhone}
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-start">

          {/* ══════════ LEFT COLUMN: Compact Course Summary ══════════ */}
          <div className="space-y-4">

            {/* Compact Masterclass Card */}
            {primaryCourse && (
              <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/5 text-forest dark:bg-white/10 dark:text-cream text-[11px] font-bold px-3 py-0.5">
                    <Sparkles size={12} className="text-leaf" /> Enrolling In Masterclass
                  </span>
                  <span className="text-xs font-bold text-leaf dark:text-emerald-400">
                    Charan Organics Academy
                  </span>
                </div>

                {/* Course Header (Clean & Subtle, Not Overly Big) */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-forest/10 dark:border-white/10">
                  <img
                    src={getThumbnail(primaryCourse)}
                    alt={primaryCourse.title}
                    className="size-16 sm:size-20 shrink-0 rounded-2xl object-cover border border-forest/10 dark:border-white/10 shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg font-black text-forest dark:text-cream leading-snug">
                      {primaryCourse.title}
                    </h2>
                    <p className="text-[11px] text-ink/60 dark:text-cream/60 mt-0.5 line-clamp-1">
                      Professional botanical cosmetic formulation course with printable recipes & notes.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-bold text-leaf dark:text-emerald-400">
                      <span className="bg-leaf/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <PlayCircle size={11} /> Video Masterclass
                      </span>
                      <span className="bg-leaf/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FileText size={11} /> Formulation Notes
                      </span>
                      <span className="bg-leaf/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award size={11} /> Certificate
                      </span>
                    </div>
                  </div>
                </div>

                {/* Duration Plan Options */}
                {primaryCourse.variants && primaryCourse.variants.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="font-bold text-forest dark:text-cream text-xs flex items-center gap-1.5">
                      <Clock size={13} className="text-leaf" /> Select Access Duration:
                    </p>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {primaryCourse.variants.map((v) => {
                        const activeVar = getCourseActiveVariant(primaryCourse);
                        const isCurrent = activeVar.id === v.id;

                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setVariant(primaryCourse.id, v.id)}
                            className={`relative flex items-center justify-between p-3 rounded-2xl text-left transition-all border-2 cursor-pointer ${
                              isCurrent
                                ? "border-emerald-600 bg-emerald-50/70 shadow-xs dark:border-emerald-500 dark:bg-emerald-950/30"
                                : "border-forest/10 bg-white hover:border-forest/25 dark:border-white/10 dark:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-1">
                              <div
                                className={`size-4 rounded-full border-2 grid place-items-center shrink-0 transition ${
                                  isCurrent
                                    ? "border-emerald-600 bg-emerald-600 dark:border-emerald-500"
                                    : "border-forest/30 dark:border-cream/30"
                                }`}
                              >
                                {isCurrent && <div className="size-1.5 rounded-full bg-white" />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-xs font-black text-forest dark:text-cream">
                                    {v.name}
                                  </span>
                                  {v.isBestValue && (
                                    <span className="rounded-full bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.2 shadow-xs">
                                      ⭐ BEST VALUE
                                    </span>
                                  )}
                                </div>
                                {v.monthlyRate ? (
                                  <p className="text-[10px] text-ink/50 dark:text-cream/50 mt-0.5">
                                    Only ₹{v.monthlyRate}/mo
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-sm font-black text-leaf dark:text-emerald-400">
                                ₹{v.price.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other Courses to Bundle (Subtle & Optional) */}
            {otherCourses.length > 0 ? (
              <div className="rounded-3xl bg-white p-4 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-forest dark:text-cream">
                    Want to bundle more courses? (+{otherCourses.length} available)
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowOtherCourses(!showOtherCourses)}
                    className="text-xs font-bold text-leaf hover:underline cursor-pointer"
                  >
                    {showOtherCourses ? "Hide" : "View"}
                  </button>
                </div>

                {showOtherCourses && (
                  <div className="space-y-2 pt-2 border-t border-forest/10 dark:border-white/10">
                    {otherCourses.map((c) => {
                      const isChecked = selected.has(c.id);
                      const price = getCoursePrice(c);

                      return (
                        <div
                          key={c.id}
                          className={`rounded-2xl border p-2.5 flex items-center justify-between gap-2.5 transition ${
                            isChecked
                              ? "border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/20"
                              : "border-forest/10 bg-linen/30 dark:border-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => toggleCourse(c.id)}
                              className={`size-4 grid place-items-center rounded border transition shrink-0 ${
                                isChecked
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-forest/25 bg-white dark:border-cream/25"
                              }`}
                            >
                              {isChecked && <Check size={11} />}
                            </button>
                            <img
                              src={getThumbnail(c)}
                              alt={c.title}
                              className="size-10 rounded-xl object-cover shrink-0"
                            />
                            <p className="text-xs font-bold text-forest dark:text-cream truncate">
                              {c.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-black text-leaf">
                              ₹{price.toLocaleString("en-IN")}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleCourse(c.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                isChecked
                                  ? "bg-emerald-600 text-white"
                                  : "bg-forest/10 text-forest hover:bg-forest/20 dark:bg-white/10 dark:text-cream"
                              }`}
                            >
                              {isChecked ? "Added ✓" : "+ Add"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-3.5 shadow-xs dark:bg-white/5 border border-forest/10 dark:border-white/10 flex items-center gap-2.5 text-xs text-ink/65 dark:text-cream/65">
                <CheckCircle2 size={15} className="text-leaf shrink-0" />
                <p>
                  You are enrolling in <strong>{primaryCourse?.title}</strong>.
                </p>
              </div>
            )}

            {/* Direct Helpline Banner */}
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-3.5 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold">Have questions or need assistance?</p>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                    Call or WhatsApp helpline: <strong>{PAYMENT_CONFIG.supportPhone}</strong>
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/${PAYMENT_CONFIG.supportWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-800"
              >
                Chat on WhatsApp &rarr;
              </a>
            </div>
          </div>

          {/* ══════════ RIGHT COLUMN: Payment & Proof Submission ══════════ */}
          <div className="space-y-4 lg:sticky lg:top-20">
            <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-5">

              {/* Account Status */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 rounded-2xl bg-leaf/10 border border-leaf/20 px-3 py-1.5 text-xs font-semibold text-leaf">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span className="truncate">Enrolling as <strong>{userEmail}</strong></span>
                </div>
              ) : (
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs space-y-1">
                  <p className="font-bold text-amber-900 dark:text-amber-200">
                    Student Login Recommended
                  </p>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                    Sign in so your course automatically unlocks under your student dashboard:
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/login?redirectTo=${encodeURIComponent(checkoutUrl)}`}
                      className="px-3 py-1 rounded-full bg-forest text-white text-[11px] font-bold hover:bg-leaf transition"
                    >
                      Log In
                    </Link>
                    <Link
                      href={`/register?redirectTo=${encodeURIComponent(checkoutUrl)}`}
                      className="px-3 py-1 rounded-full border border-forest/20 text-forest dark:text-cream text-[11px] font-bold hover:bg-forest/5 transition"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}

              {/* Total Payable Header */}
              <div className="flex items-center justify-between border-b border-forest/10 pb-3.5 dark:border-white/10">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50 dark:text-cream/50">
                    Total Payable Amount
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-forest dark:text-cream">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-leaf/10 px-2.5 py-1 text-xs font-black text-leaf">
                    {selected.size} {selected.size === 1 ? "Course" : "Courses"}
                  </span>
                </div>
              </div>

              {/* UPI ID & UPI Number Details */}
              <div className="space-y-2.5">
                {/* UPI VPA ID */}
                <div className="flex items-center justify-between rounded-2xl bg-linen px-3.5 py-2.5 dark:bg-white/5 border border-forest/10 dark:border-white/10">
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] font-bold text-ink/50 dark:text-cream/50">Official UPI ID</p>
                    <p className="font-black text-forest dark:text-cream text-xs sm:text-sm truncate">
                      {PAYMENT_CONFIG.upiId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(PAYMENT_CONFIG.upiId, "id")}
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
                      copiedUpiId
                        ? "bg-leaf text-white"
                        : "bg-forest/10 text-forest hover:bg-forest/20 dark:bg-white/10 dark:text-cream"
                    }`}
                  >
                    <Copy size={12} /> {copiedUpiId ? "Copied!" : "Copy"}
                  </button>
                </div>

                {/* UPI Mobile Number */}
                <div className="flex items-center justify-between rounded-2xl bg-linen px-3.5 py-2.5 dark:bg-white/5 border border-forest/10 dark:border-white/10">
                  <div>
                    <p className="text-[10px] font-bold text-ink/50 dark:text-cream/50">
                      GPay / PhonePe / Paytm Number
                    </p>
                    <p className="font-black text-forest dark:text-cream text-xs sm:text-sm">
                      {PAYMENT_CONFIG.upiPhoneNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(PAYMENT_CONFIG.upiPhoneNumber, "number")}
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
                      copiedUpiNumber
                        ? "bg-leaf text-white"
                        : "bg-forest/10 text-forest hover:bg-forest/20 dark:bg-white/10 dark:text-cream"
                    }`}
                  >
                    <Copy size={12} /> {copiedUpiNumber ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Dynamic QR Code */}
              <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-linen/50 border border-forest/10 dark:bg-white/5 dark:border-white/10 text-center space-y-2">
                <div className="p-2 bg-white rounded-xl shadow-xs">
                  <img
                    src={qrUrl}
                    alt="Scan UPI QR Code"
                    className="size-44 object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-forest dark:text-cream">
                  Scan to Pay ₹{totalAmount.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-ink/50 dark:text-cream/50">
                  Works with Google Pay, PhonePe, Paytm, or BHIM
                </p>
              </div>

              {/* Verification Form: UTR & Screenshot */}
              <div className="space-y-3 pt-1 border-t border-forest/10 dark:border-white/10">
                <div>
                  <label className="block text-xs font-bold text-forest dark:text-cream uppercase tracking-wide">
                    1. 12-Digit UTR / Transaction ID *
                  </label>
                  <input
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="e.g. 425612345678"
                    className="mt-1 w-full rounded-2xl border border-forest/15 bg-linen px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-leaf dark:bg-white/5 dark:border-white/15 dark:text-cream dark:placeholder:text-cream/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest dark:text-cream uppercase tracking-wide">
                    2. Payment Screenshot (Recommended)
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {proofPreview ? (
                    <div className="relative mt-1 rounded-2xl overflow-hidden border border-forest/15 dark:border-white/15">
                      <img
                        src={proofPreview}
                        alt="Payment screenshot preview"
                        className="w-full max-h-44 object-contain bg-black/5"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProofFile(null);
                          setProofPreview(null);
                        }}
                        className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 shadow hover:bg-white text-forest transition"
                        title="Remove screenshot"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="mt-1 flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-forest/20 py-4 text-xs text-ink/55 hover:border-leaf/50 hover:text-leaf transition dark:border-white/15 dark:text-cream/50 bg-linen/20 cursor-pointer"
                    >
                      <Upload size={18} className="text-leaf" />
                      <span className="font-bold text-xs">Click to upload payment screenshot</span>
                      <span className="text-[10px] text-ink/40 dark:text-cream/40">PNG, JPG or screenshot</span>
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || selected.size === 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs sm:text-sm font-black text-white shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {submitting
                  ? "Submitting Payment Proof…"
                  : `Submit Payment (${formatCurrency(totalAmount)})`}
              </button>

              <div className="rounded-2xl bg-linen p-3 text-[11px] text-ink/60 dark:text-cream/60 space-y-1">
                <p className="font-bold text-forest dark:text-cream flex items-center gap-1">
                  <Clock size={12} className="text-leaf" /> Access Guarantee:
                </p>
                <p>
                  Payment verified and course access granted <strong>within 24 hours</strong>. Need instant unlock? Call or WhatsApp {PAYMENT_CONFIG.supportPhone}.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
