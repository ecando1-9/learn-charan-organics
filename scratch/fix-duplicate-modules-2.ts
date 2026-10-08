/**
 * Deletes duplicate modules for test-video course, keeping only the one
 * that has lessons attached.
 * Run: npx tsx scratch/fix-duplicate-modules-2.ts
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
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COURSE_ID = "67481f66-98b2-454c-b86f-1a76e5c69a44";

async function main() {
  // Get all modules
  const { data: modules } = await supabase
    .from("lms_modules")
    .select("id, title, position")
    .eq("course_id", COURSE_ID)
    .order("position");

  console.log("Current modules:", modules);

  if (!modules || modules.length <= 1) {
    console.log("No duplicates found.");
    return;
  }

  // For each module, count its lessons
  for (const mod of modules) {
    const { data: lessons } = await supabase
      .from("lms_lessons")
      .select("id, title, slug")
      .eq("module_id", mod.id);
    console.log(`Module ${mod.id} (${mod.title}) has ${lessons?.length ?? 0} lessons:`, lessons);
  }

  // Delete modules that have NO lessons
  for (const mod of modules) {
    const { count } = await supabase
      .from("lms_lessons")
      .select("id", { count: "exact", head: true })
      .eq("module_id", mod.id);

    if ((count ?? 0) === 0) {
      console.log(`\nDeleting empty module: ${mod.id}`);
      const { error } = await supabase
        .from("lms_modules")
        .delete()
        .eq("id", mod.id);
      console.log("  Delete result:", error ?? "✓ Success");
    } else {
      console.log(`\nKeeping module with lessons: ${mod.id} (${count} lessons)`);
    }
  }

  // Verify
  const { data: remaining } = await supabase
    .from("lms_modules")
    .select("id, title")
    .eq("course_id", COURSE_ID);
  console.log("\nRemaining modules:", remaining);
}

main().catch(console.error);
