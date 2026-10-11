"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Copy, Loader2,
  PackageCheck, PlayCircle, ShieldCheck, Upload,
  X, Sparkles, Clock, AlertCircle, ShoppingCart
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { submitEnrollmentRequest } from "@/app/actions/enrollment";

const UPI_ID = "8985482084@hdfc";

type Course = {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  youtube_url: string | null;
  price_inr: number;
  price_1year_inr?: number | null;
  is_free: boolean;
};

type DurationOption = "6_months" | "1_year";

function getThumbnail(c: Course) {
  if (c.thumbnail_url) return c.thumbnail_url;
  const match =
    c.youtube_url?.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1] ??
    c.youtube_url?.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1];
  return match
    ? `https://img.youtube.com/vi/${match}/hqdefault.jpg`
    : "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png";
}

export default function EnrollPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselect = searchParams.get("course");

  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Map of courseId -> DurationOption ("6_months" | "1_year")
  const [durations, setDurations] = useState<Record<string, DurationOption>>({});
  const [loading, setLoading] = useState(true);
  const [redirectingFree, setRedirectingFree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [utr, setUtr] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("lms_courses")
      .select("id,title,slug,thumbnail_url,youtube_url,price_inr,price_1year_inr,is_free")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        const all = (data ?? []) as Course[];

        // If a specific free course was requested, redirect to watch immediately
        if (preselect) {
          const found = all.find((c) => c.slug === preselect);
          if (found && (found.is_free || Number(found.price_inr) === 0)) {
            setRedirectingFree(true);
            router.replace(`/learn/${found.slug}/main-video`);
            return;
          }
          if (found) {
            setSelected(new Set([found.id]));
          }
        }

        // Only show paid courses on the enrollment page
        const paid = all.filter((c) => !c.is_free && Number(c.price_inr) > 0);
        setCourses(paid);

        // If no preselected course but courses exist, preselect the first one by default for immediate convenience
        if (!preselect && paid.length > 0) {
          setSelected(new Set([paid[0].id]));
        }

        // Initialize default duration as 6_months for all
        const initialDurations: Record<string, DurationOption> = {};
        paid.forEach((c) => {
          initialDurations[c.id] = "6_months";
        });
        setDurations(initialDurations);

        setLoading(false);
      });
  }, [preselect, router]);

  // Price helper based on selected duration
  function getCoursePrice(c: Course, duration: DurationOption = "6_months") {
    const basePrice = Number(c.price_inr) > 0 ? Number(c.price_inr) : 199;
    if (duration === "1_year") {
      if (c.price_1year_inr && Number(c.price_1year_inr) > 0) {
        return Number(c.price_1year_inr);
      }
      // If 1-year price wasn't explicitly configured, offer 1 year at 1.5x base price rounded
      return Math.round(basePrice * 1.5);
    }
    return basePrice;
  }

  function toggleCourse(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleDuration(courseId: string, duration: DurationOption) {
    setDurations((prev) => ({
      ...prev,
      [courseId]: duration,
    }));
  }

  function selectAllCourses() {
    setSelected(new Set(courses.map((c) => c.id)));
  }

  function clearAllCourses() {
    setSelected(new Set());
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  }

  function copyTextFallback(text: string) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      /* ignore */
    }
    document.body.removeChild(ta);
  }

  function copyUpi() {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(UPI_ID)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          copyTextFallback(UPI_ID);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
    } else {
      copyTextFallback(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const selectedCourses = courses.filter((c) => selected.has(c.id));

  const totalAmount = selectedCourses.reduce((sum, c) => {
    const dur = durations[c.id] || "6_months";
    return sum + getCoursePrice(c, dur);
  }, 0);

  async function handleSubmit() {
    if (selected.size === 0) {
      setError("Please select at least one course to enroll.");
      return;
    }
    if (!utr && !proofFile) {
      setError("Please enter your UTR / UPI transaction number or upload a payment screenshot.");
      return;
    }
    setError("");
    setSubmitting(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in to your account first before submitting.");
      setSubmitting(false);
      return;
    }

    const courseIds = [...selected];
    const courseTitles = selectedCourses
      .map((c) => {
        const dur = durations[c.id] || "6_months";
        const durLabel = dur === "1_year" ? "1 Year Access" : "6 Months Access";
        return `${c.title} (${durLabel})`;
      })
      .join(", ");

    const formData = new FormData();
    courseIds.forEach((courseId) => formData.append("course_ids", courseId));
    formData.set("course_titles", courseTitles);
    formData.set("amount", String(totalAmount));
    formData.set("utr_number", utr);
    formData.set("selected_all", String(selected.size === courses.length && courses.length > 0));
    if (proofFile) {
      formData.set("proof_file", proofFile);
    }

    const result = await submitEnrollmentRequest(formData);

    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  const qrData = encodeURIComponent(
    `upi://pay?pa=${UPI_ID}&pn=Charan%20Organics&am=${totalAmount}&cu=INR&tn=Course%20Enrollment`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${qrData}`;

  /* ── Redirecting to free class ── */
  if (redirectingFree) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <div className="grid size-16 place-items-center rounded-full bg-leaf/10">
          <PlayCircle size={32} className="text-leaf" />
        </div>
        <p className="text-base font-bold text-forest dark:text-cream">
          This is a free class — redirecting to video…
        </p>
        <Loader2 size={20} className="animate-spin text-leaf" />
      </div>
    );
  }

  /* ── DONE / SUCCESS STATE ── */
  if (done) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full rounded-[2.5rem] bg-white p-8 sm:p-12 text-center shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-leaf/15 text-leaf">
            <PackageCheck size={44} />
          </div>
          <h1 className="mt-6 text-2xl sm:text-3xl font-black text-forest dark:text-cream">
            Payment Request Submitted!
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink/70 dark:text-cream/70">
            Thank you! Your payment proof and UTR details have been forwarded to the admin.
          </p>
          <div className="mt-6 rounded-2xl bg-leaf/10 p-4 text-xs font-semibold text-leaf leading-5 text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-sm">
              <CheckCircle2 size={16} /> What happens next?
            </p>
            <p>1. Admin verifies your UPI payment with bank records.</p>
            <p>2. Once verified, your course and formulation PDFs are instantly unlocked.</p>
            <p>3. A confirmation email will be dispatched to your registered email address.</p>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
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
              Explore Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-linen/30 dark:bg-transparent">
      {/* ── Top Header ── */}
      <div className="border-b border-forest/10 bg-white/80 backdrop-blur-md dark:bg-white/5 dark:border-white/10 sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="grid size-9 place-items-center rounded-full bg-forest/5 hover:bg-forest/10 dark:bg-white/10 transition"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-forest dark:text-cream leading-tight">
                Course Enrollment Checkout
              </h1>
              <p className="text-xs text-ink/55 dark:text-cream/55">
                Instant UPI Payment & Fast Verification
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-leaf bg-leaf/10 px-3 py-1.5 rounded-full">
            <ShieldCheck size={15} /> 100% Secure Manual Verification
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-leaf" size={36} />
            <p className="text-sm font-bold text-forest dark:text-cream">Loading published courses…</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="mx-auto max-w-md rounded-[2.5rem] bg-white p-10 text-center shadow-soft dark:bg-white/5">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-amber-500/10 text-amber-500">
              <AlertCircle size={32} />
            </div>
            <h2 className="mt-4 text-xl font-black text-forest dark:text-cream">No Paid Courses Active</h2>
            <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">
              There are currently no published paid courses available for enrollment. Check back soon or explore our free classes!
            </p>
            <Link
              href="/free-classes"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-xs font-bold text-white hover:bg-leaf transition"
            >
              <PlayCircle size={15} /> View Free Classes
            </Link>
          </div>
        ) : (
          /* ══════════ UNIFIED SINGLE-PAGE CHECKOUT ══════════ */
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">

            {/* ── LEFT COLUMN: Course Cart & Duration ── */}
            <div className="space-y-6">
              <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-forest/10 pb-4 dark:border-white/10">
                  <div>
                    <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
                      <ShoppingCart size={20} className="text-leaf" /> Select Courses
                    </h2>
                    <p className="text-xs text-ink/60 dark:text-cream/60 mt-0.5">
                      Choose one or more courses to add to your enrollment
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllCourses}
                      className="text-xs font-bold text-leaf hover:underline px-2 py-1 rounded"
                    >
                      Select All
                    </button>
                    <span className="text-ink/20 dark:text-cream/20">|</span>
                    <button
                      type="button"
                      onClick={clearAllCourses}
                      className="text-xs font-bold text-ink/50 hover:text-ink hover:underline dark:text-cream/50 px-2 py-1 rounded"
                    >
                      Deselect
                    </button>
                  </div>
                </div>

                {/* Course List */}
                <div className="mt-4 space-y-3">
                  {courses.map((course) => {
                    const isChecked = selected.has(course.id);
                    const currentDur = durations[course.id] || "6_months";
                    const price6m = getCoursePrice(course, "6_months");
                    const price1y = getCoursePrice(course, "1_year");
                    const activePrice = getCoursePrice(course, currentDur);

                    return (
                      <div
                        key={course.id}
                        className={`rounded-2xl border-2 p-4 transition ${
                          isChecked
                            ? "border-leaf bg-leaf/5 shadow-sm"
                            : "border-forest/10 bg-linen/40 hover:border-forest/20 dark:border-white/10 dark:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleCourse(course.id)}
                            className={`mt-1 grid size-6 shrink-0 place-items-center rounded-lg border-2 transition ${
                              isChecked
                                ? "border-leaf bg-leaf text-white"
                                : "border-forest/25 bg-white dark:border-cream/25 dark:bg-white/10"
                            }`}
                          >
                            {isChecked && <CheckCircle2 size={16} />}
                          </button>

                          {/* Thumbnail */}
                          <img
                            src={getThumbnail(course)}
                            alt={course.title}
                            className="size-16 shrink-0 rounded-xl object-cover cursor-pointer"
                            onClick={() => toggleCourse(course.id)}
                          />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div
                              className="cursor-pointer"
                              onClick={() => toggleCourse(course.id)}
                            >
                              <h3 className="line-clamp-2 text-sm font-black text-forest dark:text-cream leading-snug">
                                {course.title}
                              </h3>
                              <p className="mt-0.5 text-xs text-ink/55 dark:text-cream/55 flex items-center gap-1.5">
                                <Sparkles size={12} className="text-leaf" /> Includes full formulation PDF & video
                              </p>
                            </div>

                            {/* Access Duration Selector (Visible when selected) */}
                            {isChecked && (
                              <div className="mt-3 pt-3 border-t border-forest/10 dark:border-white/10 flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold text-ink/60 dark:text-cream/60 flex items-center gap-1">
                                  <Clock size={12} /> Access Duration:
                                </span>
                                <div className="inline-flex rounded-xl bg-forest/5 p-0.5 dark:bg-white/10">
                                  <button
                                    type="button"
                                    onClick={() => toggleDuration(course.id, "6_months")}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                                      currentDur === "6_months"
                                        ? "bg-forest text-white shadow-sm"
                                        : "text-ink/70 dark:text-cream/70 hover:text-ink"
                                    }`}
                                  >
                                    6 Months (₹{price6m.toLocaleString("en-IN")})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleDuration(course.id, "1_year")}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                                      currentDur === "1_year"
                                        ? "bg-forest text-white shadow-sm"
                                        : "text-ink/70 dark:text-cream/70 hover:text-ink"
                                    }`}
                                  >
                                    1 Year (₹{price1y.toLocaleString("en-IN")})
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Price Tag */}
                          <div className="text-right shrink-0">
                            <span className="text-base font-black text-leaf">
                              ₹{activePrice.toLocaleString("en-IN")}
                            </span>
                            <p className="text-[10px] text-ink/45 dark:text-cream/45">
                              {currentDur === "1_year" ? "1-Year Access" : "6-Month Access"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security & Student Guarantee Note */}
              <div className="rounded-[1.5rem] bg-leaf/10 border border-leaf/20 p-4 text-xs font-semibold text-leaf leading-5">
                <p className="font-bold text-sm mb-1">🌿 Charan Organics Direct Academy Support</p>
                <p>
                  After submitting your payment request, our team verifies the UTR number with bank records.
                  You will receive access to your formulation notes, videos, and full student discussion community.
                </p>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Order Summary & UPI Payment ── */}
            <div className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-[2.5rem] bg-white p-6 sm:p-7 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-6">

                {/* Amount Header */}
                <div className="flex items-center justify-between border-b border-forest/10 pb-4 dark:border-white/10">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-cream/50">
                      Total Payable
                    </span>
                    <p className="text-3xl font-black text-forest dark:text-cream mt-0.5">
                      {totalAmount > 0 ? formatCurrency(totalAmount) : "₹0"}
                    </p>
                  </div>
                  <span className="rounded-full bg-leaf/10 px-3 py-1 text-xs font-black text-leaf">
                    {selected.size} {selected.size === 1 ? "Course" : "Courses"}
                  </span>
                </div>

                {/* Selected Courses Breakdown */}
                {selectedCourses.length > 0 ? (
                  <div className="space-y-2 rounded-2xl bg-linen/50 dark:bg-white/5 p-3.5 text-xs">
                    <p className="font-bold text-forest dark:text-cream mb-1">Order Summary:</p>
                    {selectedCourses.map((c) => {
                      const dur = durations[c.id] || "6_months";
                      const p = getCoursePrice(c, dur);
                      return (
                        <div key={c.id} className="flex justify-between items-center text-ink/75 dark:text-cream/75">
                          <span className="truncate max-w-[200px]">
                            • {c.title} <span className="text-[10px] text-ink/40">({dur === "1_year" ? "1Y" : "6M"})</span>
                          </span>
                          <span className="font-bold text-forest dark:text-cream">₹{p.toLocaleString("en-IN")}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-2xl">
                    Please select at least one course from the left to generate your payment QR.
                  </p>
                )}

                {/* UPI ID & QR Code */}
                {totalAmount > 0 && (
                  <div className="space-y-4 pt-2">
                    {/* UPI ID Box */}
                    <div className="flex items-center justify-between rounded-2xl bg-linen px-4 py-3 dark:bg-white/5 border border-forest/10 dark:border-white/10">
                      <div>
                        <p className="text-[11px] font-bold text-ink/50 dark:text-cream/50">Official UPI ID</p>
                        <p className="font-black text-forest dark:text-cream text-sm">{UPI_ID}</p>
                      </div>
                      <button
                        type="button"
                        onClick={copyUpi}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                          copied
                            ? "bg-leaf text-white"
                            : "bg-forest/10 text-forest hover:bg-forest/20 dark:bg-white/10 dark:text-cream"
                        }`}
                      >
                        <Copy size={13} /> {copied ? "Copied!" : "Copy ID"}
                      </button>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-forest/10 dark:bg-white/5 dark:border-white/10 shadow-sm text-center">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <img src={qrUrl} alt="UPI Payment QR Code" className="size-48 object-contain" />
                      </div>
                      <p className="mt-2.5 text-xs font-bold text-forest dark:text-cream">
                        Scan with PhonePe, GPay, Paytm, or BHIM
                      </p>
                      <p className="text-[10px] text-ink/50 dark:text-cream/50 mt-0.5">
                        Amount ₹{totalAmount.toLocaleString("en-IN")} auto-filled in QR
                      </p>
                    </div>
                  </div>
                )}

                {/* Verification Form: UTR & Screenshot */}
                <div className="space-y-4 pt-2 border-t border-forest/10 dark:border-white/10">
                  <div>
                    <label className="block text-xs font-bold text-forest dark:text-cream uppercase tracking-wide">
                      1. UTR Number / Transaction ID *
                    </label>
                    <input
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                      placeholder="e.g. 425612345678 (12-digit number)"
                      className="mt-1.5 w-full rounded-2xl border border-forest/15 bg-linen px-4 py-3 text-sm font-semibold outline-none focus:border-leaf dark:bg-white/5 dark:border-white/15 dark:text-cream dark:placeholder:text-cream/40"
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
                      <div className="relative mt-1.5 rounded-2xl overflow-hidden border border-forest/15 dark:border-white/15">
                        <img src={proofPreview} alt="Payment proof preview" className="w-full max-h-52 object-contain bg-black/5" />
                        <button
                          type="button"
                          onClick={() => {
                            setProofFile(null);
                            setProofPreview(null);
                          }}
                          className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 shadow hover:bg-white text-forest transition"
                          title="Remove screenshot"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="mt-1.5 flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-forest/20 py-5 text-xs text-ink/55 hover:border-leaf/50 hover:text-leaf transition dark:border-white/15 dark:text-cream/50 bg-linen/20"
                      >
                        <Upload size={20} className="text-leaf" />
                        <span className="font-bold">Click to upload payment screenshot</span>
                        <span className="text-[10px] text-ink/40 dark:text-cream/40">PNG, JPG or Screenshot</span>
                      </button>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || selected.size === 0}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-forest py-4 text-sm font-bold text-white shadow-soft hover:bg-leaf transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  {submitting ? "Submitting Payment Proof…" : `Submit Request (${formatCurrency(totalAmount)})`}
                </button>

                <p className="text-center text-[11px] text-ink/50 dark:text-cream/50">
                  Verification usually completed within 12-24 hours. Email confirmation sent upon approval.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
