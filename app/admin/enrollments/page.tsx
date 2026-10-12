import { AdminConfigNotice } from "@/components/admin/admin-config-notice";
import { createAdminClient, getAdminClientConfigError } from "@/lib/supabase/admin";
import { allocateCourseAmounts } from "@/lib/enrollment-amounts";
import {
  AdminEnrollmentsClient,
  type EnrollmentRequestItem,
  type ActiveStudentEnrollment,
} from "@/components/admin/admin-enrollments-client";

export const dynamic = "force-dynamic";

export default async function AdminEnrollmentsPage() {
  const adminConfigError = getAdminClientConfigError();
  if (adminConfigError) {
    return <AdminConfigNotice message={adminConfigError} />;
  }

  const admin = createAdminClient();

  // 1. Fetch all enrollment requests directly via admin client
  const { data: rawRequests } = await admin
    .from("lms_enrollment_requests")
    .select("*")
    .order("requested_at", { ascending: false });

  const requestItems = rawRequests ?? [];

  // 2. Fetch active enrollments table
  const { data: rawActiveEnrollments } = await admin
    .from("lms_enrollments")
    .select("id, user_id, course_id, enrolled_at, status, amount_paid_inr")
    .order("enrolled_at", { ascending: false });

  const activeItems = rawActiveEnrollments ?? [];

  // 3. Fetch courses map for requests and active enrollments
  const requestCourseIds = requestItems.flatMap((r: any) => r.course_ids ?? []);
  const activeCourseIds = activeItems.map((a: any) => a.course_id);
  const courseIds = Array.from(new Set([...requestCourseIds, ...activeCourseIds].filter(Boolean)));
  const courseMap = new Map<string, { title: string; price_inr: number }>();
  if (courseIds.length > 0) {
    const { data: courses } = await admin
      .from("lms_courses")
      .select("id, title, price_inr")
      .in("id", courseIds);
    (courses ?? []).forEach((c: any) => {
      courseMap.set(c.id, { title: c.title, price_inr: Number(c.price_inr) || 0 });
    });
  }

  const coursePriceMap = new Map(
    Array.from(courseMap.entries()).map(([id, course]) => [id, course.price_inr])
  );

  // 4. Collect all unique user IDs across requests and active enrollments
  const allUserIds = Array.from(
    new Set([
      ...requestItems.map((r: any) => r.user_id),
      ...activeItems.map((a: any) => a.user_id),
    ].filter(Boolean))
  );

  const profileMap = new Map<string, { full_name: string | null; email: string }>();
  if (allUserIds.length > 0) {
    const { data: profiles } = await admin
      .from("lms_profiles")
      .select("id, full_name, email")
      .in("id", allUserIds);

    (profiles ?? []).forEach((p: any) => {
      let name = p.full_name?.trim();
      if (!name || name.toLowerCase() === "student") {
        if (p.email && p.email.includes("@")) {
          const handle = p.email.split("@")[0];
          name = handle.charAt(0).toUpperCase() + handle.slice(1);
        } else {
          name = `Student ${p.id.slice(0, 4)}`;
        }
      }
      profileMap.set(p.id, { full_name: name, email: p.email });
    });
  }

  // 5. Build clean request objects
  const requests: EnrollmentRequestItem[] = requestItems.map((r: any) => {
    const rCourseIds = (r.course_ids ?? []) as string[];
    const amountMap = allocateCourseAmounts({
      courseIds: rCourseIds,
      totalAmount: Number(r.amount_inr) || 0,
      coursePrices: coursePriceMap,
      selectedAll: Boolean(r.selected_all),
    });
    const courseDetails = rCourseIds.map((id) => ({
      name: courseMap.get(id)?.title ?? "Selected Course",
      amount_inr: amountMap.get(id) ?? 0,
    }));

    const prof = r.user_id ? profileMap.get(r.user_id) : null;

    return {
      id: r.id,
      user_id: r.user_id ?? null,
      status: r.status ?? "pending",
      course_title: r.course_title ?? "Course Enrollment",
      course_details: courseDetails,
      course_count: rCourseIds.length || (r.selected_all ? courseMap.size : 1),
      amount_inr: Number(r.amount_inr) || 0,
      upi_id: r.upi_id ?? "—",
      utr_number: r.utr_number ?? null,
      payment_proof_url: r.payment_proof_url ?? null,
      selected_all: Boolean(r.selected_all),
      requested_at: r.requested_at || new Date().toISOString(),
      admin_note: r.admin_note ?? null,
      student_name: prof?.full_name || "Student",
      student_email: prof?.email || "Unknown Email",
    };
  });

  const approvedAmountByUserCourse = new Map<string, Map<string, number>>();
  requestItems
    .filter((r: any) => ["approved", "active"].includes(r.status ?? ""))
    .forEach((r: any) => {
      if (!r.user_id) return;

      const rCourseIds = ((r.course_ids ?? []) as string[]).length > 0
        ? (r.course_ids as string[])
        : r.selected_all
          ? Array.from(courseMap.keys())
          : [];

      const amountMap = allocateCourseAmounts({
        courseIds: rCourseIds,
        totalAmount: Number(r.amount_inr) || 0,
        coursePrices: coursePriceMap,
        selectedAll: Boolean(r.selected_all),
      });

      const userAmountMap = approvedAmountByUserCourse.get(r.user_id) ?? new Map<string, number>();
      rCourseIds.forEach((courseId) => {
        userAmountMap.set(courseId, amountMap.get(courseId) ?? 0);
      });
      approvedAmountByUserCourse.set(r.user_id, userAmountMap);
    });

  // 6. Build active enrollments list grouped by LMS student
  const activeByUser = new Map<string, any[]>();
  activeItems
    .filter((a: any) => (a.status ?? "active") === "active")
    .forEach((a: any) => {
      activeByUser.set(a.user_id, [...(activeByUser.get(a.user_id) ?? []), a]);
    });

  const activeEnrollments: ActiveStudentEnrollment[] = Array.from(activeByUser.entries()).map(([userId, rows]) => {
    const prof = profileMap.get(userId);
    const requestAmountMap = approvedAmountByUserCourse.get(userId);
    const courseDetails = rows.map((a: any) => ({
      name: courseMap.get(a.course_id)?.title ?? "Enrolled Course",
      amount_inr: requestAmountMap?.get(a.course_id) ?? (Number(a.amount_paid_inr) || 0),
    }));
    const lastEnrolled = rows
      .map((a: any) => a.enrolled_at)
      .filter(Boolean)
      .sort()
      .at(-1) ?? new Date().toISOString();

    return {
      user_id: userId,
      student_name: prof?.full_name ?? "Student",
      student_email: prof?.email ?? "",
      course_count: courseDetails.length,
      course_details: courseDetails,
      total_paid_inr: courseDetails.reduce((sum, course) => sum + course.amount_inr, 0),
      last_enrolled_at: lastEnrolled,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">
          Admissions & Enrollments
        </p>
        <h1 className="text-3xl font-black text-forest dark:text-cream">
          Enrollment Requests & Active Students
        </h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
          Review manual UPI payment submissions, verify transaction UTR reference numbers, and manage active student course access.
        </p>
      </div>

      <AdminEnrollmentsClient
        initialRequests={requests}
        initialActiveStudents={activeEnrollments}
      />
    </div>
  );
}
