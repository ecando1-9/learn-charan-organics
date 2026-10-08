import { v2 as cloudinary } from "cloudinary";

/**
 * Configure Cloudinary safely on demand
 */
function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary credentials missing! Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env.local file."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

/**
 * Uploads any file buffer (Images, PDFs, Word docs, ZIPs) directly to Cloudinary using upload_stream.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  originalFileName: string,
  mimeType: string
): Promise<{ url: string; publicId: string; format: string }> {
  const cld = getCloudinary();

  const isImage = mimeType.startsWith("image/");
  const resourceType = isImage ? "image" : "raw";

  return new Promise((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(
      {
        folder: "charan_community_attachments",
        resource_type: resourceType,
        filename_override: originalFileName,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary stream upload returned empty result."));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format || mimeType.split("/")[1] || "file",
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Generates a signed Cloudinary video URL that expires after a set time.
 */
export function generateSignedVideoUrl(publicId: string, expiresSeconds = 3600): string {
  const cld = getCloudinary();
  const expiresAt = Math.floor(Date.now() / 1000) + expiresSeconds;

  return cld.utils.private_download_url(publicId, "mp4", {
    resource_type: "video",
    type: "authenticated",
    expires_at: expiresAt,
  });
}
