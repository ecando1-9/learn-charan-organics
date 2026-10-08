"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import type { Course } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const fallbackThumb = "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png";

export function CourseCard({ course }: { course: Course }) {
  const isFree = course.price === 0;
  const [imgSrc, setImgSrc] = useState(course.thumbnail || fallbackThumb);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-glass ${
        course.isEnrolled
          ? "border-emerald-500/40 bg-emerald-500/5 shadow-soft dark:border-emerald-500/30 dark:bg-emerald-950/20"
          : "border-forest/10 bg-white shadow-soft dark:border-white/10 dark:bg-white/5"
      }`}
    >
      {/* Thumbnail Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={course.title}
          onError={() => setImgSrc(fallbackThumb)}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />

        {/* Category Pill */}
        <span className="absolute left-2 top-2 sm:left-3 sm:top-3 rounded-full bg-black/60 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white backdrop-blur-md truncate max-w-[60%]">
          {course.category}
        </span>

        {/* Enrolled vs Premium vs Free Badge */}
        <span
          className={`absolute right-2 top-2 sm:right-3 sm:top-3 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black backdrop-blur-md shadow-sm ${
            course.isEnrolled
              ? "bg-emerald-700 text-white border border-emerald-400/40"
              : isFree
              ? "bg-emerald-600 text-white"
              : "bg-amber-500 text-white"
          }`}
        >
          {course.isEnrolled ? "Enrolled ✅" : isFree ? "Free Class" : "Premium"}
        </span>
      </div>

      {/* Card Details */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-5 space-y-2 sm:space-y-4">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-xs sm:text-base font-black text-forest dark:text-cream leading-snug sm:leading-tight">
            {course.title}
          </h3>
          <p className="hidden sm:block text-xs text-ink/60 dark:text-cream/60 truncate">
            By {course.instructor}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-ink/65 dark:text-cream/65">
          <span className="flex items-center gap-1">
            <PlayCircle className="size-3 sm:size-4 text-leaf shrink-0" />
            <span className="truncate">1 video</span>
          </span>
          <span className="text-ink/30 dark:text-cream/30">•</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3 sm:size-4 text-leaf shrink-0" />
            <span className="truncate">{course.duration}</span>
          </span>
        </div>

        {/* Price & CTA Footer */}
        <div className="flex items-center justify-between border-t border-forest/10 dark:border-white/10 pt-2 sm:pt-4 mt-auto">
          <span className="text-xs sm:text-base font-black text-forest dark:text-cream">
            {course.isEnrolled ? (
              <span className="text-emerald-700 dark:text-emerald-400 text-xs font-black flex items-center gap-1">
                <CheckCircle2 size={13} /> Purchased
              </span>
            ) : isFree ? (
              <span className="text-leaf">FREE</span>
            ) : (
              formatCurrency(course.price)
            )}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold transition-colors ${
              course.isEnrolled
                ? "bg-emerald-600 text-white group-hover:bg-emerald-700 shadow-sm"
                : "bg-leaf/10 text-leaf group-hover:bg-leaf group-hover:text-white"
            }`}
          >
            {course.isEnrolled ? "Start Learning →" : "View"}
          </span>
        </div>
      </div>
    </Link>
  );
}
