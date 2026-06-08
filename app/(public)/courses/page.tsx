import type { Metadata } from "next";
import { CourseFilters } from "@/components/course/course-filters";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "All Courses",
  description: "Browse organic product making courses by category, language, level and popularity."
};

export default function CoursesPage() {
  return (
    <Section className="pb-24">
      <div className="max-w-3xl">
        <p className="font-bold uppercase tracking-[0.18em] text-leaf">Course Catalog</p>
        <h1 className="mt-2 text-4xl font-black text-forest dark:text-cream sm:text-5xl">Find the right natural product course.</h1>
      </div>
      <div className="mt-8"><CourseFilters /></div>
    </Section>
  );
}
