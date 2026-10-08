/**
 * Diagnostic script — runs the same DB queries as /api/video/stream
 * to find exactly which step causes the 500.
 *
 * Run: npx tsx scratch/debug-stream-500.ts
 */
import * as fs from "fs";
import * as path from "path";

// Manually load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] = val;
  }
  console.log("Loaded .env.local");
} else {
  console.warn("WARNING: .env.local not found at", envPath);
}
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const courseSlug = "test-video";
const lessonSlug = "main-video";

async function main() {
  console.log("=== /api/video/stream diagnostic ===\n");
  console.log("SUPABASE_URL:", SUPABASE_URL ? "✓ set" : "✗ MISSING");
  console.log("SUPABASE_KEY:", SUPABASE_KEY ? "✓ set" : "✗ MISSING");
  console.log("BUNNY_LIBRARY_ID:", process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || "✗ MISSING");
  console.log("BUNNY_API_KEY:", process.env.BUNNY_API_KEY ? "✓ set" : "✗ MISSING");
  console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME || "✗ MISSING");
  console.log("");

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Step 1: course lookup
  console.log("STEP 1 — Fetch course by slug:", courseSlug);
  const { data: course, error: courseError } = await supabase
    .from("lms_courses")
    .select("id, title, slug")
    .eq("slug", courseSlug)
    .maybeSingle();
  console.log("  course:", course);
  console.log("  error:", courseError);
  if (!course) { console.error("  ✗ Course not found — stopping."); return; }

  // Step 2: modules
  console.log("\nSTEP 2 — Fetch modules for course:", course.id);
  const { data: modules, error: modulesError } = await supabase
    .from("lms_modules")
    .select("id, title")
    .eq("course_id", course.id);
  console.log("  modules:", modules);
  console.log("  error:", modulesError);
  if (!modules || modules.length === 0) { console.error("  ✗ No modules found — stopping."); return; }

  const moduleIds = modules.map((m: any) => m.id);

  // Step 3: lesson lookup
  console.log("\nSTEP 3 — Fetch lesson by slug:", lessonSlug);
  const { data: lesson, error: lessonError } = await supabase
    .from("lms_lessons")
    .select("id, title, slug")
    .eq("slug", lessonSlug)
    .in("module_id", moduleIds)
    .limit(1)
    .maybeSingle();
  console.log("  lesson:", lesson);
  console.log("  error:", lessonError);
  if (!lesson) { console.error("  ✗ Lesson not found — stopping."); return; }

  // Step 4: video lookup
  console.log("\nSTEP 4 — Fetch video for lesson:", lesson.id);
  const { data: video, error: videoError } = await supabase
    .from("lms_videos")
    .select("youtube_video_id, cloudinary_public_id, bunny_video_id, bunny_library_id")
    .eq("lesson_id", lesson.id)
    .limit(1)
    .maybeSingle();
  console.log("  video:", video);
  console.log("  error:", videoError);

  if (videoError) {
    console.error("\n✗ VIDEO FETCH ERROR — this is the 500 cause!");
    console.error("  Full error:", JSON.stringify(videoError, null, 2));
    console.error("\n  ➜ Most likely the 'lms_videos' table has an RLS policy blocking read,");
    console.error("    OR the 'bunny_video_id' or 'bunny_library_id' column doesn't exist yet.");
    return;
  }

  if (!video) {
    console.log("\n⚠ No video row found for this lesson.");
    console.log("  The route returns 404 'Video not yet uploaded' — NOT 500.");
    console.log("  ➜ Go to /admin/courses → Edit 'test video' → Save the Bunny video ID.");
    return;
  }

  console.log("\n✓ Video found!");
  if (video.bunny_video_id) {
    console.log("  ➜ Type: BUNNY — player should embed OK");
  } else if (video.cloudinary_public_id) {
    console.log("  ➜ Type: CLOUDINARY");
  } else if (video.youtube_video_id) {
    console.log("  ➜ Type: YOUTUBE");
  }
}

main().catch((e) => {
  console.error("\n✗ SCRIPT CRASHED:", e);
});
