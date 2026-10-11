import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  PlayCircle,
  Sparkles,
  TrendingUp,
  Users2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserEnrolledCoursesWithProgress } from "@/app/actions/progress";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: enrolledCourses, userName } = await getUserEnrolledCoursesWithProgress();

  const totalCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter((c) => c.eligibleForCertificate).length;
  const inProgressCourses = totalCourses - completedCourses;

  // Compute total completed lessons and average progress
  const totalLessonsCount = enrolledCourses.reduce((sum, c) => sum + c.totalLessons, 0);
  const completedLessonsCount = enrolledCourses.reduce((sum, c) => sum + c.completedLessons, 0);
  const avgProgress =
    totalCourses > 0
      ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.completionPercentage, 0) / totalCourses)
      : 0;

  // Active / Most recent course for "Continue Learning"
  const activeCourse = enrolledCourses.find((c) => !c.eligibleForCertificate) || enrolledCourses[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-[2.5rem] bg-gradient-to-r from-[#0e1f18] via-[#12382a] to-[#07140f] p-6 sm:p-8 text-cream shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-leaf border border-emerald-500/30">
              <ShieldCheck size={14} /> Student Portal
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white">
            Welcome back, {userName || "Student"}! 👋
          </h1>
          <p className="mt-1 text-sm text-cream/75 max-w-xl">
            {totalCourses > 0
              ? `You are actively enrolled in ${totalCourses} formulation ${totalCourses === 1 ? "course" : "courses"}. Pick up where you left off or check your certificate eligibility.`
              : "Welcome to Charan Organics Academy! Explore our masterclasses to start formulating organic products."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/courses">
            <Button className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-500 shadow-md">
              <BookOpen size={15} /> All My Courses
            </Button>
          </Link>
          <Link href="/community">
            <Button variant="secondary" className="rounded-full bg-white/10 px-4 py-2.5 text-xs font-bold text-cream hover:bg-white/20 border border-white/15">
              <Users2 size={15} /> Batch Community
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5">
          <div className="flex items-center justify-between">
            <BookOpen className="text-leaf" size={24} />
            <span className="text-[11px] font-black text-leaf bg-leaf/10 px-2.5 py-0.5 rounded-full">
              Enrolled
            </span>
          </div>
          <p className="mt-4 text-xs font-bold text-ink/55 dark:text-cream/55 uppercase tracking-wide">
            Enrolled Courses
          </p>
          <p className="text-3xl font-black text-forest dark:text-cream">{totalCourses}</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5">
          <div className="flex items-center justify-between">
            <Award className="text-amber-500" size={24} />
            <span className="text-[11px] font-black text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              ≥ 70% Progress
            </span>
          </div>
          <p className="mt-4 text-xs font-bold text-ink/55 dark:text-cream/55 uppercase tracking-wide">
            Certificates Ready
          </p>
          <p className="text-3xl font-black text-forest dark:text-cream">{completedCourses}</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5">
          <div className="flex items-center justify-between">
            <TrendingUp className="text-blue-500" size={24} />
            <span className="text-[11px] font-black text-blue-600 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
              Overall
            </span>
          </div>
          <p className="mt-4 text-xs font-bold text-ink/55 dark:text-cream/55 uppercase tracking-wide">
            Average Progress
          </p>
          <p className="text-3xl font-black text-forest dark:text-cream">{avgProgress}%</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5">
          <div className="flex items-center justify-between">
            <Clock className="text-clay" size={24} />
            <span className="text-[11px] font-black text-clay bg-clay/10 px-2.5 py-0.5 rounded-full">
              Lessons
            </span>
          </div>
          <p className="mt-4 text-xs font-bold text-ink/55 dark:text-cream/55 uppercase tracking-wide">
            Completed Lessons
          </p>
          <p className="text-3xl font-black text-forest dark:text-cream">
            {completedLessonsCount} <span className="text-sm text-ink/40 font-normal">/ {totalLessonsCount}</span>
          </p>
        </div>
      </div>

      {/* Continue Learning Spotlight (If user has courses) */}
      {activeCourse ? (
        <section className="relative overflow-hidden rounded-[2.5rem] bg-forest p-6 sm:p-8 text-cream shadow-soft dark:bg-[#0c1f17] border border-emerald-500/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-black uppercase text-leaf">
                  <PlayCircle size={13} /> Continue Learning
                </span>
                <span className="text-xs text-cream/60">
                  {activeCourse.completionPercentage}% Complete
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {activeCourse.courseTitle}
              </h2>
              <div className="w-full max-w-md space-y-1.5">
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-leaf rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, activeCourse.completionPercentage)}%` }}
                  />
                </div>
                <p className="text-xs text-cream/70">
                  {activeCourse.completedLessons} of {activeCourse.totalLessons} lessons finished
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/learn/${activeCourse.courseSlug}/main-video`}>
                <Button className="w-full sm:w-auto rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-black text-white hover:bg-emerald-500 shadow-md transition scale-100 hover:scale-[1.02]">
                  <PlayCircle size={18} /> Resume Lesson
                </Button>
              </Link>
              {activeCourse.eligibleForCertificate && (
                <Link href="/dashboard/certificates">
                  <Button variant="secondary" className="w-full sm:w-auto rounded-full bg-white/15 px-5 py-3.5 text-sm font-black text-white hover:bg-white/25">
                    <Award size={18} /> Certificate
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-[2.5rem] bg-gradient-to-r from-forest to-[#12382a] p-8 text-cream shadow-soft">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-cream">
              <Sparkles size={14} /> Get Started
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Start Your Learning Today</h2>
            <p className="text-sm leading-6 text-cream/80">
              Browse professional formulation courses designed for certified organic and herbal cosmetics. Lifetime access, downloadable formulation notes, and instant certificates.
            </p>
            <div className="pt-2">
              <Link href="/courses">
                <Button className="rounded-full bg-white px-6 py-3 text-sm font-black text-forest hover:bg-cream shadow-md">
                  Browse Course Catalog <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Main Grid: Enrolled Courses & Quick Resources */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left: Enrolled Courses List */}
        <section className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-forest dark:text-cream">My Active Courses</h2>
              <p className="text-xs text-ink/60 dark:text-cream/60">
                Direct access to video classrooms and completion tracking
              </p>
            </div>
            <Link
              href="/dashboard/courses"
              className="text-xs font-bold text-leaf hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="rounded-2xl bg-linen p-8 text-center dark:bg-white/5 space-y-3">
              <p className="text-sm font-semibold text-ink/70 dark:text-cream/70">
                You haven&apos;t enrolled in any courses yet.
              </p>
              <Link href="/courses">
                <Button className="rounded-full bg-forest text-white hover:bg-leaf text-xs font-bold px-4 py-2 min-h-0 h-9">
                  Explore Courses
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrolledCourses.slice(0, 4).map((course) => (
                <div
                  key={course.courseId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-forest/10 p-4 transition hover:border-forest/25 dark:border-white/10 dark:hover:border-white/20"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.courseTitle}
                        className="size-14 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="grid size-14 place-items-center rounded-xl bg-forest/10 text-leaf shrink-0">
                        <BookOpen size={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-forest dark:text-cream truncate">
                        {course.courseTitle}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-ink/60 dark:text-cream/60">
                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                        <span>•</span>
                        <span className={course.eligibleForCertificate ? "text-emerald-600 font-bold" : ""}>
                          {course.completionPercentage}% complete
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/learn/${course.courseSlug}/main-video`} className="shrink-0">
                    <Button className="w-full sm:w-auto rounded-full bg-forest text-white hover:bg-leaf text-xs font-bold px-4 py-2 min-h-0 h-9">
                      <PlayCircle size={14} /> Open Lesson
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right: Quick Resources & Support */}
        <section className="space-y-4">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-4">
            <h3 className="text-lg font-black text-forest dark:text-cream">Learning Shortcuts</h3>

            <div className="space-y-2.5">
              <Link
                href="/dashboard/certificates"
                className="flex items-center justify-between rounded-2xl bg-linen p-3.5 hover:bg-forest/10 transition dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                    <Award size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-forest dark:text-cream">Certificates</p>
                    <p className="text-[11px] text-ink/50 dark:text-cream/50">
                      {completedCourses} eligible for download
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-ink/40" />
              </Link>

              <Link
                href="/community"
                className="flex items-center justify-between rounded-2xl bg-linen p-3.5 hover:bg-forest/10 transition dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-leaf/10 text-leaf">
                    <Users2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-forest dark:text-cream">Batch Chat Groups</p>
                    <p className="text-[11px] text-ink/50 dark:text-cream/50">
                      Connect with formulator peers
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-ink/40" />
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center justify-between rounded-2xl bg-linen p-3.5 hover:bg-forest/10 transition dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-forest dark:text-cream">Payment Receipts</p>
                    <p className="text-[11px] text-ink/50 dark:text-cream/50">
                      Check transaction verification
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-ink/40" />
              </Link>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-forest/5 p-5 border border-emerald-500/20 text-center space-y-2 dark:bg-white/5">
            <p className="text-xs font-black uppercase text-leaf tracking-wider">Direct Mentorship</p>
            <p className="text-sm font-black text-forest dark:text-cream">Need formulation assistance?</p>
            <p className="text-xs text-ink/60 dark:text-cream/60">
              Our faculty responds directly in the batch chat and WhatsApp support helpline.
            </p>
            <div className="pt-2">
              <Link href="/contact">
                <Button variant="secondary" className="rounded-full text-xs font-bold px-4 py-2 min-h-0 h-9">
                  Contact Academy Support
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
