import { createClient } from "@/lib/supabase/server";
import { AdminCoursesTable } from "@/components/admin/admin-table";
import { AddCourseModal } from "@/components/admin/course-create-form";

export const dynamic = "force-dynamic";

export type AdminCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  youtube_url: string | null;
  pdf_url: string | null;
  price_inr: number;
  published: boolean;
  created_at: string;
  sort_order: number;
};

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lms_courses")
    .select("id,slug,title,description,thumbnail_url,youtube_url,pdf_url,price_inr,published,created_at,sort_order")
    .order("sort_order", { ascending: true });

  const courses = (data ?? []) as AdminCourse[];

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
      <AdminCoursesTable courses={courses} />
    </div>
  );
}
