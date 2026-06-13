import { CourseCard } from "@/components/course/course-card";
import { getPublishedCourses } from "@/lib/course-data";

export default async function MyCoursesPage() {
  const courses = await getPublishedCourses();

  return <div><h1 className="text-3xl font-black text-forest dark:text-cream">My Courses</h1>{courses.length ? <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{courses.slice(0, 3).map((course) => <CourseCard key={course.slug} course={course} />)}</div> : <div className="mt-6 rounded-[2rem] bg-white p-6 text-sm font-semibold text-ink/60 shadow-soft dark:bg-white/5 dark:text-cream/60">No enrolled/published courses are available yet.</div>}</div>;
}
