import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/course/video-player";
import { getCourseBySlug } from "@/lib/course-data";

export const dynamic = "force-dynamic";

export default async function LearnPage({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params;
  const course = await getCourseBySlug(courseSlug, true);
  const lesson = course?.modules.flatMap((module) => module.lessons).find((item) => item.slug === lessonSlug);
  if (!course || !lesson || !lesson.videoId) notFound();
  return <VideoPlayer course={course} lesson={lesson} />;
}
