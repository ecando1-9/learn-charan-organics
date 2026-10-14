import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

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

export const dynamic = "force-dynamic";

function isAllowedDownloadUrl(fileUrl: string) {
  try {
    const url = new URL(fileUrl);
    return (
      url.protocol === "https:" &&
      (url.hostname.endsWith("cloudinary.com") ||
        url.hostname.endsWith("res.cloudinary.com") ||
        url.hostname.endsWith("b-cdn.net"))
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");
    const requestedName = searchParams.get("name") || "download";
    const wantsView = searchParams.get("view") === "true";

    if (!fileUrl) {
      return NextResponse.json({ error: "Missing file URL" }, { status: 400 });
    }

    if (!isAllowedDownloadUrl(fileUrl)) {
      return NextResponse.json({ error: "Unsupported download URL" }, { status: 400 });
    }

    let downloadUrl = fileUrl;

    // Handle Cloudinary raw files (e.g. PDFs, docs, zips) with signed URLs
    if (fileUrl.includes("cloudinary.com") && fileUrl.includes("/raw/upload/")) {
      try {
        const cld = getCloudinary();
        const match = fileUrl.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
        if (match && match[1]) {
          const publicId = decodeURIComponent(match[1]);
          downloadUrl = cld.utils.private_download_url(publicId, "", {
            resource_type: "raw",
            type: "upload",
            attachment: !wantsView,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
          });
        }
      } catch (err) {
        console.error("[download] Error generating signed Cloudinary raw URL:", err);
      }
    } else if (fileUrl.includes("cloudinary.com") && fileUrl.includes("/image/upload/")) {
      // For images on Cloudinary, add fl_attachment transformation flag
      try {
        const cld = getCloudinary();
        const match = fileUrl.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);
        if (match && match[1]) {
          const publicId = decodeURIComponent(match[1]);
          // Strip extension if present in publicId for image
          const cleanPublicId = publicId.replace(/\.[^/.]+$/, "");
          downloadUrl = cld.url(cleanPublicId, {
            resource_type: "image",
            flags: !wantsView ? "attachment" : undefined,
            secure: true,
          });
        }
      } catch (err) {
        console.error("[download] Error transforming Cloudinary image URL:", err);
      }
    }

    // Fetch the target file directly and stream it back with safe attachment headers
    const upstreamRes = await fetch(downloadUrl);

    if (!upstreamRes.ok) {
      // Fallback: if upstream fetch failed, redirect the user directly to downloadUrl
      return NextResponse.redirect(downloadUrl);
    }

    let contentType = upstreamRes.headers.get("content-type") || "application/octet-stream";
    if (requestedName.toLowerCase().endsWith(".pdf") || fileUrl.toLowerCase().includes(".pdf")) {
      contentType = "application/pdf";
    }
    const safeFilename = encodeURIComponent(requestedName).replace(/['()]/g, escape);

    return new Response(upstreamRes.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${wantsView ? "inline" : "attachment"}; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("[download] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Failed to download file" }, { status: 500 });
  }
}
