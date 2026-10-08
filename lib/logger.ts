/**
 * Client & Server Audit Logging Utility
 */

export async function logAuditEvent(action: string, details?: Record<string, any>) {
  try {
    await fetch("/api/log/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, details }),
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

export async function logVideoWatch(data: {
  courseSlug: string;
  lessonSlug: string;
  videoType: "bunny" | "youtube" | "cloudinary";
  watchDurationSeconds: number;
  completed?: boolean;
}) {
  try {
    await fetch("/api/log/watch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error("Video watch log error:", err);
  }
}
