import { AdminConfigNotice } from "@/components/admin/admin-config-notice";
import { createAdminClient, getAdminClientConfigError } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Calendar } from "lucide-react";
import { StudentEnrollmentsManager } from "@/components/admin/student-enrollments-manager";
import { allocateCourseAmounts } from "@/lib/enrollment-amounts";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage(props: { params: Promise<{ id: string }> }) {
  const adminConfigError = getAdminClientConfigError();
  if (adminConfigError) {
    return <AdminConfigNotice message={adminConfigError} />;
  }

  const { id } = await props.params;
  const admin = createAdminClient();

  // Fetch the profile
  const { data: profile, error: profileError } = await admin
    .from("lms_profiles")
    .select("id, full_name, email, role, suspended, created_at")
    .eq("id", id)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // 1. Fetch active enrollments directly
  const { data: rawEnrollments } = await admin
    .from("lms_enrollments")
    .select("id, enrolled_at, course_id, amount_paid_inr")
    .eq("user_id", id)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false });

  const enrollmentItems = rawEnrollments ?? [];

  // 2. Fetch course titles and prices cleanly from lms_courses
  const courseIds = Array.from(new Set(enrollmentItems.map((e: any) => e.course_id).filter(Boolean)));
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

  const { data: approvedRequests } = await admin
    .from("lms_enrollment_requests")
    .select("course_ids, amount_inr, selected_all, status")
    .eq("user_id", id)
    .in("status", ["approved", "active"]);

  const coursePriceMap = new Map(
    Array.from(courseMap.entries()).map(([courseId, course]) => [courseId, course.price_inr])
  );
  const requestAmountMap = new Map<string, number>();
  (approvedRequests ?? []).forEach((request: any) => {
    const requestCourseIds = ((request.course_ids ?? []) as string[]).length > 0
      ? (request.course_ids as string[])
      : request.selected_all
        ? courseIds
        : [];

    const amountMap = allocateCourseAmounts({
      courseIds: requestCourseIds,
      totalAmount: Number(request.amount_inr) || 0,
      coursePrices: coursePriceMap,
      selectedAll: Boolean(request.selected_all),
    });

    requestCourseIds.forEach((courseId) => {
      requestAmountMap.set(courseId, amountMap.get(courseId) ?? 0);
    });
  });

  // 3. Format enrollments to guarantee title display
  const formattedEnrollments = enrollmentItems.map((e: any) => ({
    id: e.id,
    enrolled_at: e.enrolled_at,
    course_id: e.course_id,
    amount_paid_inr: requestAmountMap.get(e.course_id) ?? (Number(e.amount_paid_inr) || 0),
    course: courseMap.get(e.course_id) ?? null,
  }));

  const joinedDate = new Date(profile.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 text-sm font-bold text-ink/65 hover:text-forest dark:text-cream/65 dark:hover:text-cream transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Students</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-3xl bg-forest/10 text-xl font-black text-forest dark:bg-white/10 dark:text-cream">
            {(profile.full_name ?? profile.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black text-forest dark:text-cream">
              {profile.full_name ?? profile.email.split("@")[0]}
            </h2>
            <div className="mt-1 flex flex-wrap gap-y-1 gap-x-4 text-sm text-ink/60 dark:text-cream/60">
              <span className="flex items-center gap-1.5">
                <Mail size={14} />
                {profile.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Joined {joinedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          <span
            className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider ${
              profile.role === "admin"
                ? "bg-forest text-white"
                : "bg-leaf/10 text-leaf"
            }`}
          >
            {profile.role}
          </span>
          <span
            className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider ${
              profile.suspended
                ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                : "bg-leaf/10 text-leaf"
            }`}
          >
            {profile.suspended ? "Suspended" : "Active"}
          </span>
        </div>
      </div>

      {/* Main Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-black text-forest dark:text-cream">Active Course Access</h3>
          <p className="text-sm text-ink/60 dark:text-cream/60 mt-0.5">
            Manage courses this student has active access to. You can de-enroll them from single or multiple courses.
          </p>
        </div>

        <StudentEnrollmentsManager
          userId={id}
          initialEnrollments={formattedEnrollments}
        />
      </div>
    </div>
  );
}
