import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Generates a signed Cloudinary video URL that expires after a set time.
 * @param publicId The Cloudinary public ID of the video asset.
 * @param expiresSeconds Expiration time in seconds (default is 3600 seconds / 1 hour).
 * @returns The signed URL for playback.
 */
export function generateSignedVideoUrl(publicId: string, expiresSeconds = 3600): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresSeconds;

  // Use private_download_url for secure authenticated video delivery
  return cloudinary.utils.private_download_url(publicId, "mp4", {
    resource_type: "video",
    type: "authenticated",
    expires_at: expiresAt,
  });
}
