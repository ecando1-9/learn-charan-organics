"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { AdminCourse } from "@/app/admin/courses/page";
import { EditCourseModal } from "@/components/admin/course-create-form";
import { ImageOff, Sparkles, Youtube } from "lucide-react";

export function AdminCoursesTable({ courses }: { courses: AdminCourse[] }) {
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "free">("all");

  if (!courses.length) {
    return (
      <div className="rounded-[2rem] bg-white dark:bg-white/5 shadow-soft p-10 text-center">
        <p className="text-sm font-semibold text-ink/60 dark:text-cream/60">
          No courses yet. Add the first course using the button above.
        </p>
      </div>
    );
  }

  const paidCount = courses.filter((c) => c.price_inr > 0 || Boolean(c.bunny_video_id)).length;
  const freeCount = courses.filter((c) => c.price_inr === 0 && !c.bunny_video_id).length;

  const filteredCourses = courses.filter((c) => {
    const isPremium = c.price_inr > 0 || Boolean(c.bunny_video_id);
    if (activeTab === "paid") return isPremium;
    if (activeTab === "free") return !isPremium;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-white/5 border border-forest/10 dark:border-white/10 w-fit">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "all"
              ? "bg-forest text-white shadow-sm"
              : "text-ink/60 dark:text-cream/60 hover:text-ink dark:hover:text-cream"
          }`}
        >
          All Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab("paid")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "paid"
              ? "bg-amber-500 text-white shadow-sm"
              : "text-ink/60 dark:text-cream/60 hover:text-amber-500"
          }`}
        >
          <Sparkles size={14} />
          <span>Premium Courses</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{paidCount}</span>
        </button>
        <button
          onClick={() => setActiveTab("free")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "free"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-ink/60 dark:text-cream/60 hover:text-emerald-500"
          }`}
        >
          <Youtube size={14} />
          <span>Free Courses</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{freeCount}</span>
        </button>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="rounded-[2rem] bg-white dark:bg-white/5 shadow-soft p-10 text-center">
          <p className="text-sm font-semibold text-ink/60 dark:text-cream/60">
            No courses found in this category.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isBunny = Boolean(course.bunny_video_id);
            const isPremium = course.price_inr > 0 || isBunny;

            const thumb = course.thumbnail_url
              || (course.youtube_url
                ? `https://img.youtube.com/vi/${extractYtId(course.youtube_url)}/hqdefault.jpg`
                : null);

            return (
              <div
                key={course.id}
                className="rounded-[2rem] bg-white dark:bg-white/5 shadow-soft overflow-hidden flex flex-col border border-forest/5 dark:border-white/5"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-forest/5 dark:bg-white/5 overflow-hidden">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff size={32} className="text-ink/20 dark:text-cream/20" />
                    </div>
                  )}

                  {/* Course Type Badge */}
                  <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-black backdrop-blur shadow-sm ${
                    isPremium
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-600 text-white"
                  }`}>
                    {isPremium ? "Premium Course" : "Free Class"}
                  </span>

                  <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-black ${
                    course.published
                      ? "bg-leaf/90 text-white"
                      : "bg-amber-400/90 text-white"
                  }`}>
                    {course.published ? "Published" : "Draft"}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 p-4 gap-3">
                  <div className="flex-1">
                    <h3 className="font-black text-forest dark:text-cream leading-tight line-clamp-2">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="mt-1 text-xs text-ink/55 dark:text-cream/55 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-forest dark:text-cream">
                      {course.price_inr > 0 ? formatCurrency(course.price_inr) : <span className="text-leaf">FREE</span>}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-ink/50 dark:text-cream/50 font-semibold">
                      {isBunny ? (
                        <span className="text-amber-500 font-bold">🐰 Bunny Video Attached</span>
                      ) : course.youtube_url ? (
                        <span>📹 YouTube Link</span>
                      ) : null}
                      {course.pdf_url && <span>📄 PDF</span>}
                    </div>
                  </div>

                  {/* Edit button */}
                  <EditCourseModal
                    course={{
                      id: course.id,
                      slug: course.slug,
                      title: course.title,
                      youtubeUrl: course.youtube_url ?? "",
                      bunnyVideoId: course.bunny_video_id ?? "",
                      pdfUrl: course.pdf_url ?? "",
                      price: course.price_inr,
                      published: course.published ?? true,
                      thumbnailUrl: course.thumbnail_url ?? "",
                      description: course.description ?? "",
                      sortOrder: course.sort_order ?? 999,
                    }}
                    onDone={() => {}}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function extractYtId(url: string) {
  return url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? url.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1]
    ?? url.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? url;
}
