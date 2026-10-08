import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { courseSlug, lessonSlug, videoType, watchDurationSeconds, completed } = body;

    if (!courseSlug || !lessonSlug) {
      return NextResponse.json({ error: "courseSlug and lessonSlug are required." }, { status: 400 });
    }

    // Lookup course & lesson IDs
    const { data: course } = await supabase
      .from("lms_courses")
      .select("id")
      .eq("slug", courseSlug)
      .maybeSingle();

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    const { data: modules } = await supabase
      .from("lms_modules")
      .select("id")
      .eq("course_id", course.id);

    const moduleIds = (modules ?? []).map((m) => m.id);

    const { data: lesson } = await supabase
      .from("lms_lessons")
      .select("id")
      .eq("slug", lessonSlug)
      .in("module_id", moduleIds.length ? moduleIds : ["00000000-0000-0000-0000-000000000000"])
      .limit(1)
      .maybeSingle();

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    }

    const currentHour = new Date().getHours(); // 0 to 23
    const todayDate = new Date().toISOString().split("T")[0];

    const { error: insertErr } = await supabase.from("lms_video_watch_logs").insert({
      user_id: user.id,
      course_id: course.id,
      lesson_id: lesson.id,
      video_type: videoType === "bunny" ? "bunny" : "youtube",
      watch_duration_seconds: Math.max(0, Number(watchDurationSeconds) || 15),
      watch_date: todayDate,
      watch_hour: currentHour,
      completed: Boolean(completed),
    });

    if (insertErr) {
      console.error("Error logging watch event:", insertErr.message);
    }

    // Also update lms_progress
    if (completed) {
      await supabase.from("lms_progress").upsert({
        user_id: user.id,
        course_id: course.id,
        lesson_id: lesson.id,
        video_watched_percent: 100,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: "user_id,lesson_id" });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
