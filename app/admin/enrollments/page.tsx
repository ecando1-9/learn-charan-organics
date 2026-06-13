import { CheckCircle2, Clock, Eye, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { AdminEnrollmentActions } from "@/components/admin/enrollment-actions";

export const dynamic = "force-dynamic";

type EnrollmentRequest = {
  id: string;
  status: string;
  course_title: string;
  amount_inr: number;
  upi_id: string;
  utr_number: string | null;
  payment_proof_url: string | null;
  selected_all: boolean;
  requested_at: string;
  admin_note: string | null;
  lms_profiles: { full_name: string | null; email: string } | null;
};

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient();

  // Try full query first (with new columns)
  let { data, error } = await supabase
    .from("lms_enrollment_requests")
    .select("id,status,course_title,amount_inr,upi_id,utr_number,payment_proof_url,selected_all,requested_at,admin_note,lms_profiles(full_name,email)")
    .order("requested_at", { ascending: false });

  // If new columns missing, fall back to base columns
  if (error && (error.message.includes("utr_number") || error.message.includes("payment_proof_url") || error.message.includes("selected_all"))) {
    const fallback = await supabase
      .from("lms_enrollment_requests")
      .select("id,status,course_title,amount_inr,upi_id,requested_at,admin_note,lms_profiles(full_name,email)")
      .order("requested_at", { ascending: false });
    data = fallback.data as unknown as typeof data;
    error = fallback.error;
  }

  const requests = (error ? [] : data ?? []) as unknown as EnrollmentRequest[];
  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");

  function StatusBadge({ status }: { status: string }) {
    if (status === "approved") return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/10 px-3 py-1 text-xs font-black text-leaf">
        <CheckCircle2 size={13} /> Approved
      </span>
    );
    if (status === "rejected") return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600 dark:bg-red-950/30 dark:text-red-400">
        <XCircle size={13} /> Rejected
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-clay/10 px-3 py-1 text-xs font-black text-clay">
        <Clock size={13} /> Pending
      </span>
    );
  }

  function RequestCard({ req }: { req: EnrollmentRequest }) {
    const name = req.lms_profiles?.full_name ?? "Unknown";
    const email = req.lms_profiles?.email ?? "—";
    const date = new Date(req.requested_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    return (
      <div className="rounded-[2rem] bg-white shadow-soft dark:bg-white/5 overflow-hidden">
        <div className="p-5">
          <div className="flex flex-wrap items-start gap-3 justify-between">
            <div>
              <StatusBadge status={req.status} />
              <h2 className="mt-3 text-xl font-black text-forest dark:text-cream">{name}</h2>
              <p className="text-sm text-ink/60 dark:text-cream/60">{email}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-forest dark:text-cream">{formatCurrency(req.amount_inr)}</p>
              <p className="text-xs text-ink/50 dark:text-cream/50">{date}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-linen p-3 dark:bg-white/5">
            <p className="text-xs font-bold text-ink/50 dark:text-cream/50 mb-1">Courses requested</p>
            <p className="text-sm font-semibold text-forest dark:text-cream">{req.course_title}</p>
          </div>

          {/* Payment proof / UTR */}
          {(req.utr_number || req.payment_proof_url) && (
            <div className="mt-3 rounded-2xl border border-forest/10 p-3 dark:border-white/10">
              <p className="text-xs font-bold text-ink/50 dark:text-cream/50 mb-2 flex items-center gap-1">
                <Eye size={12} /> Payment Proof
              </p>
              {req.utr_number && (
                <p className="text-sm font-semibold text-forest dark:text-cream">
                  UTR: <span className="font-black">{req.utr_number}</span>
                </p>
              )}
              {req.payment_proof_url && (
                <a href={req.payment_proof_url} target="_blank" rel="noreferrer" className="mt-2 block">
                  <img
                    src={req.payment_proof_url}
                    alt="Payment screenshot"
                    className="w-full max-h-52 rounded-xl object-contain border border-forest/10 dark:border-white/10"
                  />
                  <span className="mt-1 text-xs text-leaf underline">View full image ↗</span>
                </a>
              )}
            </div>
          )}

          {req.admin_note && (
            <p className="mt-3 text-xs text-ink/55 dark:text-cream/55 italic">Admin note: {req.admin_note}</p>
          )}
        </div>

        {req.status === "pending" && (
          <div className="border-t border-forest/10 px-5 py-4 dark:border-white/10">
            <AdminEnrollmentActions requestId={req.id} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-forest dark:text-cream">Enrollment Requests</h1>
        <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">
          Students pay by UPI and submit proof. Approve to unlock their course access.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-5">
          <p className="font-black text-red-700 dark:text-red-400 text-sm">⚠️ Database error — copy this and run the SQL fix in Supabase:</p>
          <pre className="mt-2 text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap break-all bg-red-100 dark:bg-red-950 rounded-xl p-3">{error.message}</pre>
          <p className="mt-3 text-xs text-red-600 dark:text-red-400">Go to Supabase → SQL Editor and run the file: <code>supabase/fix_missing_columns.sql</code></p>
        </div>
      )}

      {!error && requests.length === 0 && (
        <div className="rounded-[2rem] bg-white p-10 text-center shadow-soft dark:bg-white/5">
          <Clock size={40} className="mx-auto text-ink/20 dark:text-cream/20" />
          <p className="mt-4 font-black text-forest dark:text-cream">No enrollment requests yet</p>
          <p className="mt-2 text-sm text-ink/55 dark:text-cream/55">Requests will appear here when students submit enrollment.</p>
        </div>
      )}

      {!error && requests.length > 0 && (
        <p className="text-sm text-leaf font-bold">✓ {requests.length} request(s) loaded from database</p>
      )}

      {pending.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-black text-clay">⏳ Pending ({pending.length})</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {pending.map((req) => <RequestCard key={req.id} req={req} />)}
          </div>
        </section>
      )}

      {reviewed.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-black text-ink/60 dark:text-cream/60">Reviewed ({reviewed.length})</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {reviewed.map((req) => <RequestCard key={req.id} req={req} />)}
          </div>
        </section>
      )}
    </div>
  );
}
