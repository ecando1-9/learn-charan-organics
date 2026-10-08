import { notFound, redirect } from "next/navigation";
import { VideoPlayer } from "@/components/course/video-player";
import { getCourseBySlug } from "@/lib/course-data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LearnPage({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params;
  const supabase = await createClient();

  const course = await getCourseBySlug(courseSlug, true);
  if (!course) notFound();

  let lesson = course.modules.flatMap((m) => m.lessons).find((l) => l.slug === lessonSlug);
  if (!lesson) {
    lesson = course.modules[0]?.lessons[0];
  }
  if (!lesson) notFound();

  // A class is FREE if course price is 0 OR if the lesson is marked as a free preview
  const isFree = course.price === 0 || lesson.is_preview === true;

  // Paid, non-preview lessons require login + active enrollment (or admin status)
  if (!isFree) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect(`/login?redirectTo=/learn/${courseSlug}/${lessonSlug}`);
    }

    if (course.id) {
      const { data: enrollment } = await supabase
        .from("lms_enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .eq("status", "active")
        .maybeSingle();

      if (!enrollment) {
        // Check if admin (admins can always view any lesson)
        const { data: profile } = await supabase
          .from("lms_profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role !== "admin") {
          redirect("/unauthorized");
        }
      }
    }
  }

  // If video not linked yet — show a friendly message
  if (!lesson.videoId && !lesson.bunnyVideoId) {
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
