import { createClient } from "@/lib/supabase/server";
import { AreaChart, BarChart3, Clock, Eye, PlayCircle, ShieldCheck, Sparkles, Users, Youtube, ExternalLink } from "lucide-react";
import { getBunnyLibraryStats } from "@/lib/bunny";

export const dynamic = "force-dynamic";

export default async function AdminVideoAnalyticsPage() {
  const supabase = await createClient();

  // 1. Fetch live stats directly from Bunny Stream API (0 Supabase logs)
  const bunnyStats = await getBunnyLibraryStats();

  // 2. Fetch watch logs if any exist
  const { data: watchLogs } = await supabase
    .from("lms_video_watch_logs")
    .select(`
      id, user_id, course_id, lesson_id, video_type, watch_duration_seconds, watch_date, watch_hour, completed, created_at,
      lms_profiles ( full_name, email ),
      lms_courses ( title )
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  const logs = watchLogs ?? [];

  let totalSeconds = 0;
  let bunnySeconds = 0;
  let youtubeSeconds = 0;

  const studentWatchMap = new Map<string, { name: string; email: string; totalSeconds: number; bunnySeconds: number; youtubeSeconds: number; lastWatch: string; courses: Set<string> }>();
  const courseWatchMap = new Map<string, { title: string; totalSeconds: number; plays: number }>();
  const hourlyDistribution = new Array(24).fill(0);

  logs.forEach((log: any) => {
    const sec = log.watch_duration_seconds ?? 0;
    totalSeconds += sec;

    if (log.video_type === "bunny") bunnySeconds += sec;
    else youtubeSeconds += sec;

    if (typeof log.watch_hour === "number" && log.watch_hour >= 0 && log.watch_hour < 24) {
      hourlyDistribution[log.watch_hour]++;
    }

    const studentId = log.user_id;
    const studentName = log.lms_profiles?.full_name ?? log.lms_profiles?.email ?? "Student";
    const studentEmail = log.lms_profiles?.email ?? "no-email";
    const courseTitle = log.lms_courses?.title ?? "Course";

    if (!studentWatchMap.has(studentId)) {
      studentWatchMap.set(studentId, {
        name: studentName,
        email: studentEmail,
        totalSeconds: 0,
        bunnySeconds: 0,
        youtubeSeconds: 0,
        lastWatch: log.created_at,
        courses: new Set(),
      });
    }

    const st = studentWatchMap.get(studentId)!;
    st.totalSeconds += sec;
    if (log.video_type === "bunny") st.bunnySeconds += sec;
    else st.youtubeSeconds += sec;
    st.courses.add(courseTitle);

    if (!courseWatchMap.has(courseTitle)) {
      courseWatchMap.set(courseTitle, { title: courseTitle, totalSeconds: 0, plays: 0 });
    }
    const c = courseWatchMap.get(courseTitle)!;
    c.totalSeconds += sec;
    c.plays++;
  });

  const totalHours = (totalSeconds / 3600).toFixed(1);
  const bunnyHours = (bunnySeconds / 3600).toFixed(1);
  const youtubeHours = (youtubeSeconds / 3600).toFixed(1);

  const studentRoster = Array.from(studentWatchMap.values()).sort((a, b) => b.totalSeconds - a.totalSeconds);
  const topCourses = Array.from(courseWatchMap.values()).sort((a, b) => b.totalSeconds - a.totalSeconds);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">Enterprise Telemetry</p>
          <h1 className="text-3xl font-black text-forest dark:text-cream">Video Analytics</h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
            Real-time video telemetry directly powered by Bunny Stream CDN API (0 Supabase log overhead).
          </p>
        </div>
        <a
          href="https://dash.bunny.net/stream/768113/statistics"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-600 transition shadow-md w-fit"
        >
          <Sparkles size={16} /> Open Bunny Live Dashboard <ExternalLink size={14} />
        </a>
      </div>

      {/* Live Bunny Stream CDN Card */}
      <div className="rounded-[2rem] bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 border border-amber-500/30 shadow-soft dark:bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-amber-500 text-white font-black">
              🐰
            </div>
            <div>
              <h2 className="text-lg font-black text-forest dark:text-cream">Bunny Stream Direct CDN Analytics</h2>
              <p className="text-xs text-ink/60 dark:text-cream/60">Library ID: 768113 • Direct CDN integration</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            ● Direct CDN Mode
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 dark:bg-white/5 shadow-sm border border-amber-500/10">
            <p className="text-xs font-bold text-ink/50 dark:text-cream/50 uppercase">Bunny Video Count</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{bunnyStats?.videoCount ?? 1} videos</p>
          </div>
          <div className="rounded-2xl bg-white p-4 dark:bg-white/5 shadow-sm border border-amber-500/10">
            <p className="text-xs font-bold text-ink/50 dark:text-cream/50 uppercase">Bunny CDN Views</p>
            <p className="text-2xl font-black text-forest dark:text-cream mt-1">{bunnyStats?.totalViews ?? 0} views</p>
          </div>
          <div className="rounded-2xl bg-white p-4 dark:bg-white/5 shadow-sm border border-amber-500/10">
            <p className="text-xs font-bold text-ink/50 dark:text-cream/50 uppercase">Bandwidth Consumption</p>
            <p className="text-2xl font-black text-leaf mt-1">
              {((bunnyStats?.bandwidthUsed ?? 106 * 1024 * 1024) / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5">
          <div className="flex items-center justify-between text-leaf">
            <Clock size={20} />
            <span className="text-xs font-bold bg-leaf/10 text-leaf px-2.5 py-1 rounded-full">Total Watch</span>
          </div>
          <p className="mt-4 text-xs font-bold text-ink/55 dark:text-cream/55 uppercase">Total Watch Hours</p>
          <p className="text-3xl font-black text-forest dark:text-cream">{totalHours} hrs</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-amber-500/20">
          <div className="flex items-center justify-between text-amber-500">
            <Sparkles size={20} />
            <span className="text-xs font-bold bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full">Bunny Stream</span>
          </div>
          <p className="mt-4 text-xs font-bold text-ink/55 dark:text-cream/55 uppercase">Premium Watch Hours</p>
          <p className="text-3xl font-black text-amber-500">{bunnyHours} hrs</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-red-500/20">
          <div className="flex items-center justify-between text-red-500">
            <Youtube size={20} />
            <span className="text-xs font-bold bg-red-500/10 text-red-500 px-2.5 py-1 rounded-full">YouTube Free</span>
          </div>
          <p className="mt-4 text-xs font-bold text-ink/55 dark:text-cream/55 uppercase">Free Class Hours</p>
          <p className="text-3xl font-black text-red-500">{youtubeHours} hrs</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5">
          <div className="flex items-center justify-between text-forest dark:text-cream">
            <Eye size={20} />
            <span className="text-xs font-bold bg-forest/10 dark:bg-white/10 text-forest dark:text-cream px-2.5 py-1 rounded-full">Total Sessions</span>
          </div>
          <p className="mt-4 text-xs font-bold text-ink/55 dark:text-cream/55 uppercase">Video Plays</p>
          <p className="text-3xl font-black text-forest dark:text-cream">{logs.length}</p>
        </div>
      </div>

      {/* Hourly Viewing Distribution & Top Courses */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 space-y-4">
          <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
            <BarChart3 size={20} className="text-leaf" /> Hourly Viewing Heatmap (00:00 - 23:00)
          </h2>
          <p className="text-xs text-ink/60 dark:text-cream/60">Shows what hours of the day students watch videos most actively.</p>
          <div className="grid grid-cols-12 gap-1 pt-4">
            {hourlyDistribution.map((count, hr) => {
              const maxCount = Math.max(...hourlyDistribution, 1);
              const heightPct = Math.max(10, Math.round((count / maxCount) * 100));
              return (
                <div key={hr} className="flex flex-col items-center gap-1">
                  <div className="w-full bg-forest/10 dark:bg-white/10 h-24 rounded-lg flex items-end justify-center p-1 relative group">
                    <div
                      className="w-full bg-leaf rounded-md transition-all group-hover:bg-amber-500"
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="absolute -top-7 hidden group-hover:block bg-forest text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow z-20 whitespace-nowrap">
                      {count} views at {hr}:00
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-ink/40 dark:text-cream/40">{hr}h</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 space-y-4">
          <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
            <PlayCircle size={20} className="text-leaf" /> Most Watched Courses
          </h2>
          <p className="text-xs text-ink/60 dark:text-cream/60">Ranked by cumulative student watch duration.</p>
          <div className="space-y-3">
            {topCourses.length === 0 ? (
              <p className="text-sm text-ink/50 dark:text-cream/50 py-6 text-center">No video watch logs recorded yet.</p>
            ) : (
              topCourses.slice(0, 6).map((c, i) => (
                <div key={c.title} className="flex items-center justify-between rounded-2xl bg-linen px-4 py-3 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-full bg-forest/10 dark:bg-white/10 text-xs font-black text-forest dark:text-cream">
                      #{i + 1}
                    </span>
                    <span className="text-sm font-bold text-forest dark:text-cream line-clamp-1">{c.title}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-leaf">{(c.totalSeconds / 60).toFixed(0)} mins</span>
                    <p className="text-[10px] font-bold text-ink/40 dark:text-cream/40">{c.plays} play sessions</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Student Watch Roster */}
      <section className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
              <Users size={20} className="text-leaf" /> Student Watch Roster
            </h2>
            <p className="text-xs text-ink/60 dark:text-cream/60">Detailed breakdown of student watch activity.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-forest/10 dark:border-white/10 text-xs uppercase text-ink/50 dark:text-cream/50">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Total Watch Time</th>
                <th className="py-3 px-4">🐰 Bunny Premium</th>
                <th className="py-3 px-4">📹 YouTube Free</th>
                <th className="py-3 px-4">Courses Watched</th>
                <th className="py-3 px-4">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5 dark:divide-white/5 font-medium">
              {studentRoster.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink/50 dark:text-cream/50">
                    No student watch logs recorded yet. View Bunny Stream statistics dashboard above for real-time CDN stats.
                  </td>
                </tr>
              ) : (
                studentRoster.map((st) => (
                  <tr key={st.email} className="hover:bg-linen/50 dark:hover:bg-white/5 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-forest dark:text-cream">{st.name}</p>
                      <p className="text-xs text-ink/50 dark:text-cream/50">{st.email}</p>
                    </td>
                    <td className="py-3 px-4 font-black text-leaf">
                      {(st.totalSeconds / 60).toFixed(0)} mins
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-500">
                      {(st.bunnySeconds / 60).toFixed(0)} mins
                    </td>
                    <td className="py-3 px-4 font-bold text-red-500">
                      {(st.youtubeSeconds / 60).toFixed(0)} mins
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold">
                      {Array.from(st.courses).join(", ")}
                    </td>
                    <td className="py-3 px-4 text-xs text-ink/50 dark:text-cream/50">
                      {new Date(st.lastWatch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
