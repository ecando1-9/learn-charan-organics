/**
 * Checks your auth session + admin role in lms_profiles.
 * Run: npx tsx scratch/check-my-role.ts
 */
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
const lines = fs.readFileSync(envPath, "utf-8").split("\n");
for (const line of lines) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const idx = t.indexOf("=");
  if (idx === -1) continue;
  process.env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
}

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  console.log("Checking all profiles in lms_profiles...");

  const { data: profiles, error } = await supabase
    .from("lms_profiles")
    .select("id, email, role, full_name")
    .order("role");

  if (error) {
    console.error("Error fetching profiles:", error.message);
    console.log("\n➜ RLS is blocking reads. Trying with service role...");
    
    // Try without RLS
    const sbService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: p2, error: e2 } = await sbService
      .from("lms_profiles")
      .select("id, email, role, full_name")
      .order("role");
    console.log("Profiles (service role):", p2, e2);
    return;
  }

  console.log("\nAll profiles:", profiles);
  
  const admins = profiles?.filter((p: any) => p.role === "admin");
  const nonAdmins = profiles?.filter((p: any) => p.role !== "admin");
  
  console.log("\n👑 Admin accounts:", admins?.length ?? 0);
  admins?.forEach((a: any) => console.log("  -", a.email, "(id:", a.id + ")"));
  
  console.log("\n👥 Non-admin accounts:", nonAdmins?.length ?? 0);
  nonAdmins?.forEach((s: any) => console.log("  -", s.email, "role:", s.role));

  if ((admins?.length ?? 0) === 0) {
    console.log("\n⚠ NO ADMIN ACCOUNTS FOUND!");
    console.log("  Run this SQL in Supabase dashboard to set your account as admin:");
    console.log("  UPDATE lms_profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL_HERE';");
  }
}

main().catch(console.error);
