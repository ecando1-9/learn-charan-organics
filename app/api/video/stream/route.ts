import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateUserCourseAccess } from "@/lib/access-check";
import { rateLimit, getIP } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function youtubeIdFromUrl(url: string | null | undefined): string {
  if (!url) return "";
  return (
    url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1] ??
    url.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1] ??
    url.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1] ??
    url
  );
}

export async function GET(req: NextRequest) {
  // Rate limit: max 30 requests/min per IP
  const ip = getIP(req);
  const rl = rateLimit(ip, { maxRequests: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
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
      .select("id, youtube_url, bunny_video_id, bunny_library_id")
      .eq("slug", courseSlug)
      .maybeSingle();

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    // 3. Fetch module IDs for this course
    const { data: modules } = await supabase
      .from("lms_modules")
      .select("id")
      .eq("course_id", course.id);

    const moduleIds = (modules ?? []).map((m) => m.id);

    let video: { youtube_video_id?: string | null; bunny_video_id?: string | null; bunny_library_id?: string | null } | null = null;

    if (moduleIds.length > 0) {
      // 4. Fetch the lesson
      const { data: lesson } = await supabase
        .from("lms_lessons")
        .select("id")
        .eq("slug", lessonSlug)
        .in("module_id", moduleIds)
        .limit(1)
        .maybeSingle();

      if (lesson) {
        // 5. Fetch video details for lesson
        const { data: videoData } = await supabase
          .from("lms_videos")
          .select("youtube_video_id, bunny_video_id, bunny_library_id")
          .eq("lesson_id", lesson.id)
          .limit(1)
          .maybeSingle();

        video = videoData;
      }
    }

    // Check Bunny Stream on video or course level
    const bunnyVideoId = video?.bunny_video_id || course.bunny_video_id;
    const bunnyLibraryId = video?.bunny_library_id || course.bunny_library_id || process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

    if (bunnyVideoId) {
      return NextResponse.json({
        type: "bunny",
        bunnyVideoId,
        bunnyLibraryId,
      });
    }

    // Fallback to YouTube ID on video or course level
    const youtubeId = video?.youtube_video_id || youtubeIdFromUrl(course.youtube_url);

    if (youtubeId) {
      return NextResponse.json({
        type: "youtube",
        youtubeVideoId: youtubeId,
      });
    }

    return NextResponse.json({ error: "No video source available." }, { status: 404 });
  } catch (err: any) {
    console.error("Stream route unhandled error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
