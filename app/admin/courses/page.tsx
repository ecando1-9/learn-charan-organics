import { getPublishedCourses } from "@/lib/course-data";
import { CourseManagementTable } from "@/components/admin/admin-table";
import { AddCourseModal } from "@/components/admin/course-create-form";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-forest dark:text-cream">Course Management</h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
            Create, edit, publish and manage course videos and PDFs.
          </p>
        </div>
        <AddCourseModal />
      </div>
      <CourseManagementTable courses={courses} />
    </div>
  );
}
