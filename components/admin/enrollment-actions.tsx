"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, ShieldX, XCircle } from "lucide-react";
import { approveEnrollment, rejectEnrollment } from "@/app/actions/enrollment";

type VerifyState = "unreviewed" | "verified" | "not_verified";

export function AdminEnrollmentActions({ requestId }: { requestId: string }) {
  const [verifyState, setVerifyState] = useState<VerifyState>("unreviewed");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [error, setError] = useState("");

  async function handleApprove() {
    setLoading("approve");
    setError("");
    const result = await approveEnrollment(requestId);
    setLoading(null);
    if (result.error) { setError(result.error); return; }
    setDone("approved");
  }

  async function handleReject() {
    setLoading("reject");
    setError("");
    const result = await rejectEnrollment(requestId, rejectNote || undefined);
    setLoading(null);
    if (result.error) { setError(result.error); return; }
    setDone("rejected");
  }

  if (done === "approved") return (
    <div className="flex items-center gap-2 text-sm font-bold text-leaf">
      <CheckCircle2 size={16} /> Enrollment approved — student can now access courses.
    </div>
  );
  if (done === "rejected") return (
    <div className="flex items-center gap-2 text-sm font-bold text-red-500">
      <XCircle size={16} /> Request rejected.
    </div>
  );

  return (
    <div className="space-y-4">

      {/* ── Payment Verification Toggle ── */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/50 dark:text-cream/50">
          Payment Verification
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setVerifyState("verified")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-2.5 text-sm font-bold transition ${
              verifyState === "verified"
                ? "border-leaf bg-leaf text-white"
                : "border-leaf/30 bg-leaf/5 text-leaf hover:bg-leaf/10"
            }`}
          >
            <ShieldCheck size={16} />
            {verifyState === "verified" ? "✓ Verified" : "Mark Verified"}
          </button>
          <button
            onClick={() => setVerifyState("not_verified")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-2.5 text-sm font-bold transition ${
              verifyState === "not_verified"
                ? "border-red-500 bg-red-500 text-white"
                : "border-red-300 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400"
            }`}
          >
            <ShieldX size={16} />
            {verifyState === "not_verified" ? "✗ Not Verified" : "Not Verified"}
          </button>
        </div>

        {/* Verify status hint */}
        {verifyState === "verified" && (
          <p className="mt-2 rounded-xl bg-leaf/10 px-3 py-2 text-xs font-semibold text-leaf">
            Payment verified ✓ — you can now approve to unlock course access.
          </p>
        )}
        {verifyState === "not_verified" && (
          <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-950/20 dark:text-red-400">
            Payment not verified — reject the request and ask student to resubmit.
          </p>
        )}
      </div>

      {/* ── Approve / Reject buttons (only shown after verification choice) ── */}
      {verifyState !== "unreviewed" && (
        <div className="space-y-2">
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          {!showRejectInput ? (
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={loading !== null || verifyState !== "verified"}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-forest py-2.5 text-sm font-bold text-white hover:bg-leaf transition disabled:opacity-50 disabled:cursor-not-allowed"
                title={verifyState !== "verified" ? "Mark payment as verified first" : ""}
              >
                {loading === "approve"
                  ? <Loader2 size={14} className="animate-spin" />
                  : <CheckCircle2 size={14} />}
                {loading === "approve" ? "Approving…" : "Approve & Unlock"}
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={loading !== null}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition disabled:opacity-50 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400"
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Reason for rejection (optional)"
                className="w-full rounded-xl border border-forest/15 bg-linen px-3 py-2 text-sm outline-none focus:border-red-400 dark:bg-white/5 dark:border-white/15 dark:text-cream"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={loading === "reject"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition disabled:opacity-60"
                >
                  {loading === "reject"
                    ? <Loader2 size={14} className="animate-spin" />
                    : <XCircle size={14} />}
                  {loading === "reject" ? "Rejecting…" : "Confirm Reject"}
                </button>
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="rounded-full border border-forest/15 px-4 py-2 text-sm font-bold text-forest hover:bg-forest/5 dark:text-cream dark:border-white/15"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {verifyState === "unreviewed" && (
        <p className="text-xs text-ink/45 italic dark:text-cream/45">
          Check the payment proof above, then mark as Verified or Not Verified to proceed.
        </p>
      )}
    </div>
  );
}
