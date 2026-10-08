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

async function testCommunityFunctionality() {
  console.log("================================================");
  console.log("   COMMUNITY & GROUP CHAT END-TO-END AUDIT");
  console.log("================================================\n");

  // 1. Test fetching groups
  console.log("1. FETCHING EXISTING COMMUNITY GROUPS...");
  const { data: groups, error: gErr } = await supabase
    .from("lms_groups")
    .select("id, name, description, created_at");

  console.log("   Groups query result:", groups, "Error:", gErr);

  // 2. Test fetching messages for existing groups
  if (groups && groups.length > 0) {
    const groupId = groups[0].id;
    console.log(`\n2. FETCHING MESSAGES FOR GROUP: ${groups[0].name} (${groupId})...`);

    const { data: messages, error: mErr } = await supabase
      .from("lms_group_messages")
      .select(`
        id, group_id, user_id, body, file_url, file_name, file_type, created_at,
        lms_profiles ( full_name, email )
      `)
      .eq("group_id", groupId)
      .limit(10);

    console.log(`   Messages in group (${messages?.length ?? 0}):`, messages, "Error:", mErr);
  } else {
    console.log("\n2. No groups found in database. Create your first group in /community!");
  }

  console.log("\n================================================");
  console.log("   ✓ AUDIT COMPLETE");
  console.log("================================================\n");
}

testCommunityFunctionality().catch(console.error);
