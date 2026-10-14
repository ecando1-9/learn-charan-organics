import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parsePdfResources, CoursePdfResource } from "@/lib/course-pdfs";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";

function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials missing");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

function getSignedPdfUrl(fileUrl: string, isDownload: boolean): string {
  try {
    if (fileUrl.includes("cloudinary.com") && fileUrl.includes("/raw/upload/")) {
      const cld = getCloudinary();
      const match = fileUrl.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
      if (match && match[1]) {
        const publicId = decodeURIComponent(match[1]);
        return cld.utils.private_download_url(publicId, "", {
          resource_type: "raw",
          type: "upload",
          attachment: isDownload,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        });
      }
    } else if (fileUrl.includes("cloudinary.com") && fileUrl.includes("/image/upload/")) {
      const cld = getCloudinary();
      const match = fileUrl.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);
      if (match && match[1]) {
        const publicId = decodeURIComponent(match[1]).replace(/\.[^/.]+$/, "");
        return cld.url(publicId, {
          resource_type: "image",
          flags: isDownload ? "attachment" : undefined,
          secure: true,
        });
      }
    }
  } catch (err) {
    console.error("[course-pdf] Error signing Cloudinary URL:", err);
  }
  return fileUrl;
}

function safePdfFilename(title?: string | null) {
  const base = (title || "course-notes")
    .replace(/[^a-z0-9\s._-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "course-notes";
  return base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
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

    // 3. Check access rights:
    // Free courses: immediate access
    // Paid courses: require logged-in user who is Admin or Actively Enrolled
    const isFree = course.is_free || Number(course.price_inr) === 0;

    if (!isFree) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { error: "Please log in to view or download course formulation notes." },
          { status: 401 }
        );
      }

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
                "Access restricted. Only enrolled students can view and download formulation notes for this course.",
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
      const found = allResources.find((r) => r.id === requestedId || r.url === requestedId);
      if (found) targetPdf = found;
    } else if (requestedIndex !== null && !isNaN(Number(requestedIndex))) {
      const idx = Number(requestedIndex);
      if (idx >= 0 && idx < allResources.length) {
        targetPdf = allResources[idx];
      }
    }

    const wantsDownload = req.nextUrl.searchParams.get("download") === "true";
    const downloadTargetUrl = getSignedPdfUrl(targetPdf.url, wantsDownload);

    // Fetch upstream file (supports signed Cloudinary raw/image URLs and external hosts)
    const upstreamRes = await fetch(downloadTargetUrl);

    if (!upstreamRes.ok || !upstreamRes.body) {
      // Fallback: redirect directly to the signed URL so the browser downloads/views directly
      return NextResponse.redirect(downloadTargetUrl);
    }

    const filename = safePdfFilename(targetPdf.title || course.title);
    const encodedFilename = encodeURIComponent(filename);

    return new Response(upstreamRes.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${wantsDownload ? "attachment" : "inline"}; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("[Course PDF Access] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process PDF request." },
      { status: 500 }
    );
  }
}
