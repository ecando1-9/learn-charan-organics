import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};

envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function getYoutubeId(url: string | null) {
  if (!url) return "";
  const t = url.trim();
  return t.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? t.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1]
    ?? t.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? t;
}

async function run() {
  console.log("Starting DB course sync...");

  // 1. Fetch all courses
  const { data: courses, error: courseErr } = await supabase
    .from("lms_courses")
    .select("*");

  if (courseErr) {
    console.error("Error fetching courses:", courseErr);
    return;
  }

  console.log(`Checking ${courses.length} courses...`);

  for (const course of courses) {
    // Check if this course has modules
    const { data: modules, error: modErr } = await supabase
      .from("lms_modules")
      .select("id")
      .eq("course_id", course.id);

    if (modErr) {
      console.error(`Error checking modules for course ${course.title}:`, modErr);
      continue;
    }

    if (modules && modules.length > 0) {
      console.log(`✓ Course "${course.title}" already has modules/lessons. Skipping.`);
      continue;
    }

    console.log(`⚙ Course "${course.title}" is missing modules. Creating...`);

    // Create module
    const { data: newModule, error: createModErr } = await supabase
      .from("lms_modules")
      .insert({
        course_id: course.id,
        title: "Main Lesson",
        sort_order: 1
      })
      .select("id")
      .single();

    if (createModErr || !newModule) {
      console.error(`❌ Failed to create module for course ${course.title}:`, createModErr);
      continue;
    }

    // Create lesson
    const { data: newLesson, error: createLesErr } = await supabase
      .from("lms_lessons")
      .insert({
        module_id: newModule.id,
        title: `${course.title} – Full Video`,
        slug: "main-video",
        sort_order: 1,
        published: true
      })
      .select("id")
      .single();

    if (createLesErr || !newLesson) {
      console.error(`❌ Failed to create lesson for course ${course.title}:`, createLesErr);
      continue;
    }

    // Create video
    const videoId = getYoutubeId(course.youtube_url);
    if (!videoId) {
      console.log(`⚠ No YouTube video ID found for course "${course.title}". Skipping video link.`);
      continue;
    }

    const { error: createVidErr } = await supabase
      .from("lms_videos")
      .insert({
        lesson_id: newLesson.id,
        youtube_video_id: videoId
      });

    if (createVidErr) {
      console.error(`❌ Failed to create video for course ${course.title}:`, createVidErr);
    } else {
      console.log(`✓ Course "${course.title}" successfully synced with video ID: ${videoId}`);
    }
  }

  console.log("DB course sync complete!");
}

run();
