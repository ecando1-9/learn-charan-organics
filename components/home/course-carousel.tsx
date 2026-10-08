"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CourseCard } from "@/components/course/course-card";
import type { Course } from "@/lib/types";

export function CourseCarousel({ courses }: { courses: Course[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }

  if (courses.length === 0) return null;

  return (
    <div className="relative group">
      {/* Left Arrow Button (Desktop) */}
      <button
        onClick={() => scroll("left")}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 hidden lg:grid size-11 place-items-center rounded-full bg-white dark:bg-[#202c33] text-gray-800 dark:text-cream shadow-xl border border-gray-200 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        aria-label="Scroll left"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Right Arrow Button (Desktop) */}
      <button
        onClick={() => scroll("right")}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 hidden lg:grid size-11 place-items-center rounded-full bg-white dark:bg-[#202c33] text-gray-800 dark:text-cream shadow-xl border border-gray-200 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        aria-label="Scroll right"
      >
        <ChevronRight size={22} />
      </button>

      {/* Horizontal Swiper Track */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-3 px-1 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {courses.map((course) => (
          <div
            key={course.slug}
            className="w-[72vw] sm:w-[280px] md:w-[320px] lg:w-[360px] shrink-0 snap-start"
          >
            <CourseCard course={course} />
          </div>
        ))}
      </div>

      {/* Mobile Swipe Hint Indicator */}
      <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-cream/40 sm:hidden">
        <span>👈 Swipe left & right to view more 👉</span>
      </div>
    </div>
  );
}
