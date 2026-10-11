"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("lms_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return { error: "Not authorized" };
  return { admin };
}

export async function toggleCourseVisibility(courseId: string, published: boolean) {
  try {
    const check = await requireAdmin();
    if ("error" in check) return { error: check.error };
    const { admin } = check;

    const { error } = await admin
      .from("lms_courses")
      .update({ published, updated_at: new Date().toISOString() })
      .eq("id", courseId);

    if (error) return { error: error.message };

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/courses");
    revalidatePath("/dashboard/certificates");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update course visibility" };
  }
}

export async function bulkUpdateCourseVisibility(courseIds: string[], published: boolean) {
  try {
    const check = await requireAdmin();
    if ("error" in check) return { error: check.error };
    const { admin } = check;

    if (courseIds.length === 0) return { success: true };

    const { error } = await admin
      .from("lms_courses")
      .update({ published, updated_at: new Date().toISOString() })
      .in("id", courseIds);

    if (error) return { error: error.message };

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/courses");
    revalidatePath("/dashboard/certificates");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to bulk update courses" };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    const check = await requireAdmin();
    if ("error" in check) return { error: check.error };
    const { admin } = check;

    const { error } = await admin
      .from("lms_courses")
      .delete()
      .eq("id", courseId);

    if (error) return { error: error.message };

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/courses");
    revalidatePath("/dashboard/certificates");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete course" };
  }
}

export async function bulkDeleteCourses(courseIds: string[]) {
  try {
    const check = await requireAdmin();
    if ("error" in check) return { error: check.error };
    const { admin } = check;

    if (courseIds.length === 0) return { success: true };

    const { error } = await admin
      .from("lms_courses")
      .delete()
      .in("id", courseIds);

    if (error) return { error: error.message };

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/courses");
    revalidatePath("/dashboard/certificates");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to bulk delete courses" };
  }
}
