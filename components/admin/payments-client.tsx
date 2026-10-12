"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  ImageOff,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { approveEnrollment, rejectEnrollment } from "@/app/actions/enrollment";

export type PaymentRecord = {
  id: string;
  status: string;
  course_title: string;
  course_details: { name: string; amount_inr: number }[];
  course_count: number;
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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
        <CheckCircle2 size={13} /> Approved & Active
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700 dark:bg-red-950/40 dark:text-red-300">
        <XCircle size={13} /> Rejected / Revoked
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
      <Clock size={13} /> Awaiting Approval
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-xl w-full rounded-[2rem] bg-white dark:bg-[#111b21] shadow-2xl overflow-hidden border border-forest/10 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 bg-linen/50 dark:bg-white/5">
          <div>
            <p className="font-black text-forest dark:text-cream text-base">Payment Screenshot</p>
            <p className="text-xs text-ink/60 dark:text-cream/60">{name}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-leaf px-3.5 py-1.5 text-xs font-bold text-white hover:bg-forest transition"
            >
              <ExternalLink size={13} /> Open Original
            </a>
            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 transition text-ink dark:text-cream"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="p-4 max-h-[75vh] overflow-y-auto bg-black/5 dark:bg-black/30 flex items-center justify-center">
          <img
            src={url}
            alt="Payment proof"
            className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-md"
          />
        </div>
      </div>
    </div>
  );
}

