"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UserCourseProgress = {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string | null;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  eligibleForCertificate: boolean;
  enrolledAt: string;
};

export async function toggleLessonCompletion(courseId: string, lessonId: string, completed: boolean) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    if (completed) {
      const { error } = await supabase.from("lms_progress").upsert({
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,
        video_watched_percent: 100,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,lesson_id" });

      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("lms_progress").delete()
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);

      if (error) return { error: error.message };
    }

    revalidatePath("/dashboard/certificates");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update progress" };
  }
}

export async function getUserEnrolledCoursesWithProgress(): Promise<{
  data: UserCourseProgress[];
  userName: string;
  userEmail: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], userName: "", userEmail: "", error: "Not authenticated" };
    }

    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Student";
    const userEmail = user.email || "";

    // 1. Fetch active enrollments
    const { data: enrollments } = await supabase
      .from("lms_enrollments")
      .select("course_id, enrolled_at")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (!enrollments || enrollments.length === 0) {
      return { data: [], userName, userEmail };
    }

    const courseIds = enrollments.map((e) => e.course_id);

    // 2. Fetch course info (only published courses)
    const { data: courses } = await supabase
      .from("lms_courses")
      .select("id, title, slug, thumbnail_url, youtube_url, published")
      .in("id", courseIds);

    if (!courses || courses.length === 0) {
      return { data: [], userName, userEmail };
    }

    // Filter out hidden / unpublished courses
    const publishedCourses = courses.filter((c: any) => c.published !== false);

    if (publishedCourses.length === 0) {
      return { data: [], userName, userEmail };
    }

    const publishedCourseIds = publishedCourses.map((c) => c.id);

    // 3. Fetch modules and lessons
    const { data: modules } = await supabase
      .from("lms_modules")
      .select("id, course_id")
      .in("course_id", publishedCourseIds);

    const moduleIds = (modules ?? []).map((m) => m.id);

    const { data: lessons } = moduleIds.length > 0
      ? await supabase.from("lms_lessons").select("id, module_id").in("module_id", moduleIds)
      : { data: [] };

    // Group lessons count by courseId
    const lessonsByCourse = new Map<string, string[]>();
    (modules ?? []).forEach((mod) => {
      const modLessons = (lessons ?? []).filter((l) => l.module_id === mod.id).map((l) => l.id);
      const existing = lessonsByCourse.get(mod.course_id) ?? [];
      lessonsByCourse.set(mod.course_id, [...existing, ...modLessons]);
    });

    // 4. Fetch user's completed lessons in lms_progress
    const { data: progressRows } = await supabase
      .from("lms_progress")
      .select("course_id, lesson_id, completed")
      .eq("user_id", user.id)
      .eq("completed", true);

    const completedByCourse = new Map<string, Set<string>>();
    (progressRows ?? []).forEach((row) => {
      if (row.course_id && row.lesson_id) {
        const set = completedByCourse.get(row.course_id) ?? new Set();
        set.add(row.lesson_id);
        completedByCourse.set(row.course_id, set);
      }
    });

    const result: UserCourseProgress[] = publishedCourses.map((c) => {
      const enrollment = enrollments.find((e) => e.course_id === c.id);
      const courseLessonIds = lessonsByCourse.get(c.id) ?? [];
      const totalLessons = courseLessonIds.length > 0 ? courseLessonIds.length : 1;
      const completedSet = completedByCourse.get(c.id) ?? new Set();
      const completedCount = completedSet.size;

      let pct = Math.round((completedCount / totalLessons) * 100);
      if (pct > 100) pct = 100;

      const thumb = c.thumbnail_url || (c.youtube_url ? `https://img.youtube.com/vi/${extractYtId(c.youtube_url)}/hqdefault.jpg` : null);

      return {
        courseId: c.id,
        courseTitle: c.title,
        courseSlug: c.slug,
        thumbnailUrl: thumb,
        totalLessons,
        completedLessons: completedCount,
        completionPercentage: pct,
        eligibleForCertificate: pct >= 70,
        enrolledAt: enrollment?.enrolled_at || new Date().toISOString(),
      };
    });

    return { data: result, userName, userEmail };
  } catch (err: any) {
    return { data: [], userName: "", userEmail: "", error: err.message };
  }
}

function extractYtId(url: string) {
  return url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? url.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1]
    ?? url;
}
