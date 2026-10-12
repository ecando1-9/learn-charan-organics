"use client";

import { useState } from "react";
import { Award, CheckCircle2, Download, Printer, Sparkles, X, Edit3, ShieldCheck, Leaf } from "lucide-react";

export function CertificateModal({
  open,
  onClose,
  courseTitle,
  initialName,
  completionPercentage,
}: {
  open: boolean;
  onClose: () => void;
  courseTitle: string;
  initialName: string;
  completionPercentage: number;
}) {
  // If student name is known, open directly in certificate view for 1-click download/print
  const [step, setStep] = useState<"input" | "certificate">(() =>
    initialName && initialName.trim() ? "certificate" : "input"
  );
  const [certName, setCertName] = useState(initialName || "");
  const [certId] = useState(
    () => `CO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  );
  const todayDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!open) return null;

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!certName.trim()) return;
    setStep("certificate");
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* ── Print Stylesheet ── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-print-area,
          #certificate-print-area * {
            visibility: visible;
          }
          #certificate-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            max-height: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: landscape;
            margin: 0mm;
          }
        }
      `}</style>

      {step === "input" ? (
        /* ══════════ STEP 1: Name Input Modal (Only if name needed) ══════════ */
        <div className="w-full max-w-md rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl dark:bg-[#0e1f18] border border-forest/10 dark:border-white/10 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-forest/10 pb-4 dark:border-white/10">
            <div className="flex items-center gap-2 font-black text-forest dark:text-cream text-lg">
              <Award className="text-amber-500" size={24} />
              <span>Issue Your Certificate</span>
            </div>
            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-full bg-forest/5 hover:bg-forest/10 dark:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleGenerate} className="mt-5 space-y-4">
            <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 text-xs space-y-1">
              <p className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <CheckCircle2 size={15} /> Eligible for Certificate ({completionPercentage}% completed)
              </p>
              <p className="text-amber-600/80 dark:text-amber-400/80">
                Course: <b>{courseTitle}</b>
              </p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-ink/60 dark:text-cream/60 tracking-wider mb-2">
                Candidate Legal Name *
              </label>
              <input
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                placeholder="e.g. Neeluru Yuvakiran Reddy"
                required
                className="w-full rounded-2xl border border-forest/15 bg-linen px-4 py-3 text-sm font-bold outline-none focus:border-leaf dark:bg-white/10 dark:border-white/15 dark:text-cream"
              />
              <p className="mt-1 text-[11px] text-ink/40 dark:text-cream/40">
                Enter your name exactly as it should appear on your official credential.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-forest/15 py-3 text-xs font-bold text-forest dark:border-white/15 dark:text-cream"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-forest py-3 text-xs font-bold text-white hover:bg-leaf transition"
              >
                <Sparkles size={15} /> Generate Certificate
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ══════════ STEP 2: Executive Industry-Standard Certificate View ══════════ */
        <div className="w-full max-w-5xl rounded-[2.5rem] bg-white p-4 sm:p-7 shadow-2xl dark:bg-[#071710] border border-forest/10 dark:border-white/10 space-y-5 max-h-[96vh] overflow-y-auto">
          {/* Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest/10 pb-4 dark:border-white/10 print:hidden">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Award size={18} />
                </span>
                <h2 className="text-lg sm:text-xl font-black text-forest dark:text-cream">
                  Official Certificate Ready
                </h2>
                <span className="rounded-full bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5">
                  Verified Credential
                </span>
              </div>
              <p className="text-xs text-ink/60 dark:text-cream/60 mt-1">
                Issued for <b>{courseTitle}</b>. Single-click to print or save high-resolution PDF.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStep("input")}
                className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 px-3.5 py-2 text-xs font-bold text-forest dark:border-white/20 dark:text-cream hover:bg-forest/5 transition"
                title="Change name on certificate"
              >
                <Edit3 size={13} /> Edit Name
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow-md transition scale-100 hover:scale-105 active:scale-95"
              >
                <Printer size={15} /> Print / Save as PDF
              </button>

              <button
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full bg-black/5 dark:bg-white/10 text-ink dark:text-cream hover:bg-black/10 transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ══════════ INDUSTRY-STANDARD CERTIFICATE DOCUMENT ══════════ */}
          <div
            id="certificate-print-area"
            className="relative mx-auto w-full aspect-[1.414/1] max-w-4xl rounded-2xl sm:rounded-[2rem] bg-[#fbf9f4] text-[#0a2318] shadow-2xl overflow-hidden flex flex-col justify-between p-6 sm:p-10 md:p-12 border-[8px] sm:border-[12px] border-[#0e3827] ring-4 sm:ring-8 ring-[#c5a059]/40 select-none"
          >
            {/* Background Guilloché Watermark & Soft Radial Lighting */}
            <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
            <div className="absolute inset-0 grid place-items-center opacity-[0.04] pointer-events-none">
              <Leaf size={420} className="text-[#0e3827]" />
            </div>

            {/* Inner Gold Inset Border with Corner Scrolls */}
            <div className="absolute inset-3 sm:inset-4 border-2 border-[#c5a059] rounded-xl pointer-events-none" />
            <div className="absolute top-5 left-5 size-7 sm:size-9 border-t-4 border-l-4 border-[#c5a059]" />
            <div className="absolute top-5 right-5 size-7 sm:size-9 border-t-4 border-r-4 border-[#c5a059]" />
            <div className="absolute bottom-5 left-5 size-7 sm:size-9 border-b-4 border-l-4 border-[#c5a059]" />
            <div className="absolute bottom-5 right-5 size-7 sm:size-9 border-b-4 border-r-4 border-[#c5a059]" />

            {/* ── HEADER ── */}
            <div className="relative z-10 text-center space-y-1 pt-1 sm:pt-2">
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-[#0e3827]">
                <Leaf size={14} className="text-[#c5a059]" />
                <span>Charan Organics Academy</span>
                <Leaf size={14} className="text-[#c5a059]" />
              </div>
              <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#854d0e]">
                Faculty of Botanical Arts & Organic Cosmetic Formulation
              </p>
              <div className="pt-2 sm:pt-3">
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-widest text-[#0e3827] drop-shadow-xs">
                  Certificate of Completion
                </h1>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#c5a059] mt-0.5">
                  & Professional Formulation Mastery
                </p>
                <div className="mx-auto mt-2 h-0.5 w-36 sm:w-48 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent" />
              </div>
            </div>

            {/* ── CANDIDATE & COURSE BODY ── */}
            <div className="relative z-10 text-center my-auto py-2 space-y-2 sm:space-y-3">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#0e3827]/70">
                This certifies that
              </p>

              {/* Candidate Legal Name */}
              <div className="px-4">
                <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black text-[#0e3827] tracking-wide break-words max-w-2xl mx-auto leading-tight">
                  {certName || "Valued Academy Student"}
                </h2>
                <div className="mx-auto mt-1 h-0.5 w-52 sm:w-80 bg-[#c5a059]/60" />
              </div>

              <p className="text-[11px] sm:text-xs font-medium text-[#0e3827]/80 max-w-xl mx-auto leading-relaxed pt-1">
                has successfully fulfilled all academic curriculum requirements, practical laboratory formulation tests, and batch scaling modules for
              </p>

              {/* Course Title */}
              <div className="px-4">
                <h3 className="font-serif text-lg sm:text-2xl md:text-3xl font-extrabold text-[#78350f] max-w-2xl mx-auto leading-snug">
                  &ldquo;{courseTitle}&rdquo;
                </h3>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0e3827]/5 border border-[#0e3827]/15 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-[#0e3827]">
                <ShieldCheck size={13} className="text-[#c5a059]" />
                <span>Curriculum Completion: <b>{completionPercentage}%</b> • Practical Formulation Verified</span>
              </div>
            </div>

            {/* ── FOOTER: VALIDATION, GOLD SEAL & AUTHORIZED SIGNATURE ── */}
            <div className="relative z-10 grid grid-cols-3 items-end gap-2 border-t border-[#c5a059]/40 pt-4 sm:pt-6 text-[10px] sm:text-xs text-[#0e3827]">
              {/* Left Column: Issue Info & Verification ID */}
              <div className="text-left space-y-0.5">
                <p className="text-[9px] uppercase tracking-wider font-bold text-[#0e3827]/60">Date of Award</p>
                <p className="font-extrabold text-[#0e3827]">{todayDate}</p>
                <p className="font-mono text-[9px] sm:text-[10px] font-bold text-[#854d0e] pt-1">
                  Credential ID: {certId}
                </p>
                <p className="text-[8px] sm:text-[9px] text-[#0e3827]/50 truncate">
                  learn.charanorganics.com/verify
                </p>
              </div>

              {/* Center Column: Official Golden Wax Medal Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative grid size-16 sm:size-20 md:size-24 place-items-center rounded-full bg-gradient-to-br from-[#ffd700] via-[#c5a059] to-[#996515] p-1 shadow-lg border-2 border-white ring-2 ring-[#c5a059]">
                  <div className="grid size-full place-items-center rounded-full border border-dashed border-[#5a3a08] bg-[#fbf9f4]/95 text-center p-1">
                    <Award size={20} className="text-[#854d0e] sm:size-6" />
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter text-[#5a3a08] leading-none">
                      Verified Seal
                    </span>
                    <span className="text-[6px] font-bold text-[#854d0e] leading-none">
                      Charan Organics
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Authorized Academy Director Signature */}
              <div className="text-right space-y-0.5">
                <p className="font-serif italic text-sm sm:text-base md:text-lg font-black text-[#0e3827] leading-none">
                  K. Chinnammadu
                </p>
                <div className="h-0.5 w-24 sm:w-36 bg-[#0e3827]/40 ml-auto my-1" />
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#0e3827]">
                  Director & Master Formulator
                </p>
                <p className="text-[8px] sm:text-[9px] text-[#0e3827]/60">
                  Charan Organics Academy
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
