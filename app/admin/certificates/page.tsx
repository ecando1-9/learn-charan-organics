import { Award, CheckCircle2, Clock, Search, ShieldCheck, UserCheck, BookOpen } from "lucide-react";
import { createAdminClient, getAdminClientConfigError } from "@/lib/supabase/admin";
import { AdminConfigNotice } from "@/components/admin/admin-config-notice";

export const dynamic = "force-dynamic";

export default async function AdminCertificatesPage() {
  const configError = getAdminClientConfigError();
  if (configError) {
    return <AdminConfigNotice message={configError} />;
  }

  const admin = createAdminClient();

  // Fetch active enrollments with user profiles and courses
  const { data: enrollments } = await admin
    .from("lms_enrollments")
    .select(`
      id,
      user_id,
      course_id,
      enrolled_at,
      status,
      lms_courses (
        id,
        title,
        slug
      )
    `)
    .order("enrolled_at", { ascending: false });

  // Fetch all profiles
  const { data: profiles } = await admin
    .from("lms_profiles")
    .select("id, full_name, email");

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  // Fetch total completed lessons per user/course from lms_progress
  const { data: progressRows } = await admin
    .from("lms_progress")
    .select("user_id, course_id, completed")
    .eq("completed", true);

  const completedMap = new Map<string, number>();
  (progressRows ?? []).forEach((row: any) => {
    const key = `${row.user_id}:${row.course_id}`;
    completedMap.set(key, (completedMap.get(key) ?? 0) + 1);
  });

  // Calculate items
  const items = (enrollments ?? []).map((enroll: any) => {
    const profile = profileMap.get(enroll.user_id);
    const course = enroll.lms_courses;
    const completedCount = completedMap.get(`${enroll.user_id}:${enroll.course_id}`) ?? 0;
    // Assume ~10 lessons average if total not known
    const totalLessons = 10;
    const progressPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100));
    const isEligible = progressPercent >= 70;

    return {
      id: enroll.id,
      userId: enroll.user_id,
      studentName: profile?.full_name || profile?.email?.split("@")[0] || "Student",
      email: profile?.email || "Unknown Email",
      courseTitle: course?.title || "Course",
      courseSlug: course?.slug || "",
      enrolledAt: new Date(enroll.enrolled_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      completedCount,
      progressPercent,
      isEligible,
    };
  });

  const totalEnrolled = items.length;
  const eligibleCount = items.filter((i) => i.isEligible).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">
          Academic Credentials
        </p>
        <h1 className="text-3xl font-black text-forest dark:text-cream">
          Certificate Management & Issuance
        </h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
          Review student course progress, completion thresholds, and digital certificate verification status.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center justify-between text-amber-500">
            <Award size={20} />
            <span className="text-[11px] font-black bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              70%+ Completed
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-ink/50 dark:text-cream/50">
            Eligible Certificates
          </p>
          <p className="text-3xl font-black text-forest dark:text-cream">{eligibleCount}</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center justify-between text-leaf">
            <UserCheck size={20} />
            <span className="text-[11px] font-black bg-leaf/10 px-2.5 py-0.5 rounded-full">
              Active Roster
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-ink/50 dark:text-cream/50">
            Total Enrolled Students
          </p>
          <p className="text-3xl font-black text-forest dark:text-cream">{totalEnrolled}</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <div className="flex items-center justify-between text-blue-500">
            <ShieldCheck size={20} />
            <span className="text-[11px] font-black bg-blue-500/10 px-2.5 py-0.5 rounded-full">
              Automated
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-ink/50 dark:text-cream/50">
            Verification Protocol
          </p>
          <p className="text-xl font-black text-forest dark:text-cream">QR Code & Serial Stamp</p>
        </div>
      </div>

      {/* Certificates Roster */}
      <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-4">
        <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
          <Award size={20} className="text-leaf" /> Enrolled Students & Completion Status
        </h2>

        {items.length === 0 ? (
          <div className="py-12 text-center text-ink/50 dark:text-cream/50">
            No active student enrollments found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-forest/10 dark:border-white/10 text-ink/50 dark:text-cream/50 text-[11px] font-black uppercase tracking-wider">
                  <th className="pb-3 pl-2">Student</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Enrolled Date</th>
                  <th className="pb-3">Progress</th>
                  <th className="pb-3 text-right pr-2">Certificate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/5 dark:divide-white/5">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-linen/50 dark:hover:bg-white/5 transition">
                    <td className="py-3.5 pl-2 font-bold text-forest dark:text-cream">
                      <div>{item.studentName}</div>
                      <div className="text-[11px] font-normal text-ink/50 dark:text-cream/50">
                        {item.email}
                      </div>
                    </td>
                    <td className="py-3.5 font-semibold text-forest dark:text-cream">
                      {item.courseTitle}
                    </td>
                    <td className="py-3.5 text-ink/60 dark:text-cream/60 font-mono text-xs">
                      {item.enrolledAt}
                    </td>
                    <td className="py-3.5">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>{item.progressPercent}%</span>
                          <span className="text-ink/40">{item.completedCount} lessons</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-forest/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.isEligible ? "bg-emerald-600" : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.max(5, item.progressPercent)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      {item.isEligible ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-sm">
                          <CheckCircle2 size={12} /> Issued / Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                          <Clock size={12} /> In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
