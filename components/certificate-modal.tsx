"use client";

import { useState } from "react";
import { Award, CheckCircle2, Download, Printer, Sparkles, X, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [step, setStep] = useState<"input" | "certificate">("input");
  const [certName, setCertName] = useState(initialName || "");
  const [certId] = useState(() => `CO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {step === "input" ? (
        /* ══════════ STEP 1: Name Input Modal ══════════ */
        <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-[#0e1f18] border border-forest/10 dark:border-white/10 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-forest/10 pb-4 dark:border-white/10">
            <div className="flex items-center gap-2 font-black text-forest dark:text-cream text-lg">
              <Award className="text-amber-500" size={24} />
              <span>Generate Certificate</span>
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
                Name on Certificate *
              </label>
              <input
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                placeholder="Enter your full legal name"
                required
                className="w-full rounded-2xl border border-forest/15 bg-linen px-4 py-3 text-sm font-bold outline-none focus:border-leaf dark:bg-white/10 dark:border-white/15 dark:text-cream"
              />
              <p className="mt-1 text-[11px] text-ink/40 dark:text-cream/40">
                Enter your name exactly as you want it printed on your certificate.
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
                <Sparkles size={15} /> View Certificate
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ══════════ STEP 2: Certificate View & Print Layout ══════════ */
        <div className="w-full max-w-4xl rounded-[2rem] bg-white p-4 sm:p-8 shadow-2xl dark:bg-[#0e1f18] border border-forest/10 dark:border-white/10 space-y-6 max-h-[95vh] overflow-y-auto">
          {/* Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest/10 pb-4 dark:border-white/10 print:hidden">
            <div>
              <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
                <Award className="text-amber-500" size={24} /> Certificate Ready!
              </h2>
              <p className="text-xs text-ink/60 dark:text-cream/60 mt-0.5">
                Click <b>Print / Save as PDF</b> below to download or print your official certificate.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStep("input")}
                className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 px-4 py-2 text-xs font-bold text-forest dark:border-white/15 dark:text-cream hover:bg-forest/5 transition"
              >
                <Edit3 size={14} /> Edit Name
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition"
              >
                <Printer size={15} /> Print / Save as PDF
              </button>

              <button
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full bg-forest/5 hover:bg-forest/10 dark:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Printable Certificate Template Document */}
          <div
            id="certificate-print-area"
            className="relative mx-auto w-full aspect-[1.414/1] max-w-3xl rounded-3xl border-[12px] border-amber-600/30 bg-[#fffdf7] p-8 sm:p-12 text-center text-forest shadow-xl dark:bg-[#fbf7ee] dark:text-[#0b291a] flex flex-col justify-between overflow-hidden"
          >
            {/* Background Emblem Watermark */}
            <div className="absolute inset-0 grid place-items-center opacity-5 pointer-events-none">
              <Award size={380} className="text-amber-700" />
            </div>

            {/* Corner Decorative Ornaments */}
            <div className="absolute top-4 left-4 size-10 border-t-4 border-l-4 border-amber-600/60" />
            <div className="absolute top-4 right-4 size-10 border-t-4 border-r-4 border-amber-600/60" />
            <div className="absolute bottom-4 left-4 size-10 border-b-4 border-l-4 border-amber-600/60" />
            <div className="absolute bottom-4 right-4 size-10 border-b-4 border-r-4 border-amber-600/60" />

            {/* Certificate Header */}
            <div className="space-y-2 relative z-10 pt-2">
              <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-emerald-800">
                <Sparkles size={16} className="text-amber-500" /> Charan Organics Academy <Sparkles size={16} className="text-amber-500" />
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-extrabold uppercase tracking-wider text-amber-900 border-b-2 border-amber-600/30 pb-3 max-w-md mx-auto">
                Certificate of Completion
              </h1>
            </div>

            {/* Certificate Body */}
            <div className="my-6 space-y-4 relative z-10">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-900/70">
                This is proudly presented to
              </p>
              <h2 className="font-serif text-2xl sm:text-4xl font-black text-emerald-950 underline decoration-amber-500/50 underline-offset-8">
                {certName}
              </h2>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed text-emerald-900/80 max-w-xl mx-auto pt-2">
                for successfully completing the professional organic formulation course
              </p>
              <h3 className="text-base sm:text-xl font-black text-amber-900 max-w-lg mx-auto leading-snug">
                "{courseTitle}"
              </h3>
              <p className="text-[11px] sm:text-xs font-semibold text-emerald-900/70">
                with {completionPercentage}% curriculum completion & practical formulation mastery.
              </p>
            </div>

            {/* Certificate Footer Seals & Signatures */}
            <div className="flex items-end justify-between border-t border-amber-600/30 pt-6 relative z-10 text-left text-[11px] sm:text-xs font-bold text-emerald-950">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-emerald-900/50">Issued On</p>
                <p className="font-extrabold">{todayDate}</p>
                <p className="mt-1 font-mono text-[10px] text-amber-800">ID: {certId}</p>
              </div>

              {/* Official Seal Graphic */}
              <div className="grid size-14 sm:size-18 place-items-center rounded-full border-2 border-dashed border-amber-600/60 bg-amber-500/10 text-amber-800">
                <Award size={28} className="text-amber-700" />
              </div>

              <div className="text-right">
                <p className="font-serif italic text-sm font-extrabold text-amber-900">Charan Organics</p>
                <div className="h-0.5 w-28 bg-emerald-900/30 ml-auto my-1" />
                <p className="text-[10px] uppercase tracking-wider text-emerald-900/70">Authorized Academy Director</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
