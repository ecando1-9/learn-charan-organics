import { Award } from "lucide-react";
import { createAdminClient, getAdminClientConfigError } from "@/lib/supabase/admin";
import { AdminConfigNotice } from "@/components/admin/admin-config-notice";
import {
  AdminCertificatesClient,
  type StudentCertificateSummary,
  type StudentCourseItem,
} from "@/components/admin/admin-certificates-client";

export const dynamic = "force-dynamic";

export default async function AdminCertificatesPage() {
  const configError = getAdminClientConfigError();
  if (configError) {
    return <AdminConfigNotice message={configError} />;
  }

  const admin = createAdminClient();

  // 1. Fetch active enrollments
  const { data: rawEnrollments } = await admin
    .from("lms_enrollments")
    .select("id, user_id, course_id, enrolled_at, status")
    .order("enrolled_at", { ascending: false });

  const enrollments = (rawEnrollments ?? []).filter(
    (e: any) => !e.status || e.status === "active"
  );

  // 2. Fetch all profiles
  const { data: rawProfiles } = await admin
    .from("lms_profiles")
    .select("id, full_name, email, role, created_at");

  const profileMap = new Map((rawProfiles ?? []).map((p: any) => [p.id, p]));

  // 3. Fetch all courses
  const { data: rawCourses } = await admin
    .from("lms_courses")
    .select("id, title, slug, thumbnail_url, youtube_url, is_free, published");

  const courseMap = new Map((rawCourses ?? []).map((c: any) => [c.id, c]));

  // 4. Fetch curriculum to calculate exact lesson counts per course
  const [modulesRes, lessonsRes, progressRes] = await Promise.all([
    admin.from("lms_modules").select("id, course_id"),
    admin.from("lms_lessons").select("id, module_id"),
    admin
      .from("lms_progress")
      .select("user_id, course_id, lesson_id, completed")
      .eq("completed", true),
  ]);

  const moduleToCourse = new Map<string, string>();
  (modulesRes.data ?? []).forEach((m: any) => {
    moduleToCourse.set(m.id, m.course_id);
  });

  const courseLessonCountMap = new Map<string, number>();
  (lessonsRes.data ?? []).forEach((l: any) => {
    const courseId = moduleToCourse.get(l.module_id);
    if (courseId) {
      courseLessonCountMap.set(courseId, (courseLessonCountMap.get(courseId) ?? 0) + 1);
    }
  });

  // 5. Map completed lessons by user and course
  const userCourseCompletedMap = new Map<string, Set<string>>();
  (progressRes.data ?? []).forEach((p: any) => {
    if (!p.user_id || !p.course_id) return;
    const key = `${p.user_id}:${p.course_id}`;
    const set = userCourseCompletedMap.get(key) ?? new Set<string>();
    if (p.lesson_id) set.add(p.lesson_id);
    userCourseCompletedMap.set(key, set);
  });

  // 6. Group enrollments by student user_id
  const enrollmentsByUser = new Map<string, any[]>();
  enrollments.forEach((enroll: any) => {
    if (!enroll.user_id) return;
    const list = enrollmentsByUser.get(enroll.user_id) ?? [];
    list.push(enroll);
    enrollmentsByUser.set(enroll.user_id, list);
  });

  const students: StudentCertificateSummary[] = Array.from(enrollmentsByUser.entries()).map(
    ([userId, userEnrollments]) => {
      const profile = profileMap.get(userId);

      // Student name fallback
      let studentName = profile?.full_name?.trim();
      if (!studentName || studentName.toLowerCase() === "student") {
        if (profile?.email && profile.email.includes("@")) {
          const handle = profile.email.split("@")[0];
          studentName = handle.charAt(0).toUpperCase() + handle.slice(1);
        } else {
          studentName = `Student ${userId.slice(0, 4)}`;
        }
      }

      // Course breakdown
      const seenCourses = new Set<string>();
      const courses: StudentCourseItem[] = [];

      userEnrollments.forEach((enroll: any) => {
        if (seenCourses.has(enroll.course_id)) return;
        seenCourses.add(enroll.course_id);

        const course = courseMap.get(enroll.course_id);
        if (!course) return;

        const totalLessons = courseLessonCountMap.get(enroll.course_id) || 1;
        const completedCount =
          userCourseCompletedMap.get(`${userId}:${enroll.course_id}`)?.size ?? 0;
        const progressPercent = Math.min(
          100,
          Math.round((completedCount / totalLessons) * 100)
        );
        const isEligible = !course.is_free && progressPercent >= 70;

        courses.push({
          courseId: course.id,
          courseTitle: course.title || "Course",
          courseSlug: course.slug || "",
          thumbnailUrl: course.thumbnail_url || null,
          enrolledAt: enroll.enrolled_at || new Date().toISOString(),
          enrolledAtFormatted: new Date(enroll.enrolled_at || Date.now()).toLocaleDateString(
            "en-IN",
            { day: "numeric", month: "short", year: "numeric" }
          ),
          totalLessons,
          completedLessons: completedCount,
          progressPercent,
          isEligible,
          isFree: Boolean(course.is_free),
        });
      });

      const totalCourses = courses.length;
      const eligibleCertificates = courses.filter((c) => c.isEligible).length;
      const totalProg = courses.reduce((sum, c) => sum + c.progressPercent, 0);
      const averageProgress = totalCourses > 0 ? Math.round(totalProg / totalCourses) : 0;

      const firstEnrollDate = userEnrollments
        .map((e: any) => e.enrolled_at)
        .filter(Boolean)
        .sort()[0];
      const joinedAt = profile?.created_at || firstEnrollDate || new Date().toISOString();
      const joinedAtFormatted = new Date(joinedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return {
        userId,
        studentName,
        email: profile?.email || "Unknown Email",
        role: profile?.role || "student",
        joinedAt,
        joinedAtFormatted,
        totalCourses,
        eligibleCertificates,
        averageProgress,
        courses,
      };
    }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">
          Academic Credentials
        </p>
        <h1 className="text-3xl font-black text-forest dark:text-cream flex items-center gap-3">
          <Award className="text-amber-500" size={32} /> Certificate Management & Issuance
        </h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
          Student-centric dashboard for inspecting enrolled courses, monitoring completion thresholds (≥ 70%), and managing digital certificates.
        </p>
      </div>

      {/* Interactive Student-Centric Management Client */}
      <AdminCertificatesClient students={students} />
    </div>
  );
}
