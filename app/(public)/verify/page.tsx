"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCheck,
  Globe,
  Printer,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Calendar,
  User,
  BookOpen,
  ArrowRight,
  Clock,
  Check,
  School,
  Lock,
} from "lucide-react";
import { BRAND_LOGO_SRC } from "@/components/brand-logo";
import { CertificateModal } from "@/components/certificate-modal";
import {
  verifyCertificateByCode,
  getSampleCertificateDemo,
  type VerificationResult,
} from "@/app/actions/certificates";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialId = searchParams.get("id") || "";

  const [inputCode, setInputCode] = useState(initialId);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sampleCode, setSampleCode] = useState<string>("CO-DEMO-2026");

  // Load sample code on mount
  useEffect(() => {
    getSampleCertificateDemo().then((code) => {
      if (code) setSampleCode(code);
    });
  }, []);

  // Auto-verify if ID is present in URL params
  useEffect(() => {
    if (initialId.trim()) {
      setInputCode(initialId.trim());
      handleVerify(initialId.trim());
    }
  }, [initialId]);

  function handleVerify(codeToTest?: string) {
    const code = (codeToTest ?? inputCode).trim();
    if (!code) return;

    startTransition(async () => {
      setHasSearched(true);
      const res = await verifyCertificateByCode(code);
      setResult(res);
      // Update browser URL without reload
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("id", code);
        window.history.replaceState({}, "", url.toString());
      }
    });
  }

  function handleCopyLink() {
    if (typeof window === "undefined") return;
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* ══════════ PORTAL HERO & HEADER ══════════ */}
        <div className="text-center space-y-4">
          {/* Official Emblem */}
          <div className="inline-flex items-center justify-center">
            <div className="relative grid size-20 sm:size-24 place-items-center rounded-3xl bg-white p-2 shadow-xl shadow-forest/10 ring-2 ring-[#c5a059]/50 dark:bg-white/10 dark:ring-white/20">
              <Image
                src={BRAND_LOGO_SRC}
                alt="Charan Organics Official Logo"
                width={80}
                height={80}
                className="size-full object-contain"
                priority
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 border border-emerald-600/20 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-400/30 dark:text-emerald-300">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Official Credential Registry & Verification</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-black text-forest dark:text-cream tracking-tight">
              Certificate Verification Portal
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-base text-ink/70 dark:text-cream/70 leading-relaxed">
              Verify the authenticity of digital diplomas, graduation certificates, and professional formulation masterclasses issued by{" "}
              <b className="text-forest dark:text-cream">Charan Organics Academy</b>.
            </p>
          </div>
        </div>

        {/* ══════════ SEARCH BAR CARD ══════════ */}
        <div className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-xl shadow-forest/5 dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="flex flex-col sm:flex-row items-stretch gap-3"
          >
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 dark:text-cream/40"
              />
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Enter Credential ID (e.g. CO-8F2K9A or CO-DEMO-2026)"
                className="w-full rounded-2xl border border-forest/15 bg-linen/50 pl-12 pr-4 py-3.5 text-sm sm:text-base font-bold font-mono tracking-wider text-forest placeholder:text-ink/40 placeholder:font-sans placeholder:tracking-normal focus:border-leaf focus:bg-white focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-cream dark:focus:border-white/30"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !inputCode.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-forest px-8 py-3.5 text-sm font-black text-white hover:bg-leaf disabled:opacity-50 transition shadow-lg shadow-forest/20 cursor-pointer"
            >
              {isPending ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Verify Credential</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-ink/60 dark:text-cream/60">
            <span>Fast instant lookup by official certificate serial number.</span>
            {sampleCode && (
              <button
                type="button"
                onClick={() => {
                  setInputCode(sampleCode);
                  handleVerify(sampleCode);
                }}
                className="inline-flex items-center gap-1.5 font-bold text-leaf hover:underline cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Try sample verified ID: <code className="font-mono font-black">{sampleCode}</code></span>
              </button>
            )}
          </div>
        </div>

        {/* ══════════ VERIFICATION RESULT ══════════ */}
        {hasSearched && result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {result.found && !result.isRevoked ? (
              /* ── VERIFIED ACTIVE CERTIFICATE DOSSIER ── */
              <div className="relative rounded-[2.5rem] bg-white p-6 sm:p-10 shadow-2xl dark:bg-[#071710] border-2 border-emerald-500/40 ring-4 ring-emerald-500/10 space-y-8 overflow-hidden">
                {/* Decorative background watermark */}
                <div className="absolute right-[-40px] top-[-40px] size-72 opacity-[0.03] pointer-events-none select-none">
                  <Image
                    src={BRAND_LOGO_SRC}
                    alt="Watermark"
                    width={288}
                    height={288}
                    className="size-full object-contain"
                  />
                </div>

                {/* Top Status Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest/10 pb-6 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                      <ShieldCheck size={28} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream">
                          Authentic Credential Verified
                        </h2>
                        <span className="rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-ink/60 dark:text-cream/60">
                        Officially logged in Charan Organics Academy Accredited Database
                      </p>
                    </div>
                  </div>

                  {/* Actions: Copy Link & Print */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 px-3.5 py-2 text-xs font-bold text-forest dark:border-white/20 dark:text-cream hover:bg-forest/5 transition cursor-pointer"
                      title="Copy public verification link"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copied ? "Link Copied!" : "Share Link"}</span>
                    </button>

                    <button
                      onClick={() => setModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow-md transition scale-100 hover:scale-105 cursor-pointer"
                    >
                      <Award size={15} />
                      <span>View Official Certificate</span>
                    </button>
                  </div>
                </div>

                {/* Dossier Information Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Candidate Name */}
                  <div className="rounded-2xl bg-linen/50 p-4 dark:bg-white/5 border border-forest/10 dark:border-white/10">
                    <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-ink/50 dark:text-cream/50 mb-1">
                      <User size={13} className="text-[#c5a059]" /> Candidate Legal Name
                    </span>
                    <p className="text-base sm:text-lg font-black text-forest dark:text-cream break-words">
                      {result.studentName}
                    </p>
                    {result.studentEmail && (
                      <p className="text-[11px] text-ink/50 dark:text-cream/50 pt-0.5">
                        {result.studentEmail}
                      </p>
                    )}
                  </div>

                  {/* Course / Program */}
                  <div className="rounded-2xl bg-linen/50 p-4 dark:bg-white/5 border border-forest/10 dark:border-white/10 sm:col-span-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-ink/50 dark:text-cream/50 mb-1">
                      <BookOpen size={13} className="text-[#c5a059]" /> Course & Masterclass
                    </span>
                    <p className="text-base sm:text-lg font-black text-forest dark:text-cream leading-snug">
                      {result.courseTitle}
                    </p>
                    <p className="text-[11px] text-leaf dark:text-emerald-400 font-bold pt-0.5">
                      Faculty of Botanical Arts & Organic Cosmetic Formulation
                    </p>
                  </div>

                  {/* Serial Number & Issue Date */}
                  <div className="rounded-2xl bg-linen/50 p-4 dark:bg-white/5 border border-forest/10 dark:border-white/10">
                    <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-ink/50 dark:text-cream/50 mb-1">
                      <Calendar size={13} className="text-[#c5a059]" /> Award & Credential ID
                    </span>
                    <p className="font-mono text-base font-black text-[#854d0e] dark:text-amber-400">
                      {result.certificateNo}
                    </p>
                    <p className="text-[11px] text-ink/60 dark:text-cream/60 pt-0.5">
                      Awarded:{" "}
                      <b>
                        {result.issuedAt
                          ? new Date(result.issuedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Verified"}
                      </b>
                    </p>
                  </div>
                </div>

                {/* Academy Attestation Notice */}
                <div className="rounded-2xl bg-emerald-500/5 p-4 sm:p-5 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 size={16} />
                    <span>Official Certification Guarantee</span>
                  </div>
                  <p className="leading-relaxed">
                    This digital credential certifies that the candidate has completed all practical formulation batches, laboratory safety standards, and preservation protocols verified by <b>Director K. Chinnammadu</b> at Charan Organics Academy.
                  </p>
                </div>
              </div>
            ) : result.isRevoked ? (
              /* ── REVOKED CERTIFICATE ALERT ── */
              <div className="rounded-[2.5rem] bg-red-50 p-6 sm:p-8 text-red-900 shadow-xl dark:bg-red-950/40 dark:text-red-200 border-2 border-red-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-2xl bg-red-600 text-white">
                    <ShieldAlert size={28} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black">Credential Revoked</h2>
                    <p className="text-xs opacity-80">
                      Credential ID: <code className="font-mono font-black">{result.certificateNo}</code>
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">
                  This certificate has been revoked by Charan Organics Academy administration. It is no longer valid or accredited. For questions or disputes, please contact orders@charanorganics.com.
                </p>
              </div>
            ) : (
              /* ── NOT FOUND ALERT ── */
              <div className="rounded-[2.5rem] bg-amber-500/10 p-6 sm:p-8 shadow-xl dark:bg-amber-400/5 border-2 border-amber-500/30 text-amber-950 dark:text-amber-200 space-y-4 text-center">
                <ShieldAlert size={36} className="mx-auto text-amber-600" />
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-amber-900 dark:text-amber-300">
                    Credential Not Found
                  </h2>
                  <p className="max-w-md mx-auto text-xs sm:text-sm text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                    {result.message}
                  </p>
                </div>
                <p className="text-xs text-ink/50 dark:text-cream/50">
                  Please ensure the certificate ID is typed accurately (e.g. <code>CO-XXXXXX</code>) or verify with the candidate.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══════════ ACCREDITATION & TRUST PILLARS ══════════ */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-6">
          <div className="rounded-2xl bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-2">
            <div className="grid size-9 place-items-center rounded-xl bg-forest/5 text-forest dark:bg-white/10 dark:text-cream">
              <Lock size={18} />
            </div>
            <h3 className="font-bold text-forest dark:text-cream text-sm">Anti-Fraud Database</h3>
            <p className="text-xs text-ink/60 dark:text-cream/60 leading-relaxed">
              Every issued certificate carries an immutable, tamper-resistant serial number tracked in our real-time database.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-2">
            <div className="grid size-9 place-items-center rounded-xl bg-forest/5 text-forest dark:bg-white/10 dark:text-cream">
              <Award size={18} />
            </div>
            <h3 className="font-bold text-forest dark:text-cream text-sm">70% Minimum Threshold</h3>
            <p className="text-xs text-ink/60 dark:text-cream/60 leading-relaxed">
              Awarded strictly to students completing at least 70% of professional formulation curriculum and laboratory tests.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-2">
            <div className="grid size-9 place-items-center rounded-xl bg-forest/5 text-forest dark:bg-white/10 dark:text-cream">
              <School size={18} />
            </div>
            <h3 className="font-bold text-forest dark:text-cream text-sm">Registered Trademark</h3>
            <p className="text-xs text-ink/60 dark:text-cream/60 leading-relaxed">
              Charan Organics is an officially registered academy under The Trademarks Act, 1999 (Govt. of India).
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-2">
            <div className="grid size-9 place-items-center rounded-xl bg-forest/5 text-forest dark:bg-white/10 dark:text-cream">
              <Globe size={18} />
            </div>
            <h3 className="font-bold text-forest dark:text-cream text-sm">Industry Recognition</h3>
            <p className="text-xs text-ink/60 dark:text-cream/60 leading-relaxed">
              Recognized across cosmetic indie brands, organic beauty labs, and soap manufacturing businesses.
            </p>
          </div>
        </div>

        {/* ══════════ CERTIFICATE MODAL VIEWER ══════════ */}
        {result?.found && (
          <CertificateModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            courseTitle={result.courseTitle}
            initialName={result.studentName}
            initialCertId={result.certificateNo}
            initialEndDate={
              result.issuedAt
                ? new Date(result.issuedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : undefined
            }
            completionPercentage={100}
          />
        )}
      </div>
    </div>
  );
}

export default function CertificateVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center space-y-3">
            <div className="size-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-forest dark:text-cream">
              Loading Verification Portal...
            </p>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
