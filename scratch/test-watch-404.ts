/**
 * Tests the /api/log/watch logic with courseSlug 'test-video' & lessonSlug 'main-video'
 * Run: npx tsx scratch/test-watch-404.ts
 */
import * as fs from "fs";
import * as path from "path";

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
}

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  const courseSlug = "test-video";
  const lessonSlug = "main-video";

  console.log("Checking course with anon key...");
  const { data: course, error: cErr } = await supabase
    .from("lms_courses")
    .select("id, slug, published")
    .eq("slug", courseSlug)
    .maybeSingle();

  console.log("Course:", course, "Error:", cErr);

  if (!course) {
    console.error("Course NOT found with anon key! This causes 404 in watch logger.");
    return;
  }

  const { data: modules, error: mErr } = await supabase
    .from("lms_modules")
    .select("id")
    .eq("course_id", course.id);

  console.log("Modules:", modules, "Error:", mErr);
  const moduleIds = (modules ?? []).map((m) => m.id);

  const { data: lesson, error: lErr } = await supabase
    .from("lms_lessons")
    .select("id, slug")
    .eq("slug", lessonSlug)
    .in("module_id", moduleIds.length ? moduleIds : ["00000000-0000-0000-0000-000000000000"])
    .maybeSingle();

  console.log("Lesson:", lesson, "Error:", lErr);
}

main().catch(console.error);
