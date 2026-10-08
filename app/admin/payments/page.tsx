import { AdminConfigNotice } from "@/components/admin/admin-config-notice";
import { createAdminClient, getAdminClientConfigError } from "@/lib/supabase/admin";
import { PaymentsClient } from "@/components/admin/payments-client";
import { allocateCourseAmounts } from "@/lib/enrollment-amounts";

export const dynamic = "force-dynamic";

export type PaymentRecord = {
  id: string;
  user_id?: string;
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

export default async function AdminPaymentsPage() {
  const adminConfigError = getAdminClientConfigError();
  if (adminConfigError) {
    return <AdminConfigNotice message={adminConfigError} />;
  }

  const admin = createAdminClient();

  // 1. Fetch all payment/enrollment requests directly from DB
  const { data: rawRequests, error: reqError } = await admin
    .from("lms_enrollment_requests")
    .select("*")
    .order("requested_at", { ascending: false });

  if (reqError) {
    console.error("Error fetching lms_enrollment_requests:", reqError);
  }

  const items = rawRequests ?? [];

  const courseIds = Array.from(
    new Set(items.flatMap((r: any) => r.course_ids ?? []).filter(Boolean))
  );
  const courseMap = new Map<string, { title: string; price_inr: number }>();
  if (courseIds.length > 0) {
    const { data: courses } = await admin
      .from("lms_courses")
      .select("id, title, price_inr")
      .in("id", courseIds);

    (courses ?? []).forEach((course: any) => {
      courseMap.set(course.id, { title: course.title, price_inr: Number(course.price_inr) || 0 });
    });
  }

  const coursePriceMap = new Map(
    Array.from(courseMap.entries()).map(([id, course]) => [id, course.price_inr])
  );

  // 2. Fetch profiles for user_ids to avoid PostgREST relationship join issues
  const userIds = Array.from(new Set(items.map((r: any) => r.user_id).filter(Boolean)));
  
  const profileMap = new Map<string, { full_name: string | null; email: string }>();
  if (userIds.length > 0) {
    const { data: profiles, error: profError } = await admin
      .from("lms_profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    if (!profError && profiles) {
      profiles.forEach((p: any) => {
        profileMap.set(p.id, { full_name: p.full_name, email: p.email });
      });
    }
  }

  // 3. Assemble full real-time payment records
  const paymentRecords: PaymentRecord[] = items.map((r: any) => {
    const requestCourseIds = (r.course_ids ?? []) as string[];
    const amountMap = allocateCourseAmounts({
      courseIds: requestCourseIds,
      totalAmount: Number(r.amount_inr) || 0,
      coursePrices: coursePriceMap,
      selectedAll: Boolean(r.selected_all),
    });

    return {
      id: r.id,
      user_id: r.user_id,
      status: r.status ?? "pending",
      course_title: r.course_title ?? "Course Enrollment",
      course_details: requestCourseIds.map((id) => ({
        name: courseMap.get(id)?.title ?? "Selected Course",
        amount_inr: amountMap.get(id) ?? 0,
      })),
      course_count: requestCourseIds.length || (r.selected_all ? courseMap.size : 1),
      amount_inr: Number(r.amount_inr) || 0,
      upi_id: r.upi_id ?? null,
      utr_number: r.utr_number ?? null,
      payment_proof_url: r.payment_proof_url ?? null,
      selected_all: Boolean(r.selected_all),
      requested_at: r.requested_at || new Date().toISOString(),
      admin_note: r.admin_note ?? null,
      lms_profiles: r.user_id ? profileMap.get(r.user_id) ?? null : null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-forest dark:text-cream">Payment Records</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
          Track all student payments, view transaction proofs, and verify bank reference numbers in real time.
        </p>
      </div>
      <PaymentsClient initialRequests={paymentRecords} />
    </div>
  );
}
