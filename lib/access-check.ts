import { createClient } from "@/lib/supabase/server";

export type UserAccessResult = 
  | { hasAccess: true; userId?: string; role?: string }
  | { hasAccess: false; error: "unauthenticated" | "unauthorized" | "not_found"; message: string };

/**
 * Validates whether a user has access to a specific course.
 * - Free courses (is_free = true or price_inr = 0): Granted to everyone.
 * - Paid courses: Granted only if user is logged in AND has an active enrollment (or admin status).
 * @param courseSlug The course slug to check access for.
 * @returns An object indicating access permission and metadata.
 */
export async function validateUserCourseAccess(courseSlug: string): Promise<UserAccessResult> {
  const supabase = await createClient();

  // 1. Fetch course details to check if free or paid
  const { data: course, error: courseError } = await supabase
    .from("lms_courses")
    .select("id, price_inr, is_free")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (courseError || !course) {
    return {
      hasAccess: false,
      error: "not_found",
      message: "The requested course was not found.",
    };
  }

  const isFree = course.is_free === true || Number(course.price_inr ?? 0) === 0;

  // Free courses are accessible to everyone (no login or enrollment required)
  if (isFree) {
    const { data: { user } } = await supabase.auth.getUser();
    return { hasAccess: true, userId: user?.id, role: "student" };
  }

  // 2. Paid courses require an authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      hasAccess: false,
      error: "unauthenticated",
      message: "You must be logged in to access this premium content.",
    };
  }

  // 3. Check for admin status
  const { data: profile } = await supabase
    .from("lms_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "student";
  if (role === "admin") {
    return { hasAccess: true, userId: user.id, role };
  }

  // 4. Check for active enrollment
  const { data: enrollment, error: enrollError } = await supabase
    .from("lms_enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("status", "active")
    .maybeSingle();

  if (enrollError || !enrollment) {
    return {
      hasAccess: false,
      error: "unauthorized",
      message: "You are not enrolled in this premium course.",
    };
  }

  return { hasAccess: true, userId: user.id, role };
}
