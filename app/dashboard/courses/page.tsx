import { CourseCard } from "@/components/course/course-card";
import { courses } from "@/lib/data";

export default function MyCoursesPage() {
  return <div><h1 className="text-3xl font-black text-forest dark:text-cream">My Courses</h1><div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{courses.slice(0, 3).map((course) => <CourseCard key={course.slug} course={course} />)}</div></div>;
}
