"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Sparkles, Star, BookOpen } from "lucide-react";
import { CourseCarousel } from "@/components/home/course-carousel";
import { Button } from "@/components/ui/button";
import type { Course } from "@/lib/types";

export function HomeCourseTabs({ courses }: { courses: Course[] }) {
  const [activeTab, setActiveTab] = useState<"recent" | "featured" | "trending">("recent");

  // Collection 1: Recently Added (sorted by createdAt descending or newest)
  const recentlyAdded = useMemo(() => {
    return [...courses]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10);
  }, [courses]);

  // Collection 2: Featured Courses (course.featured === true or fallback top entries)
  const featuredCourses = useMemo(() => {
    const featured = courses.filter((c) => c.featured);
    return featured.length > 0 ? featured.slice(0, 10) : courses.slice(0, 10);
  }, [courses]);

  // Collection 3: Trending Courses (popular premium formulation courses)
  const trendingCourses = useMemo(() => {
    const trending = courses.filter((c) => c.price > 0);
    return trending.length > 0 ? trending.slice(0, 10) : courses.slice(0, 10);
  }, [courses]);

  const currentDisplayCourses =
    activeTab === "recent"
      ? recentlyAdded
      : activeTab === "featured"
      ? featuredCourses
      : trendingCourses;

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header & Tab Controls */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between border-b border-forest/10 dark:border-white/10 pb-6">
          <div>
            <p className="font-bold uppercase tracking-[0.18em] text-leaf text-xs sm:text-sm">
              Explore Our Catalog
            </p>
            <h2 className="mt-1 text-2xl font-black text-forest dark:text-cream sm:text-4xl">
              Formulation Courses for You
            </h2>
          </div>

          {/* Interactive 3-Tab Filter Pill */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-white/5 border border-forest/10 dark:border-white/10 shadow-sm">
            <button
              onClick={() => setActiveTab("recent")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "recent"
                  ? "bg-emerald-600 text-white shadow-md scale-105"
                  : "text-ink/65 dark:text-cream/65 hover:text-emerald-600 dark:hover:text-cream"
              }`}
            >
              <Sparkles size={15} />
              <span>Recently Added</span>
              <span className="rounded-full bg-white/20 text-[10px] px-1.5 py-0.5">
                {recentlyAdded.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("featured")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "featured"
                  ? "bg-amber-500 text-white shadow-md scale-105"
                  : "text-ink/65 dark:text-cream/65 hover:text-amber-500"
              }`}
            >
              <Star size={15} />
              <span>Featured</span>
              <span className="rounded-full bg-white/20 text-[10px] px-1.5 py-0.5">
                {featuredCourses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("trending")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "trending"
                  ? "bg-flame text-white bg-orange-600 shadow-md scale-105"
                  : "text-ink/65 dark:text-cream/65 hover:text-orange-500"
              }`}
            >
              <Flame size={15} />
              <span>Trending</span>
              <span className="rounded-full bg-white/20 text-[10px] px-1.5 py-0.5">
                {trendingCourses.length}
              </span>
            </button>
          </div>
        </div>

        {/* Course Carousel Display */}
        {currentDisplayCourses.length > 0 ? (
          <div className="animate-in fade-in duration-300">
            <CourseCarousel courses={currentDisplayCourses} />
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white p-12 text-center shadow-soft dark:bg-white/5">
            <BookOpen className="mx-auto mb-4 text-leaf" size={40} />
            <h3 className="text-2xl font-black text-forest dark:text-cream">No courses in this category yet</h3>
            <p className="mt-2 text-ink/60 dark:text-cream/60">New courses published by admin will appear here automatically.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <Link href="/courses">
            <Button className="bg-leaf hover:bg-forest text-white font-bold px-8 py-3.5 rounded-full shadow-md text-sm sm:text-base transition-transform hover:scale-105">
              View Full Catalog <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
