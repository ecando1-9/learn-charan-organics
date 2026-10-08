import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { visitorId, path, referrer, countryCode, countryName, deviceType, browser, sessionDurationSeconds } = body;

    if (!path) {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    // Infer geo/browser if headers present
    const userAgent = req.headers.get("user-agent") || "";
    const isMobile = /mobile/i.test(userAgent);
    const finalDevice = deviceType || (isMobile ? "mobile" : "desktop");

    const { error } = await supabase.from("lms_web_telemetry").insert({
      visitor_id: visitorId || "anon-" + Math.random().toString(36).substring(2, 9),
      user_id: user?.id ?? null,
      path,
      referrer: referrer || null,
      country_code: countryCode || "IN",
      country_name: countryName || "India",
      device_type: finalDevice,
      browser: browser || "Browser",
      session_duration_seconds: Number(sessionDurationSeconds) || 15,
    });

    if (error) {
      console.error("Telemetry insert error:", error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
