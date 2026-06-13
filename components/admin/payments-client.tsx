"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  ImageOff,
  Search,
  XCircle,
} from "lucide-react";

type PaymentRecord = {
  id: string;
  status: string;
  course_title: string;
  amount_inr: number;
  upi_id: string | null;
  utr_number: string | null;
  payment_proof_url: string | null;
  selected_all: boolean;
  requested_at: string;
  admin_note: string | null;
  lms_profiles: { full_name: string | null; email: string } | null;
};

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 size={12} /> Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600 dark:bg-red-950/30 dark:text-red-400">
        <XCircle size={12} /> Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
      <Clock size={12} /> Pending
    </span>
  );
}

function ProofModal({
  url,
  name,
  onClose,
}: {
  url: string;
  name: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full mx-4 rounded-3xl bg-white dark:bg-[#1a1a1a] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
          <div>
            <p className="font-black text-forest dark:text-cream text-sm">Payment Proof</p>
            <p className="text-xs text-ink/55 dark:text-cream/55">{name}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-leaf px-3 py-1.5 text-xs font-bold text-white"
            >
              <ExternalLink size={12} /> Open
            </a>
            <a
              href={url}
              download
              className="flex items-center gap-1.5 rounded-xl bg-forest/10 dark:bg-white/10 px-3 py-1.5 text-xs font-bold text-forest dark:text-cream"
            >
              <Download size={12} /> Save
            </a>
            <button
              onClick={onClose}
              className="ml-1 rounded-xl bg-black/5 dark:bg-white/10 px-3 py-1.5 text-xs font-bold text-ink dark:text-cream"
            >
              ✕ Close
            </button>
          </div>
        </div>
        <div className="p-4">
          <img
            src={url}
            alt="Payment proof"
            className="w-full max-h-[70vh] object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

export function PaymentsClient({
  initialRequests,
}: {
  initialRequests: PaymentRecord[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "approved" | "rejected" | "pending">("all");
  const [proofModal, setProofModal] = useState<{ url: string; name: string } | null>(null);

  const filtered = initialRequests.filter((r) => {
    const name = r.lms_profiles?.full_name ?? "";
    const email = r.lms_profiles?.email ?? "";
    const matchSearch =
      search === "" ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      (r.utr_number ?? "").toLowerCase().includes(search.toLowerCase()) ||
      r.course_title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  });

  const totalAmount = initialRequests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + (r.amount_inr ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Records", value: initialRequests.length, color: "text-forest dark:text-cream" },
          { label: "Pending", value: initialRequests.filter((r) => r.status === "pending").length, color: "text-amber-600 dark:text-amber-400" },
          { label: "Approved", value: initialRequests.filter((r) => r.status === "approved").length, color: "text-green-600 dark:text-green-400" },
          { label: "Revenue Confirmed", value: formatINR(totalAmount), color: "text-leaf" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white dark:bg-white/5 shadow-soft p-4">
            <p className="text-xs font-bold text-ink/50 dark:text-cream/50">{s.label}</p>
            <p className={`mt-1 text-xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-cream/40" />
          <input
            type="text"
            placeholder="Search by name, email, UTR or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-forest/15 bg-white pl-9 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:bg-white/5 dark:text-cream dark:border-white/10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-4 py-2 text-xs font-black capitalize transition-colors ${
                filter === f
                  ? "bg-forest text-cream"
                  : "bg-white dark:bg-white/5 text-ink/60 dark:text-cream/60 border border-forest/10 dark:border-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <div className="rounded-[2rem] bg-white dark:bg-white/5 p-10 text-center shadow-soft">
          <p className="font-black text-forest dark:text-cream">No records found</p>
          <p className="mt-1 text-sm text-ink/50 dark:text-cream/50">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((r) => {
            const name = r.lms_profiles?.full_name ?? "Unknown";
            const email = r.lms_profiles?.email ?? "—";
            const date = new Date(r.requested_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={r.id}
                className="rounded-[2rem] bg-white dark:bg-white/5 shadow-soft overflow-hidden"
              >
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <StatusBadge status={r.status} />
                      <h3 className="mt-2 text-lg font-black text-forest dark:text-cream">{name}</h3>
                      <p className="text-sm text-ink/55 dark:text-cream/55">{email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-forest dark:text-cream">{formatINR(r.amount_inr)}</p>
                      <p className="text-xs text-ink/45 dark:text-cream/45">{date}</p>
                    </div>
                  </div>

                  {/* Course */}
                  <div className="mt-4 rounded-2xl bg-linen dark:bg-white/5 p-3">
                    <p className="text-xs font-bold text-ink/50 dark:text-cream/50 mb-0.5">Course</p>
                    <p className="text-sm font-semibold text-forest dark:text-cream">{r.course_title}</p>
                  </div>

                  {/* UTR + UPI */}
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-linen dark:bg-white/5 p-3">
                      <p className="text-xs font-bold text-ink/50 dark:text-cream/50 mb-0.5">UTR Number</p>
                      <p className="text-sm font-black text-forest dark:text-cream font-mono">
                        {r.utr_number ?? <span className="font-normal text-ink/40 dark:text-cream/40">—</span>}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-linen dark:bg-white/5 p-3">
                      <p className="text-xs font-bold text-ink/50 dark:text-cream/50 mb-0.5">UPI ID</p>
                      <p className="text-sm font-semibold text-forest dark:text-cream truncate">
                        {r.upi_id ?? <span className="font-normal text-ink/40 dark:text-cream/40">—</span>}
                      </p>
                    </div>
                  </div>

                  {/* Payment Proof Screenshot */}
                  <div className="mt-3 rounded-2xl border border-forest/10 dark:border-white/10 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-forest/5 dark:bg-white/5">
                      <p className="text-xs font-black text-forest dark:text-cream">📄 Payment Screenshot</p>
                      {r.payment_proof_url && (
                        <button
                          onClick={() => setProofModal({ url: r.payment_proof_url!, name })}
                          className="flex items-center gap-1 text-xs font-bold text-leaf underline"
                        >
                          <ExternalLink size={11} /> View Full
                        </button>
                      )}
                    </div>

                    {r.payment_proof_url ? (
                      <button
                        onClick={() => setProofModal({ url: r.payment_proof_url!, name })}
                        className="block w-full"
                      >
                        <img
                          src={r.payment_proof_url}
                          alt="Payment screenshot"
                          className="w-full max-h-48 object-contain bg-black/5 dark:bg-white/5"
                        />
                      </button>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 py-8 bg-black/5 dark:bg-white/5">
                        <ImageOff size={28} className="text-ink/20 dark:text-cream/20" />
                        <p className="text-xs text-ink/40 dark:text-cream/40">No screenshot uploaded</p>
                      </div>
                    )}
                  </div>

                  {r.admin_note && (
                    <p className="mt-3 text-xs text-ink/55 dark:text-cream/55 italic bg-amber-50 dark:bg-amber-950/20 rounded-xl px-3 py-2">
                      ⚠️ Admin note: {r.admin_note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox modal */}
      {proofModal && (
        <ProofModal
          url={proofModal.url}
          name={proofModal.name}
          onClose={() => setProofModal(null)}
        />
      )}
    </div>
  );
}
