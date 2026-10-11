import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to download course notes." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // 1. Fetch course details
    const { data: course, error: courseError } = await admin
      .from("lms_courses")
      .select("id, title, slug, is_free, price_inr, pdf_url")
      .eq("slug", slug)
      .maybeSingle();

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    // 2. Also check lms_pdf_resources in case pdf_url is stored there
    let pdfUrl = course.pdf_url;
    if (!pdfUrl) {
      const { data: resource } = await admin
        .from("lms_pdf_resources")
        .select("storage_path")
        .eq("course_id", course.id)
        .maybeSingle();
      if (resource?.storage_path) {
        pdfUrl = resource.storage_path;
      }
    }

    if (!pdfUrl) {
      return NextResponse.json(
        { error: "No formulation PDF handbook attached to this course yet." },
        { status: 404 }
      );
    }

    // 3. Check access rights: Free courses, Admins, or actively Enrolled students
    const isFree = course.is_free || Number(course.price_inr) === 0;

    if (!isFree) {
      // Check admin status
      const { data: profile } = await admin
        .from("lms_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const isAdmin = profile?.role === "admin";

      if (!isAdmin) {
        // Verify active enrollment in lms_enrollments
        const { data: enrollment } = await admin
          .from("lms_enrollments")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .eq("status", "active")
          .maybeSingle();

        if (!enrollment) {
          return NextResponse.json(
            {
              error:
                "Access restricted. Only enrolled students can download formulation notes and PDFs for this course.",
            },
            { status: 403 }
          );
        }
      }
    }

    // 4. Authorized: redirect user to the PDF or stream
    const wantsDownload = req.nextUrl.searchParams.get("download") === "true";

    // If Cloudinary and download requested, add fl_attachment flag
    if (wantsDownload && pdfUrl.includes("res.cloudinary.com") && !pdfUrl.includes("fl_attachment")) {
      const transformedUrl = pdfUrl.replace("/upload/", "/upload/fl_attachment/");
      return NextResponse.redirect(transformedUrl, 307);
    }

    return NextResponse.redirect(pdfUrl, 307);
  } catch (err: any) {
    console.error("[Course PDF Access] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process PDF request." },
      { status: 500 }
    );
  }
}
