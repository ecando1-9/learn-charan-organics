import { MyLearningView } from "@/components/dashboard/my-learning-view";
import { getPublishedCourses, getUserEnrolledCourseIds } from "@/lib/course-data";
import { getUserEnrolledCoursesWithProgress } from "@/app/actions/progress";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function MyCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let pendingRequests: any[] = [];
  if (user) {
    try {
      const admin = createAdminClient();
      const { data: reqs } = await admin
        .from("lms_enrollment_requests")
        .select("id, status, course_title, amount_inr, requested_at, utr_number")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("requested_at", { ascending: false });
      pendingRequests = reqs || [];
    } catch {
      // ignore
    }
  }

  const [allCourses, enrolledIds, progressRes] = await Promise.all([
    getPublishedCourses(),
    getUserEnrolledCourseIds(),
    getUserEnrolledCoursesWithProgress(),
  ]);

  const enrolledIdSet = new Set(enrolledIds);

  const enrolledCourses = allCourses
    .filter((course) => course.id && enrolledIdSet.has(course.id))
    .map((course) => ({
      ...course,
      isEnrolled: true,
      isPremium: true,
    }));

  const freeCourses = allCourses
    .filter((course) => course.price === 0 || Boolean(course.isFree))
    .map((course) => ({
      ...course,
      isEnrolled: false,
      isFree: true,
    }));

  return (
    <MyLearningView
      enrolledCourses={enrolledCourses}
      freeCourses={freeCourses}
      progressList={progressRes.data || []}
      pendingRequests={pendingRequests}
    />
  );
}
