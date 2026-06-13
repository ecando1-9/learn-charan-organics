"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronRight,
  Copy, Loader2, PackageCheck, Upload, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

const UPI_ID = "8985482084@hdfc";
const SINGLE_PRICE = 199;
const ALL_PRICE = 10000;

type Course = { id: string; title: string; slug: string; thumbnail_url: string | null; youtube_url: string | null };

function getThumbnail(c: Course) {
  if (c.thumbnail_url) return c.thumbnail_url;
  const match = c.youtube_url?.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? c.youtube_url?.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1];
  return match
    ? `https://img.youtube.com/vi/${match}/hqdefault.jpg`
    : "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png";
}

export default function EnrollPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselect = searchParams.get("course");

  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
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
      .select("id,title,slug,thumbnail_url,youtube_url")
      .eq("published", true)
      .order("title", { ascending: true })
      .then(({ data }) => {
        const list = (data ?? []) as Course[];
        setCourses(list);
        if (preselect) {
          const found = list.find((c) => c.slug === preselect);
          if (found) setSelected(new Set([found.id]));
        }
        setLoading(false);
      });
  }, [preselect]);

  const totalAmount = selectAll ? ALL_PRICE : selected.size * SINGLE_PRICE;
  const selectedCourses = courses.filter((c) => selectAll || selected.has(c.id));

  function toggleCourse(id: string) {
    if (selectAll) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectAll((v) => !v);
    setSelected(new Set());
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  }

  function copyTextFallback(text: string) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.warn("Fallback copy failed:", err);
    }
    document.body.removeChild(textArea);
  }

  function copyUpi() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(UPI_ID)
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

  async function handleSubmit() {
    if (!utr && !proofFile) {
      setError("Please enter UTR number or upload payment screenshot.");
      return;
    }
    setError("");
    setSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Please log in first."); setSubmitting(false); return; }

    let paymentProofUrl: string | null = null;
    if (proofFile) {
      const ext = proofFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, proofFile, { upsert: true });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);
        paymentProofUrl = urlData.publicUrl;
      }
    }

    const courseIds = selectAll ? courses.map((c) => c.id) : [...selected];
    const courseTitles = selectAll
      ? "All Courses Bundle"
      : selectedCourses.map((c) => c.title).join(", ");

    const { error: insertError } = await supabase.from("lms_enrollment_requests").insert({
      user_id: user.id,
      course_title: courseTitles,
      course_ids: courseIds,
      amount_inr: totalAmount,
      upi_id: UPI_ID,
      utr_number: utr || null,
      payment_proof_url: paymentProofUrl,
      selected_all: selectAll,
      status: "pending",
    });

    setSubmitting(false);
    if (insertError) { setError(insertError.message); return; }
    setDone(true);
  }

  const qrData = encodeURIComponent(
    `upi://pay?pa=${UPI_ID}&pn=Charan%20Organics&am=${totalAmount}&cu=INR&tn=Course%20Enrollment`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${qrData}`;

  /* ── DONE STATE ── */
  if (done) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md w-full rounded-[2rem] bg-white p-10 text-center shadow-soft dark:bg-white/5">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-leaf/10">
            <PackageCheck size={40} className="text-leaf" />
          </div>
          <h1 className="mt-6 text-2xl font-black text-forest dark:text-cream">Request Submitted!</h1>
          <p className="mt-3 text-sm leading-6 text-ink/60 dark:text-cream/60">
            Your enrollment request has been sent to the admin. You will get access once it is approved.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-bold text-white hover:bg-leaf transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* ── Step bar ── */}
      <div className="border-b border-forest/10 bg-white dark:bg-white/5 dark:border-white/10">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4 sm:px-6">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
            className="grid size-9 place-items-center rounded-full bg-forest/5 hover:bg-forest/10 dark:bg-white/10"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="font-black text-forest dark:text-cream">Enroll in Courses</h1>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            {["Select Courses", "Payment", "Confirm"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                    step === i + 1
                      ? "bg-forest text-white"
                      : step > i + 1
                        ? "bg-leaf/15 text-leaf"
                        : "bg-forest/10 text-ink/50 dark:text-cream/40"
                  }`}
                >
                  {step > i + 1 ? <CheckCircle2 size={13} /> : <span>{i + 1}</span>}
                  {label}
                </div>
                {i < 2 && <ChevronRight size={14} className="text-ink/30" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* ══════════ STEP 1 ══════════ */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-black text-forest dark:text-cream">Choose your courses</h2>
            <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
              ₹{SINGLE_PRICE} per course &nbsp;·&nbsp; ₹{ALL_PRICE.toLocaleString("en-IN")} for all courses
            </p>

            {/* Select All toggle */}
            <button
              onClick={toggleSelectAll}
              className={`mt-5 flex w-full items-center gap-4 rounded-[1.5rem] border-2 p-4 text-left transition ${
                selectAll ? "border-leaf bg-leaf/5" : "border-forest/15 bg-white dark:bg-white/5 dark:border-white/15"
              }`}
            >
              <div
                className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition ${
                  selectAll ? "border-leaf bg-leaf" : "border-forest/30 dark:border-cream/30"
                }`}
              >
                {selectAll && <CheckCircle2 size={14} className="text-white" />}
              </div>
              <div className="flex-1">
                <p className="font-black text-forest dark:text-cream">All Courses Bundle</p>
                <p className="text-sm text-ink/60 dark:text-cream/60">
                  Access all {courses.length} courses + any future courses added
                </p>
              </div>
              <span className="text-xl font-black text-leaf">₹10,000</span>
            </button>

            {loading ? (
              <div className="mt-8 flex justify-center">
                <Loader2 className="animate-spin text-leaf" size={32} />
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => {
                  const isChecked = selectAll || selected.has(course.id);
                  return (
                    <button
                      key={course.id}
                      onClick={() => toggleCourse(course.id)}
                      className={`relative flex items-start gap-3 rounded-[1.5rem] border-2 p-3 text-left transition ${
                        isChecked
                          ? "border-leaf bg-leaf/5"
                          : "border-forest/10 bg-white hover:border-leaf/40 dark:bg-white/5 dark:border-white/10"
                      } ${selectAll ? "cursor-default opacity-80" : ""}`}
                    >
                      <img
                        src={getThumbnail(course)}
                        alt={course.title}
                        className="size-14 shrink-0 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-2 text-sm font-bold leading-5 text-forest dark:text-cream">
                          {course.title}
                        </p>
                        <p className="mt-1 text-xs font-bold text-leaf">₹{SINGLE_PRICE}</p>
                      </div>
                      <div
                        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition ${
                          isChecked ? "border-leaf bg-leaf" : "border-forest/25 dark:border-cream/25"
                        }`}
                      >
                        {isChecked && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Sticky bottom bar */}
            <div className="sticky bottom-4 mt-6">
              <div className="rounded-[1.5rem] bg-forest px-5 py-4 text-white shadow-soft flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/70">
                    {selectAll ? "All courses bundle" : `${selected.size} course${selected.size !== 1 ? "s" : ""} selected`}
                  </p>
                  <p className="text-2xl font-black">{formatCurrency(totalAmount)}</p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectAll && selected.size === 0}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-forest hover:bg-cream transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Proceed to Payment <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ STEP 2 ══════════ */}
        {step === 2 && (
          <div className="mx-auto max-w-lg">
            <h2 className="text-2xl font-black text-forest dark:text-cream">Pay via UPI</h2>
            <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
              Scan the QR code or copy the UPI ID to pay
            </p>

            <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink/60 dark:text-cream/60">Amount to pay</span>
                <span className="text-3xl font-black text-forest dark:text-cream">{formatCurrency(totalAmount)}</span>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-linen px-4 py-3 dark:bg-white/5">
                <div>
                  <p className="text-xs font-bold text-ink/50 dark:text-cream/50">UPI ID</p>
                  <p className="font-black text-forest dark:text-cream">{UPI_ID}</p>
                </div>
                <button
                  onClick={copyUpi}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                    copied ? "bg-leaf text-white" : "bg-forest/10 text-forest hover:bg-forest/20 dark:bg-white/10 dark:text-cream"
                  }`}
                >
                  <Copy size={13} /> {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="mt-5 flex justify-center">
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <img src={qrUrl} alt="UPI QR Code" className="size-52" />
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-ink/50 dark:text-cream/50">
                Scan with PhonePe, GPay, Paytm or any UPI app
              </p>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-leaf/20 bg-leaf/5 p-4">
              <p className="text-sm font-bold text-leaf">Courses selected:</p>
              <ul className="mt-2 space-y-1">
                {selectAll ? (
                  <li className="text-sm text-ink/70 dark:text-cream/70">All {courses.length} courses bundle</li>
                ) : (
                  selectedCourses.map((c) => (
                    <li key={c.id} className="text-sm text-ink/70 dark:text-cream/70">• {c.title}</li>
                  ))
                )}
              </ul>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border border-forest/15 bg-white py-3 text-sm font-bold text-forest hover:bg-cream transition dark:bg-white/10 dark:text-cream dark:border-white/15"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-forest py-3 text-sm font-bold text-white hover:bg-leaf transition"
              >
                I have paid — Continue <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════ STEP 3 ══════════ */}
        {step === 3 && (
          <div className="mx-auto max-w-lg">
            <h2 className="text-2xl font-black text-forest dark:text-cream">Confirm your payment</h2>
            <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
              Enter your UTR number or upload a payment screenshot
            </p>

            <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 space-y-5">
              {/* UTR */}
              <div>
                <label className="block text-sm font-bold text-forest dark:text-cream">
                  UTR / Transaction ID
                </label>
                <input
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="e.g. 425612345678"
                  className="mt-2 w-full rounded-2xl border border-forest/15 bg-linen px-4 py-3 text-sm outline-none focus:border-leaf dark:bg-white/5 dark:border-white/15 dark:text-cream dark:placeholder:text-cream/40"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-forest/10 dark:bg-white/10" />
                <span className="text-xs font-bold text-ink/40 dark:text-cream/40">OR</span>
                <div className="h-px flex-1 bg-forest/10 dark:bg-white/10" />
              </div>

              {/* Upload */}
              <div>
                <label className="block text-sm font-bold text-forest dark:text-cream">
                  Upload Payment Screenshot
                </label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                {proofPreview ? (
                  <div className="relative mt-2">
                    <img src={proofPreview} alt="Payment proof" className="w-full max-h-60 rounded-2xl object-contain" />
                    <button
                      onClick={() => { setProofFile(null); setProofPreview(null); }}
                      className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 shadow"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-2 flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-forest/20 py-8 text-sm text-ink/50 hover:border-leaf/50 hover:text-leaf transition dark:border-white/15 dark:text-cream/40"
                  >
                    <Upload size={24} />
                    <span className="font-semibold">Click to upload screenshot</span>
                    <span className="text-xs">(JPG, PNG)</span>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="mt-4 rounded-[1.5rem] bg-forest/5 p-4 text-sm dark:bg-white/5">
              <div className="flex justify-between">
                <span className="font-bold text-forest dark:text-cream">Amount paid</span>
                <span className="font-black text-leaf">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="mt-1 flex justify-between text-ink/60 dark:text-cream/60">
                <span>UPI ID</span>
                <span>{UPI_ID}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-full border border-forest/15 bg-white py-3 text-sm font-bold text-forest hover:bg-cream transition dark:bg-white/10 dark:text-cream dark:border-white/15"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-forest py-3 text-sm font-bold text-white hover:bg-leaf transition disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
