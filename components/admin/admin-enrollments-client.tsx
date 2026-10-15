"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Users,
  BookOpen,
  Eye,
  ExternalLink,
  ShieldCheck,
  ShieldX,
  X,
  Copy,
  Check,
  Loader2,
  Calendar,
  Layers,
  ArrowUpDown,
  FileCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { approveEnrollment, rejectEnrollment } from "@/app/actions/enrollment";

export type CourseDetail = {
  name: string;
  amount_inr: number;
};

export type EnrollmentRequestItem = {
  id: string;
  user_id: string | null;
  status: string;
  course_title: string;
  course_details: CourseDetail[];
  course_count: number;
  amount_inr: number;
  upi_id: string;
  utr_number: string | null;
  payment_proof_url: string | null;
  selected_all: boolean;
  requested_at: string;
  admin_note: string | null;
  student_name: string;
  student_email: string;
};

export type ActiveStudentEnrollment = {
  user_id: string;
  student_name: string;
  student_email: string;
  course_count: number;
  course_details: CourseDetail[];
  total_paid_inr: number;
  last_enrolled_at: string;
};

export function AdminEnrollmentsClient({
  initialRequests,
  initialActiveStudents,
}: {
  initialRequests: EnrollmentRequestItem[];
  initialActiveStudents: ActiveStudentEnrollment[];
}) {
  const [requests, setRequests] = useState<EnrollmentRequestItem[]>(initialRequests);
  const [activeStudents, setActiveStudents] = useState<ActiveStudentEnrollment[]>(initialActiveStudents);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "rejected" | "all">("pending");
  const [search, setSearch] = useState("");
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // Modals
  const [coursesModal, setCoursesModal] = useState<{
    courses: CourseDetail[];
    studentName: string;
    totalAmount: number;
  } | null>(null);
  const [modalSearch, setModalSearch] = useState("");

  const [proofModal, setProofModal] = useState<{
    url: string;
    studentName: string;
    utr: string | null;
  } | null>(null);

  // Pending verification action states
  const [verifyStatusMap, setVerifyStatusMap] = useState<Record<string, "verified" | "not_verified">>({});
  const [actionLoading, setActionLoading] = useState<Record<string, "approve" | "reject" | null>>({});
  const [rejectNoteMap, setRejectNoteMap] = useState<Record<string, string>>({});
  const [actionErrorMap, setActionErrorMap] = useState<Record<string, string>>({});

  // Stats
  const pendingRequests = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);
  const approvedRequests = useMemo(() => requests.filter((r) => r.status === "approved" || r.status === "active"), [requests]);
  const rejectedRequests = useMemo(() => requests.filter((r) => r.status === "rejected"), [requests]);

  const totalRevenue = useMemo(() => {
    return activeStudents.reduce((sum, s) => sum + s.total_paid_inr, 0);
  }, [activeStudents]);

  const totalCourseSeats = useMemo(() => {
    return activeStudents.reduce((sum, s) => sum + s.course_count, 0);
  }, [activeStudents]);

  // Copy UTR helper
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedUtr(text);
    setTimeout(() => setCopiedUtr(null), 2000);
  }

  // Handle Approve
  async function handleApprove(requestId: string) {
    setActionLoading((prev) => ({ ...prev, [requestId]: "approve" }));
    setActionErrorMap((prev) => ({ ...prev, [requestId]: "" }));

    const res = await approveEnrollment(requestId);
    setActionLoading((prev) => ({ ...prev, [requestId]: null }));

    if (res.error) {
      setActionErrorMap((prev) => ({ ...prev, [requestId]: res.error || "Approval failed" }));
      return;
    }

    // Update locally
    const approvedItem = requests.find((r) => r.id === requestId);
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "approved" } : r))
    );

    if (approvedItem && approvedItem.user_id) {
      setActiveStudents((prev) => {
        const existingIndex = prev.findIndex((s) => s.user_id === approvedItem.user_id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          const cur = updated[existingIndex];
          const newDetails = [...cur.course_details, ...approvedItem.course_details];
          updated[existingIndex] = {
            ...cur,
            course_count: newDetails.length,
            course_details: newDetails,
            total_paid_inr: cur.total_paid_inr + approvedItem.amount_inr,
            last_enrolled_at: new Date().toISOString(),
          };
          return updated;
        } else {
          return [
            {
              user_id: approvedItem.user_id!,
              student_name: approvedItem.student_name,
              student_email: approvedItem.student_email,
              course_count: approvedItem.course_count,
              course_details: approvedItem.course_details,
              total_paid_inr: approvedItem.amount_inr,
              last_enrolled_at: new Date().toISOString(),
            },
            ...prev,
          ];
        }
      });
    }
  }

  // Handle Reject
  async function handleReject(requestId: string) {
    setActionLoading((prev) => ({ ...prev, [requestId]: "reject" }));
    setActionErrorMap((prev) => ({ ...prev, [requestId]: "" }));

    const note = rejectNoteMap[requestId] || undefined;
    const res = await rejectEnrollment(requestId, note);
    setActionLoading((prev) => ({ ...prev, [requestId]: null }));

    if (res.error) {
      setActionErrorMap((prev) => ({ ...prev, [requestId]: res.error || "Rejection failed" }));
      return;
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "rejected", admin_note: note || null } : r))
    );
  }

  // Filtered Pending
  const filteredPending = useMemo(() => {
    const q = search.toLowerCase().trim();
    return pendingRequests.filter((r) => {
      if (!q) return true;
      return (
        r.student_name.toLowerCase().includes(q) ||
        r.student_email.toLowerCase().includes(q) ||
        r.course_title.toLowerCase().includes(q) ||
        (r.utr_number && r.utr_number.toLowerCase().includes(q)) ||
        r.upi_id.toLowerCase().includes(q)
      );
    });
  }, [pendingRequests, search]);

  // Filtered Active Students
  const filteredActiveStudents = useMemo(() => {
    const q = search.toLowerCase().trim();
    return activeStudents.filter((s) => {
      if (!q) return true;
      return (
        s.student_name.toLowerCase().includes(q) ||
        s.student_email.toLowerCase().includes(q) ||
        s.course_details.some((c) => c.name.toLowerCase().includes(q))
      );
    });
  }, [activeStudents, search]);

  // Filtered Rejected
  const filteredRejected = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rejectedRequests.filter((r) => {
      if (!q) return true;
      return (
        r.student_name.toLowerCase().includes(q) ||
        r.student_email.toLowerCase().includes(q) ||
        r.course_title.toLowerCase().includes(q) ||
        (r.utr_number && r.utr_number.toLowerCase().includes(q))
      );
    });
  }, [rejectedRequests, search]);

  // Modal filtered courses
  const modalFilteredCourses = useMemo(() => {
    if (!coursesModal) return [];
    const q = modalSearch.toLowerCase().trim();
    return coursesModal.courses.filter((c) => !q || c.name.toLowerCase().includes(q));
  }, [coursesModal, modalSearch]);

  return (
    <div className="space-y-6">
      {/* ── Executive Metrics Row ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center justify-between text-amber-500">
            <Clock size={20} />
            <span className="text-[11px] font-black bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              Action Required
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-ink/50 dark:text-cream/50">
            Pending Verifications
          </p>
          <p className="text-3xl font-black text-forest dark:text-cream">
            {pendingRequests.length}
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center justify-between text-leaf">
            <Users size={20} />
            <span className="text-[11px] font-black bg-leaf/10 px-2.5 py-0.5 rounded-full">
              Active Roster
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-ink/50 dark:text-cream/50">
            Active Students
          </p>
          <p className="text-3xl font-black text-forest dark:text-cream">
            {activeStudents.length}
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center justify-between text-blue-500">
            <Layers size={20} />
            <span className="text-[11px] font-black bg-blue-500/10 px-2.5 py-0.5 rounded-full">
              Seats Granted
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-ink/50 dark:text-cream/50">
            Course Enrollments
          </p>
          <p className="text-3xl font-black text-forest dark:text-cream">
            {totalCourseSeats}
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <FileCheck size={20} />
            <span className="text-[11px] font-black bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              Collected
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-ink/50 dark:text-cream/50">
            Enrollment Revenue
          </p>
          <p className="text-2xl font-black text-forest dark:text-cream">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      {/* ── Search Bar & Navigation Tabs ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <label className="flex flex-1 max-w-md items-center gap-3 rounded-full bg-white px-4 py-3 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <Search size={18} className="text-ink/40 dark:text-cream/40 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40 dark:text-cream dark:placeholder:text-cream/40"
            placeholder="Search by student, course, UTR, or UPI..."
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs font-bold text-ink/40 hover:text-ink dark:text-cream/40 dark:hover:text-cream"
            >
              Clear
            </button>
          )}
        </label>

        {/* View Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-full bg-white p-1 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <button
            onClick={() => setActiveTab("pending")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === "pending"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-ink/70 hover:text-forest dark:text-cream/70 dark:hover:text-cream"
            }`}
          >
            Pending Verification ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === "active"
                ? "bg-forest text-white shadow-xs"
                : "text-ink/70 hover:text-forest dark:text-cream/70 dark:hover:text-cream"
            }`}
          >
            Active Students ({activeStudents.length})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === "rejected"
                ? "bg-red-500 text-white shadow-xs"
                : "text-ink/70 hover:text-forest dark:text-cream/70 dark:hover:text-cream"
            }`}
          >
            Rejected ({rejectedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === "all"
                ? "bg-forest text-white shadow-xs"
                : "text-ink/70 hover:text-forest dark:text-cream/70 dark:hover:text-cream"
            }`}
          >
            All Activity ({requests.length})
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: PENDING VERIFICATION REQUESTS
      ══════════════════════════════════════════════════════════════════════ */}
      {(activeTab === "pending" || activeTab === "all") && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
              <Clock className="text-amber-500" size={20} /> Pending Verification Requests ({filteredPending.length})
            </h2>
            {activeTab === "all" && (
              <span className="text-xs text-ink/50 dark:text-cream/50 font-bold">Pending Only</span>
            )}
          </div>

          {filteredPending.length === 0 ? (
            <div className="rounded-[2rem] border border-forest/10 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-white/5 space-y-2">
              <CheckCircle2 className="mx-auto text-leaf" size={32} />
              <p className="text-base font-bold text-forest dark:text-cream">All Caught Up!</p>
              <p className="text-xs text-ink/50 dark:text-cream/50 max-w-sm mx-auto">
                No pending enrollment verification requests found. When a student submits payment details, it will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPending.map((req) => {
                const verifyState = verifyStatusMap[req.id] || "unreviewed";
                const isActionLoading = actionLoading[req.id];
                const errorMsg = actionErrorMap[req.id];

                return (
                  <div
                    key={req.id}
                    className="flex flex-col justify-between rounded-[2rem] border border-forest/10 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5 space-y-4 hover:border-amber-500/30 transition"
                  >
                    <div className="space-y-3.5">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="rounded-full bg-amber-500/15 px-3 py-0.5 text-[10px] font-black uppercase text-amber-700 dark:bg-amber-400/20 dark:text-amber-300">
                            Pending Verification
                          </span>
                          <h3 className="text-base font-black text-forest dark:text-cream leading-snug">
                            {req.student_name}
                          </h3>
                          <p className="text-xs text-ink/60 dark:text-cream/60 font-mono">
                            {req.student_email}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xl font-black text-leaf">
                            {formatCurrency(req.amount_inr)}
                          </span>
                          <p className="text-[10px] text-ink/40 dark:text-cream/40">
                            {req.course_count} course{req.course_count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {/* Course Selection Preview (Smart 2-3 Rule) */}
                      <div className="rounded-2xl bg-linen/60 dark:bg-white/5 p-3.5 border border-forest/5 dark:border-white/5 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink/50 dark:text-cream/50">
                          Selected Courses ({req.course_details.length || req.course_count}):
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {(req.course_details.length > 0
                            ? req.course_details.slice(0, 2)
                            : [{ name: req.course_title, amount_inr: req.amount_inr }]
                          ).map((c, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-white/10 px-3 py-1 text-xs font-bold text-forest dark:text-cream border border-forest/10 dark:border-white/10"
                            >
                              <span>🌿 {c.name}</span>
                              <span className="font-mono text-leaf">({formatCurrency(c.amount_inr)})</span>
                            </span>
                          ))}

                          {req.course_details.length > 2 && (
                            <button
                              onClick={() =>
                                setCoursesModal({
                                  courses: req.course_details,
                                  studentName: req.student_name,
                                  totalAmount: req.amount_inr,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-full bg-forest text-white hover:bg-leaf px-3 py-1 text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                              +{req.course_details.length - 2} more · View all {req.course_details.length}
                            </button>
                          )}
                        </div>

                        {/* Transaction Details */}
                        <div className="pt-2 border-t border-forest/10 dark:border-white/10 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-ink/50 dark:text-cream/50 block">UPI ID</span>
                            <span className="font-mono font-bold text-forest dark:text-cream truncate block">
                              {req.upi_id}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-ink/50 dark:text-cream/50 block">UTR Number</span>
                            {req.utr_number ? (
                              <button
                                onClick={() => copyToClipboard(req.utr_number!)}
                                className="inline-flex items-center gap-1 font-mono font-bold text-leaf hover:underline text-xs"
                                title="Click to copy UTR"
                              >
                                <span>{req.utr_number}</span>
                                {copiedUtr === req.utr_number ? (
                                  <Check size={12} className="text-emerald-500" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            ) : (
                              <span className="text-ink/40 font-mono">—</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-ink/50 dark:text-cream/50">
                          <span>Submitted: {new Date(req.requested_at).toLocaleString("en-IN")}</span>
                          {req.payment_proof_url && (
                            <button
                              onClick={() =>
                                setProofModal({
                                  url: req.payment_proof_url!,
                                  studentName: req.student_name,
                                  utr: req.utr_number,
                                })
                              }
                              className="inline-flex items-center gap-1 font-bold text-leaf hover:underline cursor-pointer"
                            >
                              <Eye size={12} /> View Screenshot
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Error Banner */}
                      {errorMsg && (
                        <div className="rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600 dark:bg-red-950/30 dark:text-red-400">
                          {errorMsg}
                        </div>
                      )}
                    </div>

                    {/* ── Verification & Approval Controls ── */}
                    <div className="pt-3 border-t border-forest/10 dark:border-white/10 space-y-3">
                      <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ink/50 dark:text-cream/50">
                          Payment Verification Check
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() =>
                              setVerifyStatusMap((prev) => ({ ...prev, [req.id]: "verified" }))
                            }
                            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition border cursor-pointer ${
                              verifyState === "verified"
                                ? "border-leaf bg-leaf text-white shadow-xs"
                                : "border-forest/10 bg-forest/5 text-forest hover:bg-forest/10 dark:border-white/10 dark:bg-white/5 dark:text-cream"
                            }`}
                          >
                            <ShieldCheck size={14} />
                            {verifyState === "verified" ? "✓ Verified" : "Mark Verified"}
                          </button>
                          <button
                            onClick={() =>
                              setVerifyStatusMap((prev) => ({ ...prev, [req.id]: "not_verified" }))
                            }
                            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition border cursor-pointer ${
                              verifyState === "not_verified"
                                ? "border-red-500 bg-red-500 text-white shadow-xs"
                                : "border-red-200 bg-red-50/50 text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
                            }`}
                          >
                            <ShieldX size={14} />
                            {verifyState === "not_verified" ? "✗ Not Verified" : "Not Verified"}
                          </button>
                        </div>
                      </div>

                      {/* Final Action Buttons based on verification state */}
                      {verifyState !== "not_verified" && (
                        <button
                          onClick={() => {
                            setVerifyStatusMap((prev) => ({ ...prev, [req.id]: "verified" }));
                            handleApprove(req.id);
                          }}
                          disabled={isActionLoading === "approve"}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest py-2.5 text-xs font-bold text-white hover:bg-leaf transition shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer"
                        >
                          {isActionLoading === "approve" ? (
                            <>
                              <Loader2 size={14} className="animate-spin" /> Approving & Unlocking...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} /> Approve Enrollment & Grant Access
                            </>
                          )}
                        </button>
                      )}

                      {verifyState === "not_verified" && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Optional reason for rejection..."
                            value={rejectNoteMap[req.id] || ""}
                            onChange={(e) =>
                              setRejectNoteMap((prev) => ({ ...prev, [req.id]: e.target.value }))
                            }
                            className="w-full rounded-xl border border-forest/10 bg-linen/50 px-3 py-1.5 text-xs outline-none dark:border-white/10 dark:bg-white/5 dark:text-cream"
                          />
                          <button
                            onClick={() => handleReject(req.id)}
                            disabled={isActionLoading === "reject"}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer"
                          >
                            {isActionLoading === "reject" ? (
                              <>
                                <Loader2 size={14} className="animate-spin" /> Rejecting...
                              </>
                            ) : (
                              <>
                                <XCircle size={14} /> Reject Request
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: ACTIVE ENROLLED STUDENTS
      ══════════════════════════════════════════════════════════════════════ */}
      {(activeTab === "active" || activeTab === "all") && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
              <BookOpen className="text-leaf" size={20} /> Active Student Enrollments ({filteredActiveStudents.length})
            </h2>
            <span className="text-xs font-bold text-ink/50 dark:text-cream/50">
              {totalCourseSeats} total course seats active
            </span>
          </div>

          {filteredActiveStudents.length === 0 ? (
            <div className="rounded-[2rem] border border-forest/10 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-white/5 space-y-2">
              <Users className="mx-auto text-ink/30 dark:text-cream/30" size={32} />
              <p className="text-base font-bold text-forest dark:text-cream">No Active Enrollments Found</p>
              <p className="text-xs text-ink/50 dark:text-cream/50">
                Approved students will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-forest/10 bg-white shadow-soft dark:border-white/10 dark:bg-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-forest/10 bg-linen/50 dark:border-white/10 dark:bg-white/5 text-[11px] uppercase tracking-wider text-ink/50 dark:text-cream/50 font-black">
                    <tr>
                      <th className="p-4 pl-5">Student</th>
                      <th className="p-4">Active Courses</th>
                      <th className="p-4">Total Paid</th>
                      <th className="p-4">Last Enrolled</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest/5 dark:divide-white/5">
                    {filteredActiveStudents.map((item) => (
                      <tr
                        key={item.user_id}
                        className="hover:bg-linen/30 dark:hover:bg-white/5 transition"
                      >
                        {/* Student Info */}
                        <td className="p-4 pl-5">
                          <div className="flex items-center gap-3">
                            <div className="grid size-10 place-items-center rounded-2xl bg-forest/10 font-black text-forest dark:bg-white/10 dark:text-cream text-xs shrink-0">
                              {item.student_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-forest dark:text-cream text-sm">
                                {item.student_name}
                              </p>
                              <p className="text-xs text-ink/50 dark:text-cream/50 font-mono">
                                {item.student_email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Courses with Smart 2-3 Rule */}
                        <td className="p-4">
                          <div className="space-y-1.5 max-w-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-forest dark:text-cream text-xs">
                                {item.course_count} Course{item.course_count !== 1 ? "s" : ""}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              {item.course_details.slice(0, 2).map((c, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 rounded-full bg-forest/5 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-forest dark:text-cream"
                                >
                                  <span>🌿 {c.name}</span>
                                </span>
                              ))}

                              {item.course_details.length > 2 && (
                                <button
                                  onClick={() =>
                                    setCoursesModal({
                                      courses: item.course_details,
                                      studentName: item.student_name,
                                      totalAmount: item.total_paid_inr,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 rounded-full bg-leaf/15 hover:bg-leaf/25 text-forest dark:text-cream px-2.5 py-0.5 text-[11px] font-bold transition cursor-pointer"
                                >
                                  +{item.course_details.length - 2} more · View all {item.course_details.length}
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Total Paid */}
                        <td className="p-4 whitespace-nowrap font-black text-leaf text-sm">
                          {formatCurrency(item.total_paid_inr)}
                        </td>

                        {/* Last Enrolled Date */}
                        <td className="p-4 whitespace-nowrap text-ink/60 dark:text-cream/60 font-mono text-xs">
                          {new Date(item.last_enrolled_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center whitespace-nowrap">
                          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                            Active
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 pr-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setCoursesModal({
                                  courses: item.course_details,
                                  studentName: item.student_name,
                                  totalAmount: item.total_paid_inr,
                                })
                              }
                              className="rounded-full bg-forest/10 hover:bg-forest/20 px-3 py-1.5 text-xs font-bold text-forest dark:bg-white/10 dark:text-cream transition cursor-pointer"
                            >
                              Courses ({item.course_count})
                            </button>
                            <Link
                              href={`/admin/students/${item.user_id}`}
                              className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-bold text-white hover:bg-leaf transition"
                            >
                              Profile ↗
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: REJECTED REQUESTS
      ══════════════════════════════════════════════════════════════════════ */}
      {(activeTab === "rejected" || activeTab === "all") && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
              <XCircle className="text-red-500" size={20} /> Rejected Enrollment Requests ({filteredRejected.length})
            </h2>
            {activeTab === "all" && (
              <span className="text-xs text-ink/50 dark:text-cream/50 font-bold">Rejected Only</span>
            )}
          </div>

          {filteredRejected.length === 0 ? (
            <div className="rounded-[2rem] border border-forest/10 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-white/5">
              <p className="text-base font-bold text-forest dark:text-cream">No Rejected Requests</p>
              <p className="mt-1 text-xs text-ink/50 dark:text-cream/50">
                Any declined verification submissions will be recorded here.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredRejected.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-red-200 bg-red-50/40 p-4 dark:border-red-950/40 dark:bg-red-950/10 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-red-700 dark:text-red-400">
                        Rejected
                      </span>
                      <h4 className="mt-1 font-bold text-forest dark:text-cream text-sm">
                        {req.student_name}
                      </h4>
                      <p className="text-xs text-ink/60 dark:text-cream/60">{req.student_email}</p>
                    </div>
                    <span className="font-black text-sm text-forest dark:text-cream">
                      {formatCurrency(req.amount_inr)}
                    </span>
                  </div>

                  <p className="text-xs text-ink/70 dark:text-cream/70">
                    Course: <b>{req.course_title}</b> ({req.course_count} selected)
                  </p>

                  {req.admin_note && (
                    <p className="rounded-xl bg-white/70 dark:bg-white/5 p-2 text-xs italic text-red-700 dark:text-red-400">
                      Reason: {req.admin_note}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[10px] text-ink/40 dark:text-cream/40 border-t border-red-200/60 dark:border-red-950/40">
                    <span>Submitted: {new Date(req.requested_at).toLocaleDateString("en-IN")}</span>
                    {req.utr_number && <span>UTR: {req.utr_number}</span>}
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={actionLoading[req.id] === "approve"}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-forest py-2 text-xs font-bold text-white hover:bg-leaf transition shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading[req.id] === "approve" ? (
                        <>
                          <Loader2 size={12} className="animate-spin" /> Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={12} /> Approve & Grant Access
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          COURSES BREAKDOWN MODAL (Responsive for Mobile & Desktop)
      ══════════════════════════════════════════════════════════════════════ */}
      {coursesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => {
            setCoursesModal(null);
            setModalSearch("");
          }}
        >
          <div
            className="relative max-w-lg w-full rounded-[2.5rem] bg-white dark:bg-[#0e1f18] shadow-2xl overflow-hidden border border-forest/10 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-forest/10 dark:border-white/10 bg-linen/40 dark:bg-white/5">
              <div>
                <p className="font-black text-forest dark:text-cream text-lg">
                  Enrolled Courses ({coursesModal.courses.length})
                </p>
                <p className="text-xs text-ink/60 dark:text-cream/60">
                  Student: <b className="text-forest dark:text-cream">{coursesModal.studentName}</b>
                </p>
              </div>
              <button
                onClick={() => {
                  setCoursesModal(null);
                  setModalSearch("");
                }}
                className="grid size-9 place-items-center rounded-full bg-forest/5 hover:bg-forest/10 dark:bg-white/10 text-ink/70 dark:text-cream/70 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* In-Modal Search if > 5 courses */}
            {coursesModal.courses.length > 5 && (
              <div className="p-3 border-b border-forest/10 dark:border-white/10">
                <label className="flex items-center gap-2 rounded-xl bg-linen/50 dark:bg-white/5 px-3 py-1.5 text-xs">
                  <Search size={14} className="text-ink/40" />
                  <input
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full bg-transparent outline-none placeholder:text-ink/40 dark:text-cream"
                  />
                  {modalSearch && (
                    <button
                      onClick={() => setModalSearch("")}
                      className="text-[10px] font-bold text-ink/40"
                    >
                      Clear
                    </button>
                  )}
                </label>
              </div>
            )}

            {/* Courses List */}
            <div className="p-5 max-h-[55vh] overflow-y-auto space-y-2">
              {modalFilteredCourses.length === 0 ? (
                <div className="py-8 text-center text-xs text-ink/40">No courses match search.</div>
              ) : (
                modalFilteredCourses.map((c, i) => (
                  <div
                    key={`${c.name}-${i}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-linen/40 dark:bg-white/5 border border-forest/5 dark:border-white/5 hover:border-forest/20 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="grid size-6 place-items-center rounded-full bg-forest/10 text-forest dark:bg-white/10 dark:text-cream text-[11px] font-black shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-forest dark:text-cream truncate">
                        🌿 {c.name}
                      </span>
                    </div>
                    <span className="font-black text-xs sm:text-sm text-leaf shrink-0 font-mono">
                      {formatCurrency(c.amount_inr)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer with Total */}
            <div className="p-5 bg-linen/50 dark:bg-white/5 border-t border-forest/10 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-ink/50 dark:text-cream/50 uppercase block">
                  Total Allocated Value
                </span>
                <span className="text-lg font-black text-forest dark:text-cream">
                  {formatCurrency(coursesModal.totalAmount)}
                </span>
              </div>
              <button
                onClick={() => {
                  setCoursesModal(null);
                  setModalSearch("");
                }}
                className="rounded-full bg-forest px-5 py-2 text-xs font-bold text-white hover:bg-leaf transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PAYMENT PROOF MODAL (Full Resolution Lightbox)
      ══════════════════════════════════════════════════════════════════════ */}
      {proofModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setProofModal(null)}
        >
          <div
            className="relative max-w-xl w-full rounded-[2.5rem] bg-white dark:bg-[#0e1f18] shadow-2xl overflow-hidden border border-forest/10 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-forest/10 dark:border-white/10 bg-linen/40 dark:bg-white/5">
              <div>
                <p className="font-black text-forest dark:text-cream text-base">
                  Payment Verification Screenshot
                </p>
                <p className="text-xs text-ink/60 dark:text-cream/60">
                  Student: <b>{proofModal.studentName}</b>
                  {proofModal.utr && <span> · UTR: <code className="font-mono">{proofModal.utr}</code></span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={proofModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-leaf px-3 py-1 text-xs font-bold text-white hover:bg-forest transition"
                >
                  <ExternalLink size={12} /> Open Raw
                </a>
                <button
                  onClick={() => setProofModal(null)}
                  className="grid size-8 place-items-center rounded-full bg-forest/5 hover:bg-forest/10 dark:bg-white/10 text-ink/70 dark:text-cream/70 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto bg-black/5 dark:bg-black/30 flex items-center justify-center">
              <img
                src={proofModal.url}
                alt="Payment proof"
                className="max-w-full max-h-[65vh] object-contain rounded-2xl shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
