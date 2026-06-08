import { courses } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export function CourseManagementTable() {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft dark:bg-white/5">
      <div className="hidden grid-cols-[1.2fr_0.8fr_0.5fr_0.5fr_0.5fr] gap-4 border-b border-forest/10 p-4 text-xs font-black uppercase tracking-[0.14em] text-ink/50 md:grid dark:border-white/10 dark:text-cream/50">
        <span>Course</span><span>Category</span><span>Price</span><span>Status</span><span>Lessons</span>
      </div>
      {courses.map((course) => <div key={course.slug} className="grid gap-3 border-b border-forest/10 p-4 last:border-b-0 md:grid-cols-[1.2fr_0.8fr_0.5fr_0.5fr_0.5fr] md:items-center dark:border-white/10"><div><h3 className="font-black text-forest dark:text-cream">{course.title}</h3><p className="text-sm text-ink/55 dark:text-cream/55">Instructor: {course.instructor}</p></div><span className="text-sm font-semibold">{course.category}</span><span className="text-sm font-bold">{formatCurrency(course.price)}</span><span className="w-fit rounded-full bg-leaf/10 px-3 py-1 text-xs font-black text-leaf">Published</span><span className="text-sm font-bold">{course.modules.flatMap((m) => m.lessons).length}</span></div>)}
    </div>
  );
}
