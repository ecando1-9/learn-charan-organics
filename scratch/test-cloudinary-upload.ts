import * as fs from "fs";
import * as path from "path";

// Manually load .env.local
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

import { uploadToCloudinary } from "../lib/cloudinary";

async function main() {
  console.log("=== Cloudinary Connection Test ===");
  console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing");
  console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing");
  console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing");

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error("Cloudinary keys missing!");
    return;
  }

  console.log("\nTesting test buffer upload to Cloudinary...");
  const dummyBuffer = Buffer.from("Test file upload content for Charan Organics community chat");
  const result = await uploadToCloudinary(dummyBuffer, "test-document.txt", "text/plain");

  console.log("✓ Cloudinary Upload Successful!");
  console.log("  URL:", result.url);
  console.log("  Public ID:", result.publicId);
}

main().catch((err) => {
  console.error("✗ Cloudinary upload test failed:", err.message);
});
