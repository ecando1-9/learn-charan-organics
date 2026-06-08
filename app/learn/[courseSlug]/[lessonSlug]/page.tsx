import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/course/video-player";
import { courses } from "@/lib/data";

export default async function LearnPage({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params;
  const course = courses.find((item) => item.slug === courseSlug);
  const lesson = course?.modules.flatMap((module) => module.lessons).find((item) => item.slug === lessonSlug);
  if (!course || !lesson) notFound();
  return <VideoPlayer course={course} lesson={lesson} />;
}
