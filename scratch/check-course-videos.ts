import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function check() {
  const { data: courses } = await supabase.from("lms_courses").select("id, slug, title");
  console.log("=== COURSES ===");
  console.log(courses);

  const { data: modules } = await supabase.from("lms_modules").select("*");
  console.log("=== MODULES ===");
  console.log(modules);

  const { data: lessons } = await supabase.from("lms_lessons").select("*");
  console.log("=== LESSONS ===");
  console.log(lessons);

  const { data: videos } = await supabase.from("lms_videos").select("*");
  console.log("=== VIDEOS ===");
  console.log(videos);
}

check();
