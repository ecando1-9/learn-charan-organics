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

async function test() {
  console.log("Dumping profiles and requests...");

  // 1. Get all profiles
  const { data: profiles, error: err1 } = await supabase
    .from("lms_profiles")
    .select("*");

  if (err1) {
    console.error("Error fetching profiles:", err1);
  } else {
    console.log("Profiles count:", profiles?.length);
    console.log("Profiles details:", profiles);
  }

  // 2. Get all enrollment requests
  const { data: requests, error: err2 } = await supabase
    .from("lms_enrollment_requests")
    .select("*");

  if (err2) {
    console.error("Error fetching requests:", err2);
  } else {
    console.log("Requests count:", requests?.length);
    console.log("Requests details:", requests);
  }
}

test();
