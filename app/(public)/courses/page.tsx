import type { Metadata } from "next";
import { CourseFilters } from "@/components/course/course-filters";
import { Section } from "@/components/ui/section";
import { getPublishedCourses, getUserEnrolledCourseIds, getUserPendingCourseData } from "@/lib/course-data";

export const metadata: Metadata = {
  title: "All Courses",
  description: "Browse organic product making courses by category, language, level and popularity."
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const [courses, enrolledIds, pendingData] = await Promise.all([
    getPublishedCourses(),
    getUserEnrolledCourseIds(),
    getUserPendingCourseData(),
  ]);

  const enrolledIdSet = new Set(enrolledIds);
  const pendingIdSet = new Set(pendingData.pendingCourseIds);

  const coursesWithEnrollmentStatus = courses.map((course) => {
    const isEnrolled = Boolean(course.id && enrolledIdSet.has(course.id));
    const isPending =
      !isEnrolled &&
      Boolean(
        pendingData.allCoursesPending ||
          (course.id && pendingIdSet.has(course.id)) ||
          pendingData.pendingRequests.some(
            (r) =>
              typeof r.course_title === "string" &&
              r.course_title.toLowerCase().includes(course.title.toLowerCase())
          )
      );

    const matchingPending = isPending
      ? pendingData.pendingRequests.find(
          (r) =>
            r.selected_all ||
            (course.id && Array.isArray(r.course_ids) && r.course_ids.includes(course.id)) ||
            (typeof r.course_title === "string" &&
              r.course_title.toLowerCase().includes(course.title.toLowerCase()))
        )
      : null;

    return {
      ...course,
      isEnrolled,
      isPending,
      pendingUtr: matchingPending?.utr_number || null,
    };
  });

  return (
    <Section className="pb-24">
      <div className="max-w-3xl">
        <p className="font-bold uppercase tracking-[0.18em] text-leaf">Course Catalog</p>
        <h1 className="mt-2 text-4xl font-black text-forest dark:text-cream sm:text-5xl">
          Find the right natural product course.
        </h1>
      </div>
      <div className="mt-8">
        <CourseFilters courses={coursesWithEnrollmentStatus} />
      </div>
    </Section>
  );
}
