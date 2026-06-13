import { Plus } from "lucide-react";
import { CourseManagementTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { CourseCreateForm } from "@/components/admin/course-create-form";
import { getPublishedCourses } from "@/lib/course-data";

export default async function AdminCoursesPage() {
  const courses = await getPublishedCourses();

  return <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-black text-forest dark:text-cream">Course Management</h1><p className="text-sm text-ink/60 dark:text-cream/60">Create, edit, publish, price and organize course videos and PDFs.</p></div><Button><Plus size={18} /> New course</Button></div><div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]"><CourseCreateForm /><CourseManagementTable courses={courses} /></div></div>;
}
