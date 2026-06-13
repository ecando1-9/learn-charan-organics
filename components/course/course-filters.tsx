"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { CourseCard } from "@/components/course/course-card";
import type { Course } from "@/lib/types";

export function CourseFilters({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");

  const categories = useMemo(
    () => Array.from(new Set(courses.map((c) => c.category))).sort(),
    [courses]
  );

  const filtered = useMemo(
    () =>
      courses.filter((course) => {
        const matchesQuery =
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          course.category.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === "All" || course.category === category;
        const matchesLevel = level === "All" || course.level === level;
        return matchesQuery && matchesCategory && matchesLevel;
      }),
    [query, category, level, courses]
  );

  const hasFilters = query || category !== "All" || level !== "All";

  function clearAll() {
    setQuery("");
    setCategory("All");
    setLevel("All");
  }

  return (
    <div>
      {/* ── Filter bar ── */}
      <div className="sticky top-[4.5rem] z-20">
        <div className="
          flex flex-col gap-2 sm:flex-row sm:items-center
          rounded-2xl
          border border-forest/10 dark:border-white/10
          bg-white/80 dark:bg-white/[0.05]
          backdrop-blur-xl
          shadow-[0_2px_16px_0_rgba(0,0,0,0.07)]
          dark:shadow-[0_2px_16px_0_rgba(0,0,0,0.25)]
          p-2
        ">
          {/* Search input */}
          <label className="
            group flex flex-1 items-center gap-2.5
            rounded-xl
            bg-forest/[0.04] dark:bg-white/[0.06]
            border border-transparent
            px-4 py-2.5
            transition-all duration-200
            focus-within:border-leaf/40 focus-within:bg-white dark:focus-within:bg-white/10
            focus-within:shadow-[0_0_0_3px_rgba(74,163,96,0.12)]
            cursor-text
          ">
            <Search
              size={16}
              className="shrink-0 text-leaf transition-colors group-focus-within:text-leaf"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, categories…"
              className="
                w-full bg-transparent text-sm font-medium
                text-ink dark:text-cream
                placeholder:text-ink/35 dark:placeholder:text-cream/35
                outline-none
              "
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="shrink-0 rounded-full p-0.5 text-ink/40 hover:text-ink dark:text-cream/40 dark:hover:text-cream transition"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </label>

          {/* Divider */}
          <div className="hidden sm:block w-px h-7 bg-forest/10 dark:bg-white/10 shrink-0 mx-1" />

          {/* Category filter */}
          <div className="relative flex items-center sm:w-44">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="
                w-full appearance-none
                rounded-xl
                bg-forest/[0.04] dark:bg-white/[0.06]
                border border-transparent
                pl-4 pr-9 py-2.5
                text-sm font-semibold
                text-ink dark:text-cream
                outline-none
                cursor-pointer
                transition-all duration-200
                hover:bg-forest/[0.07] dark:hover:bg-white/[0.10]
                focus:border-leaf/40 focus:bg-white dark:focus:bg-white/10
                focus:shadow-[0_0_0_3px_rgba(74,163,96,0.12)]
              "
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 text-ink/40 dark:text-cream/40"
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-7 bg-forest/10 dark:bg-white/10 shrink-0 mx-1" />

          {/* Level filter */}
          <div className="relative flex items-center sm:w-40">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="
                w-full appearance-none
                rounded-xl
                bg-forest/[0.04] dark:bg-white/[0.06]
                border border-transparent
                pl-4 pr-9 py-2.5
                text-sm font-semibold
                text-ink dark:text-cream
                outline-none
                cursor-pointer
                transition-all duration-200
                hover:bg-forest/[0.07] dark:hover:bg-white/[0.10]
                focus:border-leaf/40 focus:bg-white dark:focus:bg-white/10
                focus:shadow-[0_0_0_3px_rgba(74,163,96,0.12)]
              "
              aria-label="Filter by level"
            >
              {["All", "Beginner", "Intermediate", "Advanced"].map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All Levels" : item}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 text-ink/40 dark:text-cream/40"
            />
          </div>
        </div>
      </div>

      {/* ── Results bar ── */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink/55 dark:text-cream/55">
          <SlidersHorizontal size={15} />
          <span>
            <span className="text-forest dark:text-cream font-black">{filtered.length}</span>
            {" "}course{filtered.length !== 1 ? "s" : ""} found
          </span>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-leaf hover:text-forest dark:hover:text-cream transition"
          >
            <X size={13} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Course grid ── */}
      {filtered.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[2rem] bg-white p-10 text-center shadow-soft dark:bg-white/5">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-black text-forest dark:text-cream">No courses found</h2>
          <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">
            Try adjusting your search or filters.
          </p>
          <button onClick={clearAll} className="mt-4 text-sm font-bold text-leaf hover:underline">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
