import { CourseCard } from "@/components/course/course-card";
import { getPublishedCourses, getUserEnrolledCourseIds } from "@/lib/course-data";

export default async function MyCoursesPage() {
  const [allCourses, enrolledIds] = await Promise.all([
    getPublishedCourses(),
    getUserEnrolledCourseIds(),
  ]);

  // Only show courses the current user is actually enrolled in
  const enrolledIdSet = new Set(enrolledIds);
  const myCourses = allCourses.filter((course) => course.id && enrolledIdSet.has(course.id));

  return (
    <div>
      <h1 className="text-3xl font-black text-forest dark:text-cream">My Courses</h1>

      {myCourses.length ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {myCourses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[2rem] bg-white p-10 text-center shadow-soft dark:bg-white/5">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-xl font-black text-forest dark:text-cream">No enrolled courses yet</h2>
          <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">
            You haven&apos;t enrolled in any courses yet. Browse our courses and start learning!
          </p>
          <a
            href="/courses"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-bold text-cream hover:bg-leaf transition"
          >
            Browse Courses
          </a>
        </div>
      )}
    </div>
  );
}
