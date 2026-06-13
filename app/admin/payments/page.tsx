import { createClient } from "@/lib/supabase/server";
import { PaymentsClient } from "@/components/admin/payments-client";

export const dynamic = "force-dynamic";

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

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lms_enrollment_requests")
    .select("id,status,course_title,amount_inr,upi_id,utr_number,payment_proof_url,selected_all,requested_at,admin_note,lms_profiles(full_name,email)")
    .order("requested_at", { ascending: false });

  const rawRequests = (error ? [] : data ?? []) as unknown as PaymentRecord[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-forest dark:text-cream">Payment Records</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
          Track all student payments, view transaction proofs, and verify bank reference numbers.
        </p>
      </div>
      <PaymentsClient initialRequests={rawRequests} />
    </div>
  );
}
