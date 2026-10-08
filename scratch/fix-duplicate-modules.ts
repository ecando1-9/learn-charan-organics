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

async function cleanup() {
  const { data: courses } = await supabase.from("lms_courses").select("id, title, slug");
  if (!courses) return;

  for (const course of courses) {
    const { data: modules } = await supabase
      .from("lms_modules")
      .select("id")
      .eq("course_id", course.id)
      .order("sort_order");

    if (modules && modules.length > 1) {
      console.log(`Course "${course.title}" has ${modules.length} modules. Cleaning up duplicates...`);
      // Keep the first module, delete extra empty modules
      const keepModuleId = modules[0].id;
      const extraModuleIds = modules.slice(1).map((m) => m.id);
      
      await supabase.from("lms_modules").delete().in("id", extraModuleIds);
      console.log(`Deleted extra modules for "${course.title}"`);
    }
  }

  console.log("Cleanup complete!");
}

cleanup();
