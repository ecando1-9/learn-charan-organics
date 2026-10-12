"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  PlayCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Video,
} from "lucide-react";
import type { Course } from "@/lib/types";
import type { UserCourseProgress } from "@/app/actions/progress";

export function MyLearningView({
  enrolledCourses,
  freeCourses,
  progressList,
}: {
  enrolledCourses: Course[];
  freeCourses: Course[];
  progressList: UserCourseProgress[];
}) {
  const [activeTab, setActiveTab] = useState<"all" | "premium" | "free">("all");

  // Map progress to course id or slug
  const progressMap = new Map<string, UserCourseProgress>();
  progressList.forEach((p) => {
    progressMap.set(p.courseId, p);
    progressMap.set(p.courseSlug, p);
  });

  // Recently watched / in-progress courses (courses that have progress or are enrolled)
  const recentlyWatched = progressList
    .filter((p) => p.completedLessons > 0)
    .sort((a, b) => b.completionPercentage - a.completionPercentage);

  // If no course has completed lessons yet, use the first enrolled course
  const featuredResume =
    recentlyWatched[0] ||
    (progressList[0] ? progressList[0] : null);

  const displayList =
    activeTab === "premium"
      ? enrolledCourses
      : activeTab === "free"
      ? freeCourses
      : [...enrolledCourses, ...freeCourses];

  return (
    <div className="space-y-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest/10 pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-emerald-500/10 text-leaf dark:text-emerald-400">
              <GraduationCap size={20} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-forest dark:text-cream">
              My Learning & Courses
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-ink/65 dark:text-cream/65">
            Continue your organic formulation journey, access notes, and download official certificates.
          </p>
        </div>

        {/* Quick Certificate Link */}
        <Link href="/dashboard/certificates">
          <button className="inline-flex items-center gap-2 rounded-full bg-forest/5 hover:bg-forest/10 dark:bg-white/10 dark:hover:bg-white/15 px-4 py-2 text-xs font-bold text-forest dark:text-cream transition border border-forest/10 dark:border-white/10">
            <Award size={15} className="text-amber-500" /> My Certificates
          </button>
        </Link>
      </div>

      {/* ── 1. RECENTLY WATCHED / RESUME LEARNING BANNER ── */}
      {featuredResume && (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-forest via-[#0a271c] to-[#041911] p-6 sm:p-8 text-cream shadow-xl border border-emerald-500/30">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-400">
                  Recently Watched • Ready to Continue
                </span>
                {featuredResume.isPremium && (
                  <span className="rounded-full bg-amber-500 text-white text-[9px] font-black px-2 py-0.5">
                    PREMIUM
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                {featuredResume.courseTitle}
              </h2>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-1 max-w-md">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-cream/70">Course Progress</span>
                  <span className="text-emerald-300 font-black">
                    {featuredResume.completionPercentage}% Completed
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-leaf transition-all duration-500"
                    style={{ width: `${Math.max(5, featuredResume.completionPercentage)}%` }}
                  />
                </div>
                <p className="text-[11px] text-cream/50 pt-0.5">
                  {featuredResume.completedLessons} of {featuredResume.totalLessons} lessons marked complete
                  {featuredResume.isPremium && " • 70% unlocks verifiable certificate"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link href={`/learn/${featuredResume.courseSlug}/main-video`}>
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-7 py-3.5 text-sm font-black shadow-lg transition transform hover:scale-105 active:scale-95">
                  <PlayCircle size={18} /> Continue Learning
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. TABS: ALL / PREMIUM / FREE ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-forest/5 p-1 dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-full px-4 py-2 text-xs font-black transition ${
              activeTab === "all"
                ? "bg-forest text-white dark:bg-emerald-600 shadow-xs"
                : "text-ink/65 hover:text-forest dark:text-cream/65 dark:hover:text-cream"
            }`}
          >
            All Courses ({enrolledCourses.length + freeCourses.length})
          </button>
          <button
            onClick={() => setActiveTab("premium")}
            className={`rounded-full px-4 py-2 text-xs font-black transition flex items-center gap-1 ${
              activeTab === "premium"
                ? "bg-forest text-white dark:bg-emerald-600 shadow-xs"
                : "text-ink/65 hover:text-forest dark:text-cream/65 dark:hover:text-cream"
            }`}
          >
            <span>⭐ Premium Enrolled</span>
            <span className="opacity-80">({enrolledCourses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("free")}
            className={`rounded-full px-4 py-2 text-xs font-black transition flex items-center gap-1 ${
              activeTab === "free"
                ? "bg-forest text-white dark:bg-emerald-600 shadow-xs"
                : "text-ink/65 hover:text-forest dark:text-cream/65 dark:hover:text-cream"
            }`}
          >
            <span>🌿 Free Classes</span>
            <span className="opacity-80">({freeCourses.length})</span>
          </button>
        </div>

        <p className="text-xs text-ink/50 dark:text-cream/50">
          Showing {displayList.length} courses
        </p>
      </div>

      {/* ── 3. COURSES GRID ── */}
      {displayList.length === 0 ? (
        <div className="rounded-[2.5rem] bg-white p-12 text-center shadow-soft dark:bg-white/5 space-y-4">
          <BookOpen className="mx-auto size-12 text-ink/30 dark:text-cream/30" />
          <h3 className="text-lg font-black text-forest dark:text-cream">No courses found in this tab</h3>
          <p className="text-xs text-ink/60 dark:text-cream/60 max-w-md mx-auto">
            {activeTab === "premium"
              ? "You haven't enrolled in any paid premium courses yet. Browse our professional formulation masterclasses to unlock lifetime access and certificates!"
              : "No free classes available right now."}
          </p>
          <Link href="/courses">
            <button className="mt-2 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-xs font-bold text-white hover:bg-leaf transition">
              Browse Full Course Catalog <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayList.map((course) => {
            const isEnrolled = enrolledCourses.some((c) => c.id === course.id);
            const isFree = course.price === 0 || Boolean(course.isFree);
            const prog = (course.id ? progressMap.get(course.id) : undefined) || progressMap.get(course.slug);
            const completionPct = prog ? prog.completionPercentage : 0;

            return (
              <div
                key={course.id || course.slug}
                className={`group flex flex-col justify-between overflow-hidden rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-glass ${
                  isEnrolled
                    ? "border-emerald-500/40 bg-white dark:border-emerald-500/30 dark:bg-[#0c1f17]"
                    : "border-forest/10 bg-white dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <div>
                  {/* Thumbnail */}
                  <Link
                    href={`/learn/${course.slug}/main-video`}
                    className="relative aspect-video w-full overflow-hidden bg-black/10 block"
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {/* Badges on Thumbnail */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      {isEnrolled ? (
                        <span className="rounded-full bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 shadow-md flex items-center gap-1">
                          <CheckCircle2 size={11} /> Unlocked
                        </span>
                      ) : isFree ? (
                        <span className="rounded-full bg-teal-600 text-white text-[10px] font-black px-2.5 py-0.5 shadow-md">
                          🌿 Free Class
                        </span>
                      ) : null}

                      {!isFree && (
                        <span className="rounded-full bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 shadow-md flex items-center gap-1">
                          ⭐ PREMIUM
                        </span>
                      )}
                    </div>

                    <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5">
                      {course.category}
                    </span>
                  </Link>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <Link href={`/learn/${course.slug}/main-video`}>
                      <h3 className="font-black text-forest dark:text-cream text-base leading-snug line-clamp-2 hover:text-leaf transition">
                        {course.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-3 text-xs font-semibold text-ink/60 dark:text-cream/60">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-leaf" /> {course.duration}
                      </span>
                      {!isFree ? (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                          <Award size={13} /> Certificate Included
                        </span>
                      ) : (
                        <span className="text-ink/40 dark:text-cream/40">Free Practice</span>
                      )}
                    </div>

                    {/* Progress Bar if enrolled or has progress */}
                    {prog && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] font-bold text-ink/60 dark:text-cream/60">
                          <span>Progress</span>
                          <span className="text-forest dark:text-cream font-black">{completionPct}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-forest/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Button */}
                <div className="p-5 pt-0 border-t border-forest/5 dark:border-white/5 mt-auto">
                  <Link href={`/learn/${course.slug}/main-video`} className="block pt-3">
                    <button className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-forest hover:bg-leaf text-white py-2.5 px-4 text-xs font-bold transition shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-500">
                      <PlayCircle size={15} /> Watch Lessons
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
