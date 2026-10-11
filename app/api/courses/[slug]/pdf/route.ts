import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parsePdfResources, CoursePdfResource } from "@/lib/course-pdfs";

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
    let course: any = null;
    const { data: cData, error: courseError } = await admin
      .from("lms_courses")
      .select("id, title, slug, is_free, price_inr, pdf_url, pdf_resources")
      .eq("slug", slug)
      .maybeSingle();

    if (courseError && courseError.message.includes("pdf_resources")) {
      // Fallback if pdf_resources column does not exist
      const { data: fallbackCourse } = await admin
        .from("lms_courses")
        .select("id, title, slug, is_free, price_inr, pdf_url")
        .eq("slug", slug)
        .maybeSingle();
      course = fallbackCourse;
    } else {
      course = cData;
    }

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    // 2. Query lms_pdf_resources as well
    const { data: extraResources } = await admin
      .from("lms_pdf_resources")
      .select("id, title, storage_path")
      .eq("course_id", course.id);

    // Combine all PDF resources
    const allResources: CoursePdfResource[] = parsePdfResources(
      course.pdf_resources,
      course.pdf_url,
      course.title
    );

    if (extraResources && extraResources.length > 0) {
      const seen = new Set(allResources.map((r) => r.url));
      extraResources.forEach((res: any, idx: number) => {
        if (res.storage_path && !seen.has(res.storage_path)) {
          allResources.push({
            id: String(res.id || `pdf_res_${idx + 1}`),
            title: res.title || `Formulation Note ${idx + 1}`,
            url: res.storage_path,
          });
          seen.add(res.storage_path);
        }
      });
    }

    if (allResources.length === 0) {
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

    // 4. Resolve which PDF was requested
    const requestedId = req.nextUrl.searchParams.get("id");
    const requestedIndex = req.nextUrl.searchParams.get("index");

    let targetPdf: CoursePdfResource = allResources[0];

    if (requestedId) {
      const found = allResources.find((r) => r.id === requestedId);
      if (found) targetPdf = found;
    } else if (requestedIndex !== null && !isNaN(Number(requestedIndex))) {
      const idx = Number(requestedIndex);
      if (idx >= 0 && idx < allResources.length) {
        targetPdf = allResources[idx];
      }
    }

    const pdfUrl = targetPdf.url;
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
