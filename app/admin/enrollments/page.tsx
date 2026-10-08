import Link from "next/link";
import { CheckCircle2, Clock, Eye, XCircle, Users, BookOpen } from "lucide-react";
import { AdminConfigNotice } from "@/components/admin/admin-config-notice";
import { createAdminClient, getAdminClientConfigError } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";
import { AdminEnrollmentActions } from "@/components/admin/enrollment-actions";
import { allocateCourseAmounts } from "@/lib/enrollment-amounts";

export const dynamic = "force-dynamic";

type EnrollmentRequest = {
  id: string;
  user_id: string | null;
  status: string;
  course_title: string;
  course_details: { name: string; amount_inr: number }[];
  course_count: number;
  amount_inr: number;
  upi_id: string;
  utr_number: string | null;
  payment_proof_url: string | null;
  selected_all: boolean;
  requested_at: string;
  admin_note: string | null;
  lms_profiles: { full_name: string | null; email: string } | null;
};

type ActiveEnrollment = {
  user_id: string;
  course_details: { name: string; amount_inr: number }[];
  course_count: number;
  last_enrolled_at: string;
  total_paid_inr: number;
  student_name: string;
  student_email: string;
};

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
      ...activeItems.map((a: any) => a.user_id)
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
  const requests: EnrollmentRequest[] = requestItems.map((r: any) => {
    const requestCourseIds = (r.course_ids ?? []) as string[];
    const amountMap = allocateCourseAmounts({
      courseIds: requestCourseIds,
      totalAmount: Number(r.amount_inr) || 0,
      coursePrices: coursePriceMap,
      selectedAll: Boolean(r.selected_all),
    });
    const courseDetails = requestCourseIds
      .map((id) => ({
        name: courseMap.get(id)?.title ?? "Selected Course",
        amount_inr: amountMap.get(id) ?? 0,
      }));

    return {
      id: r.id,
      user_id: r.user_id ?? null,
      status: r.status ?? "pending",
      course_title: r.course_title ?? "Course Enrollment",
      course_details: courseDetails,
      course_count: requestCourseIds.length || (r.selected_all ? courseMap.size : 1),
      amount_inr: Number(r.amount_inr) || 0,
      upi_id: r.upi_id ?? "—",
      utr_number: r.utr_number ?? null,
      payment_proof_url: r.payment_proof_url ?? null,
      selected_all: Boolean(r.selected_all),
      requested_at: r.requested_at || new Date().toISOString(),
      admin_note: r.admin_note ?? null,
      lms_profiles: r.user_id ? profileMap.get(r.user_id) ?? null : null,
    };
  });

  const approvedAmountByUserCourse = new Map<string, Map<string, number>>();
  requestItems
    .filter((r: any) => ["approved", "active"].includes(r.status ?? ""))
    .forEach((r: any) => {
      if (!r.user_id) return;

      const requestCourseIds = ((r.course_ids ?? []) as string[]).length > 0
        ? (r.course_ids as string[])
        : r.selected_all
          ? Array.from(courseMap.keys())
          : [];

      const amountMap = allocateCourseAmounts({
        courseIds: requestCourseIds,
        totalAmount: Number(r.amount_inr) || 0,
        coursePrices: coursePriceMap,
        selectedAll: Boolean(r.selected_all),
      });

      const userAmountMap = approvedAmountByUserCourse.get(r.user_id) ?? new Map<string, number>();
      requestCourseIds.forEach((courseId) => {
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

  const activeEnrollments: ActiveEnrollment[] = Array.from(activeByUser.entries()).map(([userId, rows]) => {
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
      course_details: courseDetails,
      course_count: courseDetails.length,
      last_enrolled_at: lastEnrolled,
      total_paid_inr: courseDetails.reduce((sum, course) => sum + course.amount_inr, 0),
      student_name: prof?.full_name ?? "Student",
      student_email: prof?.email ?? "",
    };
  });

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-forest dark:text-cream">Enrollment Requests & Active Students</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
          Review manual UPI payment submissions, verify transaction UTR numbers, and grant course access.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-ink/50 dark:text-cream/50 uppercase">Pending Requests</p>
              <p className="text-2xl font-black text-forest dark:text-cream">{pendingRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-leaf/10 text-leaf">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-ink/50 dark:text-cream/50 uppercase">Active Enrollments</p>
              <p className="text-2xl font-black text-forest dark:text-cream">{activeEnrollments.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-ink/50 dark:text-cream/50 uppercase">Rejected Requests</p>
              <p className="text-2xl font-black text-forest dark:text-cream">{rejectedRequests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
          <Clock className="text-amber-500" size={20} /> Pending Verification ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="rounded-[2rem] border border-forest/10 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-white/5">
            <CheckCircle2 className="mx-auto text-leaf mb-2" size={32} />
            <p className="text-base font-bold text-forest dark:text-cream">All Caught Up!</p>
            <p className="mt-1 text-xs text-ink/50 dark:text-cream/50">
              No pending enrollment verification requests.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-col justify-between rounded-[2rem] border border-forest/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[10px] font-black uppercase text-amber-700 dark:bg-amber-400/20 dark:text-amber-300">
                        Pending Verification
                      </span>
                      <h3 className="mt-2 text-base font-black text-forest dark:text-cream leading-snug">
                        {req.course_title}
                      </h3>
                    </div>
                    <span className="text-base font-black text-leaf">
                      {formatCurrency(req.amount_inr)}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-linen p-3 text-xs space-y-1 dark:bg-white/5">
                    <p className="font-bold text-forest dark:text-cream">
                      Student: {req.lms_profiles?.full_name || req.lms_profiles?.email || "Unknown Student"}
                    </p>
                    <p className="text-ink/60 dark:text-cream/60">{req.lms_profiles?.email}</p>
                    <p className="font-bold text-forest dark:text-cream">
                      Courses selected: {req.course_count}
                    </p>
                    <p className="text-ink/60 dark:text-cream/60">
                      {(req.course_details.length > 0 ? req.course_details : [{ name: req.course_title, amount_inr: req.amount_inr }]).map((course) => (
                        <span key={course.name} className="block">
                          {course.name}: <b>{formatCurrency(course.amount_inr)}</b>
                        </span>
                      ))}
                    </p>
                    <p className="text-ink/60 dark:text-cream/60">UPI: {req.upi_id}</p>
                    {req.utr_number && (
                      <p className="font-mono font-bold text-leaf">UTR / Reference: {req.utr_number}</p>
                    )}
                    <p className="text-[10px] text-ink/40 dark:text-cream/40 pt-1">
                      Submitted: {new Date(req.requested_at).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {req.payment_proof_url && (
                    <a
                      href={req.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-leaf hover:underline"
                    >
                      <Eye size={14} /> View Payment Screenshot
                    </a>
                  )}
                  {req.user_id && (
                    <Link
                      href={`/admin/students/${req.user_id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline dark:text-cream"
                    >
                      View full student details
                    </Link>
                  )}
                </div>

                <div className="pt-2 border-t border-forest/10 dark:border-white/10">
                  <AdminEnrollmentActions requestId={req.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Enrollments Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
          <BookOpen className="text-leaf" size={20} /> Active Student Enrollments ({activeEnrollments.length})
        </h2>

        {activeEnrollments.length === 0 ? (
          <div className="rounded-[2rem] border border-forest/10 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-white/5">
            <Users className="mx-auto text-ink/30 dark:text-cream/30 mb-2" size={32} />
            <p className="text-base font-bold text-forest dark:text-cream">No Active Enrollments Yet</p>
            <p className="mt-1 text-xs text-ink/50 dark:text-cream/50">
              Approved students will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[2rem] border border-forest/10 bg-white shadow-soft dark:border-white/10 dark:bg-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-forest/10 bg-linen/50 dark:border-white/10 dark:bg-white/5">
                  <tr>
                    <th className="p-4 font-bold text-forest dark:text-cream">Student Name</th>
                    <th className="p-4 font-bold text-forest dark:text-cream">Email</th>
                    <th className="p-4 font-bold text-forest dark:text-cream">Courses</th>
                    <th className="p-4 font-bold text-forest dark:text-cream">Last Enrolled</th>
                    <th className="p-4 font-bold text-forest dark:text-cream">Details</th>
                    <th className="p-4 font-bold text-forest dark:text-cream">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/10 dark:divide-white/10">
                  {activeEnrollments.map((item) => (
                    <tr key={item.user_id} className="hover:bg-linen/30 dark:hover:bg-white/5">
                      <td className="p-4 font-bold text-forest dark:text-cream">{item.student_name}</td>
                      <td className="p-4 text-ink/70 dark:text-cream/70">{item.student_email}</td>
                      <td className="p-4">
                        <p className="font-black text-leaf">{item.course_count} course{item.course_count !== 1 ? "s" : ""}</p>
                        <div className="mt-1 max-w-md space-y-1 text-xs text-ink/60 dark:text-cream/60">
                          {item.course_details.map((course) => (
                            <p key={`${item.user_id}-${course.name}`} className="flex justify-between gap-3">
                              <span>{course.name}</span>
                              <span className="font-black text-forest dark:text-cream">{formatCurrency(course.amount_inr)}</span>
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-ink/60 dark:text-cream/60">
                        {new Date(item.last_enrolled_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/admin/students/${item.user_id}`}
                          className="rounded-full bg-forest px-3 py-1.5 text-xs font-bold text-white hover:bg-leaf"
                        >
                          View Details
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