function CoursesModal({
  courses,
  studentName,
  totalAmount,
  onClose,
}: {
  courses: { name: string; amount_inr: number }[];
  studentName: string;
  totalAmount: number;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full rounded-[2rem] bg-white dark:bg-[#111b21] shadow-2xl overflow-hidden border border-forest/10 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/10 bg-linen/50 dark:bg-white/5">
          <div>
            <p className="font-black text-forest dark:text-cream text-lg">
              Selected Courses ({courses.length})
            </p>
            <p className="text-xs text-ink/60 dark:text-cream/60">
              Student: <b className="text-forest dark:text-cream">{studentName}</b>
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 transition text-ink dark:text-cream"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2.5">
          {courses.map((c, i) => (
            <div
              key={`${c.name}-${i}`}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-linen/60 dark:bg-white/5 border border-forest/5 dark:border-white/5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="grid size-6 place-items-center rounded-full bg-forest/10 text-forest dark:bg-white/10 dark:text-cream text-[11px] font-black shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs sm:text-sm font-bold text-forest dark:text-cream truncate">
                  🌿 {c.name}
                </span>
              </div>
              <span className="font-black text-xs sm:text-sm text-leaf shrink-0">
                {formatINR(c.amount_inr)}
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-linen dark:bg-white/5 border-t border-forest/10 dark:border-white/10 flex items-center justify-between">
          <span className="text-xs font-bold text-ink/60 dark:text-cream/60 uppercase">Total Amount</span>
          <span className="text-lg font-black text-forest dark:text-cream">{formatINR(totalAmount)}</span>
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
  const [requests, setRequests] = useState<PaymentRecord[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "approved" | "rejected" | "pending">("all");
  const [proofModal, setProofModal] = useState<{ url: string; name: string } | null>(null);
  const [coursesModal, setCoursesModal] = useState<{
    courses: { name: string; amount_inr: number }[];
    studentName: string;
    totalAmount: number;
  } | null>(null);

  // Action states per request
  const [actionLoading, setActionLoading] = useState<{ [id: string]: "approve" | "reject" | null }>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<{ [id: string]: string }>({});

  async function handleApprove(id: string) {
    setActionLoading((prev) => ({ ...prev, [id]: "approve" }));
    setErrorMsg((prev) => ({ ...prev, [id]: "" }));

    const res = await approveEnrollment(id);
    setActionLoading((prev) => ({ ...prev, [id]: null }));

    if (res.error) {
      setErrorMsg((prev) => ({ ...prev, [id]: res.error || "Approval failed" }));
    } else {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
      );
    }
  }

  async function handleReject(id: string) {
    setActionLoading((prev) => ({ ...prev, [id]: "reject" }));
    setErrorMsg((prev) => ({ ...prev, [id]: "" }));

    const res = await rejectEnrollment(id, rejectNote || undefined);
    setActionLoading((prev) => ({ ...prev, [id]: null }));
    setRejectingId(null);
    setRejectNote("");

    if (res.error) {
      setErrorMsg((prev) => ({ ...prev, [id]: res.error || "Rejection failed" }));
    } else {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: "rejected", admin_note: rejectNote || r.admin_note }
            : r
        )
      );
    }
  }

  const filtered = requests.filter((r) => {
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

  const totalAmount = requests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + (r.amount_inr ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Requests", value: requests.length, color: "text-forest dark:text-cream" },
          { label: "Pending Approval", value: requests.filter((r) => r.status === "pending").length, color: "text-amber-600 dark:text-amber-400" },
          { label: "Approved (Active)", value: requests.filter((r) => r.status === "approved").length, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Confirmed Revenue", value: formatINR(totalAmount), color: "text-leaf" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white dark:bg-white/5 shadow-soft p-4 border border-forest/10 dark:border-white/10">
            <p className="text-xs font-bold text-ink/50 dark:text-cream/50">{s.label}</p>
            <p className={`mt-1 text-xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 dark:text-cream/40" />
          <input
            type="text"
            placeholder="Search by student name, email, UTR, or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-forest/15 bg-white pl-10 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:bg-white/5 dark:text-cream dark:border-white/10"
          />
        </div>
        <div className="flex gap-1.5 p-1 rounded-2xl bg-white dark:bg-white/5 border border-forest/10 dark:border-white/10">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-4 py-2 text-xs font-black capitalize transition ${
                filter === f
                  ? "bg-forest text-cream shadow-sm dark:bg-emerald-600 dark:text-white"
                  : "text-ink/60 dark:text-cream/60 hover:text-forest dark:hover:text-cream"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Records Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-[2rem] bg-white dark:bg-white/5 p-10 text-center shadow-soft border border-forest/10 dark:border-white/10">
          <p className="font-black text-forest dark:text-cream text-lg">No payment records found</p>
          <p className="mt-1 text-sm text-ink/50 dark:text-cream/50">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((r) => {
            const name = r.lms_profiles?.full_name ?? "Student";
            const email = r.lms_profiles?.email ?? "—";
            const date = new Date(r.requested_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            const isApproved = r.status === "approved";
            const isRejected = r.status === "rejected";
            const isPending = r.status === "pending";
            const loadingAction = actionLoading[r.id];
            const hasError = errorMsg[r.id];

            return (
              <div
                key={r.id}
                className="rounded-[2rem] bg-white dark:bg-white/5 shadow-soft overflow-hidden border border-forest/10 dark:border-white/10 flex flex-col justify-between"
              >
                {/* Card header */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <StatusBadge status={r.status} />
                      <h3 className="mt-2 text-lg sm:text-xl font-black text-forest dark:text-cream">{name}</h3>
                      <p className="text-sm font-semibold text-leaf dark:text-emerald-400">{email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl sm:text-3xl font-black text-forest dark:text-cream">{formatINR(r.amount_inr)}</p>
                      <p className="text-[11px] text-ink/45 dark:text-cream/45 mt-0.5">{date}</p>
                    </div>
                  </div>

                  {/* Course Details Box */}
                  {(() => {
                    const courseList = r.course_details.length > 0 ? r.course_details : [{ name: r.course_title, amount_inr: r.amount_inr }];
                    const displayLimit = 2;
                    const visibleCourses = courseList.slice(0, displayLimit);
                    const remainingCount = courseList.length - displayLimit;

                    return (
                      <div className="rounded-2xl bg-linen dark:bg-white/5 p-4 border border-forest/5 dark:border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-ink/50 dark:text-cream/50 uppercase tracking-wider">Requested Courses</p>
                          <span className="rounded-full bg-forest/10 dark:bg-white/10 px-2.5 py-0.5 text-xs font-black text-forest dark:text-cream">
                            {r.course_count} {r.course_count === 1 ? "Course" : "Courses"}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm font-semibold text-forest dark:text-cream divide-y divide-forest/5 dark:divide-white/5">
                          {visibleCourses.map((course, idx) => (
                            <div key={`${course.name}-${idx}`} className="flex justify-between gap-3 pt-1.5 first:pt-0">
                              <span className="truncate">🌿 {course.name}</span>
                              <span className="font-black text-leaf shrink-0">{formatINR(course.amount_inr)}</span>
                            </div>
                          ))}
                        </div>
                        {remainingCount > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setCoursesModal({
                                courses: courseList,
                                studentName: name,
                                totalAmount: r.amount_inr,
                              })
                            }
                            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-forest/10 hover:bg-forest/15 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-black text-forest dark:text-cream transition border border-forest/15 dark:border-white/15"
                          >
                            <span>+{remainingCount} more {remainingCount === 1 ? "course" : "courses"}</span>
                            <span className="text-[11px] font-bold text-leaf dark:text-emerald-400 underline underline-offset-2">(Click to View All)</span>
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* UTR + UPI */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-linen dark:bg-white/5 p-3.5 border border-forest/5 dark:border-white/5">
                      <p className="text-[11px] font-bold text-ink/50 dark:text-cream/50 uppercase mb-0.5">UTR / Txn ID</p>
                      <p className="text-sm font-black text-forest dark:text-cream font-mono break-all">
                        {r.utr_number ?? <span className="font-normal text-ink/40 dark:text-cream/40">—</span>}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-linen dark:bg-white/5 p-3.5 border border-forest/5 dark:border-white/5">
                      <p className="text-[11px] font-bold text-ink/50 dark:text-cream/50 uppercase mb-0.5">UPI ID</p>
                      <p className="text-sm font-semibold text-forest dark:text-cream truncate">
                        {r.upi_id ?? "8985482084@hdfc"}
                      </p>
                    </div>
                  </div>

                  {/* Payment Proof Screenshot */}
                  <div className="rounded-2xl border border-forest/10 dark:border-white/10 overflow-hidden bg-linen/50 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-forest/10 dark:border-white/10">
                      <p className="text-xs font-black text-forest dark:text-cream flex items-center gap-1.5">
                        <span>🧾</span> Payment Screenshot
                      </p>
                      {r.payment_proof_url && (
                        <button
                          onClick={() => setProofModal({ url: r.payment_proof_url!, name })}
                          className="flex items-center gap-1 text-xs font-bold text-leaf hover:underline"
                        >
                          <ExternalLink size={12} /> View Full Screen
                        </button>
                      )}
                    </div>

                    {r.payment_proof_url ? (
                      <button
                        onClick={() => setProofModal({ url: r.payment_proof_url!, name })}
                        className="block w-full text-center p-2 hover:opacity-95 transition"
                        title="Click to zoom in"
                      >
                        <img
                          src={r.payment_proof_url}
                          alt="Payment screenshot"
                          className="w-full max-h-48 object-contain rounded-xl mx-auto"
                        />
                      </button>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 py-6">
                        <ImageOff size={24} className="text-ink/30 dark:text-cream/30" />
                        <p className="text-xs text-ink/40 dark:text-cream/40">No screenshot uploaded</p>
                      </div>
                    )}
                  </div>

                  {r.admin_note && (
                    <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-xl px-3.5 py-2.5 border border-amber-500/20">
                      ⚠️ Note: {r.admin_note}
                    </p>
                  )}

                  {hasError && (
                    <p className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/30 rounded-xl px-3.5 py-2 border border-red-500/20">
                      Error: {hasError}
                    </p>
                  )}
                </div>

                {/* ── CARD ACTION FOOTER ── */}
                <div className="p-4 sm:p-5 bg-linen/70 dark:bg-white/[0.03] border-t border-forest/10 dark:border-white/10 space-y-3">
                  {rejectingId === r.id ? (
                    <div className="space-y-2">
                      <input
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="Reason for rejection (e.g. invalid UTR, payment not received)..."
                        className="w-full rounded-xl border border-forest/20 bg-white px-3.5 py-2 text-xs text-forest font-medium outline-none focus:ring-2 focus:ring-red-500 dark:bg-[#1a1a1a] dark:text-cream"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(r.id)}
                          disabled={loadingAction === "reject"}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
                        >
                          {loadingAction === "reject" ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <XCircle size={14} />
                          )}
                          Confirm Rejection {isApproved ? "& Revoke Access" : ""}
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectNote("");
                          }}
                          className="rounded-full px-4 py-2 text-xs font-bold border border-forest/20 dark:border-white/20 text-ink dark:text-cream hover:bg-forest/5"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Approve button (available if pending or rejected) */}
                      {!isApproved && (
                        <button
                          onClick={() => handleApprove(r.id)}
                          disabled={loadingAction !== null && loadingAction !== undefined}
                          className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-black shadow-sm transition disabled:opacity-50"
                        >
                          {loadingAction === "approve" ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={15} />
                          )}
                          Approve & Unlock Access (Email Notification)
                        </button>
                      )}

                      {/* Reject button (available if pending) */}
                      {isPending && (
                        <button
                          onClick={() => setRejectingId(r.id)}
                          disabled={loadingAction !== null && loadingAction !== undefined}
                          className="flex items-center justify-center gap-1.5 rounded-full border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 py-2.5 px-4 text-xs font-bold hover:bg-red-100 transition disabled:opacity-50"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      )}

                      {/* Reject / Revoke Later option (even after accepted/approved) */}
                      {isApproved && (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <ShieldCheck size={14} /> Student has active course access
                          </span>
                          <button
                            onClick={() => setRejectingId(r.id)}
                            disabled={loadingAction !== null && loadingAction !== undefined}
                            className="flex items-center gap-1 rounded-full border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 py-1.5 px-3 text-xs font-bold hover:bg-red-100 transition"
                            title="Revoke and cancel enrollment access for this student"
                          >
                            <ShieldAlert size={13} /> Revoke / Reject Access
                          </button>
                        </div>
                      )}

                      {/* Re-approve option if rejected */}
                      {isRejected && (
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                          Access currently revoked. Click Approve above to reinstate.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox screenshot modal */}
      {proofModal && (
        <ProofModal
          url={proofModal.url}
          name={proofModal.name}
          onClose={() => setProofModal(null)}
        />
      )}

      {/* Selected courses breakdown modal */}
      {coursesModal && (
        <CoursesModal
          courses={coursesModal.courses}
          studentName={coursesModal.studentName}
          totalAmount={coursesModal.totalAmount}
          onClose={() => setCoursesModal(null)}
        />
      )}
    </div>
  );
}
