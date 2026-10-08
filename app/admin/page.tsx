import { Activity, BookOpen, Clock, IndianRupee, TrendingUp, Users, ShieldAlert, Sparkles, Youtube } from "lucide-react";
import { EnrollmentChart, RevenueChart } from "@/components/admin/admin-charts";
import { AdminConfigNotice } from "@/components/admin/admin-config-notice";
import { createAdminClient, getAdminClientConfigError } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminConfigError = getAdminClientConfigError();
  if (adminConfigError) {
    return <AdminConfigNotice message={adminConfigError} />;
  }

  const admin = createAdminClient();

  const [
    { data: requestUsers },
    { count: courseCount },
    { data: enrollmentRows },
    { data: watchLogs },
    { data: recentLogs }
  ] = await Promise.all([
    admin.from("lms_enrollment_requests").select("user_id"),
    admin.from("lms_courses").select("id", { count: "exact", head: true }),
    admin.from("lms_enrollments").select("user_id, status"),
    admin.from("lms_video_watch_logs").select("watch_duration_seconds, video_type"),
    admin.from("lms_audit_logs").select("*").order("created_at", { ascending: false }).limit(6)
  ]);

  const lmsStudentIds = new Set([
    ...(requestUsers ?? []).map((r: any) => r.user_id),
    ...(enrollmentRows ?? []).map((e: any) => e.user_id),
  ].filter(Boolean));
  const activeLearnerIds = new Set(
    (enrollmentRows ?? [])
      .filter((e: any) => e.status === "active")
      .map((e: any) => e.user_id)
      .filter(Boolean)
  );

  let totalWatchSeconds = 0;
  let bunnySeconds = 0;
  let youtubeSeconds = 0;

  (watchLogs ?? []).forEach((w: any) => {
    const sec = w.watch_duration_seconds ?? 0;
    totalWatchSeconds += sec;
    if (w.video_type === "bunny") bunnySeconds += sec;
    else youtubeSeconds += sec;
  });

  const totalWatchHours = (totalWatchSeconds / 3600).toFixed(1);
  const bunnyHours = (bunnySeconds / 3600).toFixed(1);
  const youtubeHours = (youtubeSeconds / 3600).toFixed(1);

  const cards = [
    ["LMS Students", String(lmsStudentIds.size), Users],
    ["Total Courses", String(courseCount ?? 0), BookOpen],
    ["Active Learners", String(activeLearnerIds.size), Activity],
    ["Total Watch Hours", `${totalWatchHours} hrs`, Clock],
    ["Bunny Stream Hours", `${bunnyHours} hrs`, Sparkles],
    ["YouTube Free Hours", `${youtubeHours} hrs`, Youtube]
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map(([label, value, Icon]) => (
          <div key={label as string} className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5">
            <Icon className="text-leaf" size={20} />
            <p className="mt-4 text-xs font-bold text-ink/55 dark:text-cream/55 uppercase">{label as string}</p>
            <p className="text-2xl font-black text-forest dark:text-cream">{value as string}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5">
          <h2 className="text-xl font-black text-forest dark:text-cream">Revenue analytics</h2>
          <RevenueChart />
        </section>
        <section className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5">
          <h2 className="text-xl font-black text-forest dark:text-cream">Enrollment analytics</h2>
          <EnrollmentChart />
        </section>
      </div>

      {/* Live System Activity Feed */}
      <section className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
            <Activity className="text-leaf" size={20} /> Recent System & Student Activity
          </h2>
          <a href="/admin/logs" className="text-xs font-bold text-leaf hover:underline">
            View All Logs →
          </a>
        </div>

        <div className="space-y-2">
          {(!recentLogs || recentLogs.length === 0) ? (
            <div className="rounded-2xl bg-linen p-4 text-sm font-semibold text-ink/60 dark:bg-white/5 dark:text-cream/60">
              No activity logged yet. Live audit logs will record student playback, course edits, and admin actions automatically.
            </div>
          ) : (
            recentLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between rounded-2xl bg-linen px-4 py-3 text-sm dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-forest dark:text-cream">{log.user_email || "System"}</span>
                  <span className="rounded-full bg-leaf/10 px-2.5 py-0.5 text-xs font-black text-leaf">
                    {log.action}
                  </span>
                </div>
                <span className="text-xs text-ink/50 dark:text-cream/50">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
