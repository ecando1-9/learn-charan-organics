import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateUserCourseAccess } from "@/lib/access-check";
import { generateSignedVideoUrl } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const courseSlug = searchParams.get("courseSlug");
  const lessonSlug = searchParams.get("lessonSlug");

  if (!courseSlug || !lessonSlug) {
    return NextResponse.json(
      { error: "Missing parameters: courseSlug and lessonSlug are required." },
      { status: 400 }
    );
  }

  // 1. Validate user access (Auth + Purchase/Premium check)
  const access = await validateUserCourseAccess(courseSlug);
  if (!access.hasAccess) {
    const status = access.error === "unauthenticated" ? 401 : 403;
    return NextResponse.json({ error: access.message }, { status });
  }

  const supabase = await createClient();

  // 2. Fetch the course
  const { data: course, error: courseError } = await supabase
    .from("lms_courses")
    .select("id")
    .eq("slug", courseSlug)
    .single();

  if (courseError || !course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  // 3. Fetch module IDs for this course
  const { data: modules, error: modulesError } = await supabase
    .from("lms_modules")
    .select("id")
    .eq("course_id", course.id);

  if (modulesError) {
    return NextResponse.json({ error: "Failed to load modules." }, { status: 500 });
  }

  const moduleIds = (modules ?? []).map((m) => m.id);
  if (moduleIds.length === 0) {
    return NextResponse.json({ error: "Lesson not found in this course." }, { status: 404 });
  }

  // 4. Fetch the lesson
  const { data: lesson, error: lessonError } = await supabase
    .from("lms_lessons")
    .select("id, title")
    .eq("slug", lessonSlug)
    .in("module_id", moduleIds)
    .maybeSingle();

  if (lessonError || !lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  // 5. Fetch video details
  const { data: video, error: videoError } = await supabase
    .from("lms_videos")
    .select("youtube_video_id, cloudinary_public_id, bunny_video_id, bunny_library_id")
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  if (videoError) {
    return NextResponse.json({ error: "Failed to load video details." }, { status: 500 });
  }

  if (!video) {
    return NextResponse.json({ error: "Video not yet uploaded for this lesson." }, { status: 404 });
  }

  // Check if Bunny Stream is available
  if (video.bunny_video_id) {
    return NextResponse.json({
      type: "bunny",
      bunnyVideoId: video.bunny_video_id,
      bunnyLibraryId: video.bunny_library_id,
    });
  }

  // Check if Cloudinary public ID is available
  // If so, generate signed delivery URL (URL expires in 1 hour / 3600 seconds)
  if (video.cloudinary_public_id) {
    try {
      const signedUrl = generateSignedVideoUrl(video.cloudinary_public_id, 3600);
      return NextResponse.json({
        type: "cloudinary",
        videoUrl: signedUrl,
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: "Error generating signed video URL: " + err.message },
        { status: 500 }
      );
    }
  }

  // Fallback to YouTube ID
  if (video.youtube_video_id) {
    return NextResponse.json({
      type: "youtube",
      youtubeVideoId: video.youtube_video_id,
    });
  }

  return NextResponse.json({ error: "No video source available." }, { status: 404 });
}
