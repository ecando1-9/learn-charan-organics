"use client";

import { formatCurrency } from "@/lib/utils";
import type { AdminCourse } from "@/app/admin/courses/page";
import { EditCourseModal } from "@/components/admin/course-create-form";
import { ImageOff } from "lucide-react";

export function AdminCoursesTable({ courses }: { courses: AdminCourse[] }) {
  if (!courses.length) {
    return (
      <div className="rounded-[2rem] bg-white dark:bg-white/5 shadow-soft p-10 text-center">
        <p className="text-sm font-semibold text-ink/60 dark:text-cream/60">
          No courses yet. Add the first course using the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const thumb = course.thumbnail_url
          || (course.youtube_url
            ? `https://img.youtube.com/vi/${extractYtId(course.youtube_url)}/hqdefault.jpg`
            : null);

        return (
          <div
            key={course.id}
            className="rounded-[2rem] bg-white dark:bg-white/5 shadow-soft overflow-hidden flex flex-col"
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
                  {formatCurrency(course.price_inr)}
                </span>
                <div className="flex gap-2 text-xs text-ink/40 dark:text-cream/40">
                  {course.youtube_url && <span>📹 Video</span>}
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
                  pdfUrl: course.pdf_url ?? "",
                  price: course.price_inr,
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
  );
}

function extractYtId(url: string) {
  return url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? url.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1]
    ?? url.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? url;
}
