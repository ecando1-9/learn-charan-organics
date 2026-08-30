import { createClient } from "@/lib/supabase/server";

export type UserAccessResult = 
  | { hasAccess: true; userId: string; role: string }
  | { hasAccess: false; error: "unauthenticated" | "unauthorized" | "not_found"; message: string };

/**
 * Validates whether a user has access to a specific course (either active enrollment or admin status).
 * @param courseSlug The course slug to check access for.
 * @returns An object indicating access permission and metadata.
 */
export async function validateUserCourseAccess(courseSlug: string): Promise<UserAccessResult> {
  const supabase = await createClient();

  // 1. Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      hasAccess: false,
      error: "unauthenticated",
      message: "You must be logged in to access this content.",
    };
  }

  // 2. Fetch the user's role (admin check)
  const { data: profile } = await supabase
    .from("lms_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "student";
  if (role === "admin") {
    return { hasAccess: true, userId: user.id, role };
  }

  // 3. Find the course ID by slug
  const { data: course, error: courseError } = await supabase
    .from("lms_courses")
    .select("id")
    .eq("slug", courseSlug)
    .single();

  if (courseError || !course) {
    return {
      hasAccess: false,
      error: "not_found",
      message: "The requested course was not found.",
    };
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
      message: "You are not enrolled in this course.",
    };
  }

  return { hasAccess: true, userId: user.id, role };
}
