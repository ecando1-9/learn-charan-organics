"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { CourseCard } from "@/components/course/course-card";
import type { Course } from "@/lib/types";

export function CourseFilters({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const categories = useMemo(() => Array.from(new Set(courses.map((course) => course.category))).sort(), [courses]);

  const filtered = useMemo(() => courses.filter((course) => {
    const matchesQuery = course.title.toLowerCase().includes(query.toLowerCase()) || course.category.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All" || course.category === category;
    const matchesLevel = level === "All" || course.level === level;
    return matchesQuery && matchesCategory && matchesLevel;
  }), [query, category, level]);

  return (
    <div>
      <div className="glass sticky top-20 z-20 grid gap-3 rounded-[1.75rem] p-3 md:grid-cols-[1fr_220px_220px]">
        <label className="flex min-h-12 items-center gap-3 rounded-full bg-white px-4 dark:bg-white/10">
          <Search size={18} className="text-leaf" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses, categories, instructors" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-12 rounded-full border-0 bg-white px-4 text-sm font-semibold outline-none dark:bg-white/10">
          <option>All</option>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={level} onChange={(event) => setLevel(event.target.value)} className="min-h-12 rounded-full border-0 bg-white px-4 text-sm font-semibold outline-none dark:bg-white/10">
          {["All", "Beginner", "Intermediate", "Advanced"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-ink/60 dark:text-cream/60"><SlidersHorizontal size={18} /> {filtered.length} courses found</div>
      {filtered.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => <CourseCard key={course.slug} course={course} />)}
        </div>
      ) : (
        <div className="mt-6 rounded-[2rem] bg-white p-8 text-center shadow-soft dark:bg-white/5">
          <h2 className="text-xl font-black text-forest dark:text-cream">No courses published yet</h2>
          <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Courses added from the admin panel will appear here.</p>
        </div>
      )}
    </div>
  );
}
