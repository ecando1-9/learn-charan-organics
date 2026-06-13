import { notFound, redirect } from "next/navigation";
import { VideoPlayer } from "@/components/course/video-player";
import { getCourseBySlug } from "@/lib/course-data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LearnPage({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params;
  const supabase = await createClient();

  // Must be logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirectTo=/learn/${courseSlug}/${lessonSlug}`);

  const course = await getCourseBySlug(courseSlug, true);

  // DEBUG — remove after fixing
  if (!course) {
    return <pre style={{color:"red",padding:20}}>❌ course is NULL for slug: {courseSlug}</pre>;
  }

  const lesson = course.modules.flatMap((m) => m.lessons).find((l) => l.slug === lessonSlug);

  // DEBUG — remove after fixing
  if (!lesson) {
    return (
      <pre style={{color:"orange",padding:20,whiteSpace:"pre-wrap"}}>
        ❌ lesson not found for slug: {lessonSlug}{"\n"}
        modules count: {course.modules.length}{"\n"}
        lessons found: {JSON.stringify(course.modules.flatMap(m => m.lessons.map(l => l.slug)))}{"\n"}
        course title: {course.title}
      </pre>
    );
  }

  // Check enrollment
  const { data: dbCourse } = await supabase
    .from("lms_courses")
    .select("id")
    .eq("slug", courseSlug)
    .single();

  if (dbCourse) {
    const { data: enrollment } = await supabase
      .from("lms_enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", dbCourse.id)
      .eq("status", "active")
      .maybeSingle();

    if (!enrollment) {
      // Check if admin (admins can always preview)
      const { data: profile } = await supabase
        .from("lms_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        redirect(`/courses/${courseSlug}`);
      }
    }
  }

  // If video not linked yet — show a friendly message instead of 404
  if (!lesson.videoId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07140f] text-cream">
        <div className="text-center px-6">
          <div className="text-6xl mb-6">🎬</div>
          <h1 className="text-2xl font-black">Video Coming Soon</h1>
          <p className="mt-3 text-cream/60 text-sm">
            The instructor is uploading this lesson. Check back shortly.
          </p>
          <a href={`/courses/${courseSlug}`} className="mt-6 inline-block rounded-full bg-leaf px-6 py-3 text-sm font-bold text-white hover:bg-moss transition">
            Back to course
          </a>
        </div>
      </div>
    );
  }

  return <VideoPlayer course={course} lesson={lesson} />;
}
