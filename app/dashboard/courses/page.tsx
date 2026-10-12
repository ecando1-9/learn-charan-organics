import { MyLearningView } from "@/components/dashboard/my-learning-view";
import { getPublishedCourses, getUserEnrolledCourseIds } from "@/lib/course-data";
import { getUserEnrolledCoursesWithProgress } from "@/app/actions/progress";

export default async function MyCoursesPage() {
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
    />
  );
}
