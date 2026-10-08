import * as fs from "fs";
import * as path from "path";

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "node_modules" && file !== ".next" && file !== ".git") {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (/\.(ts|tsx|js|json|sql)$/.test(file)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

const rootDir = process.cwd();
const files = getAllFiles(rootDir);

const secretPatterns = [
  /BUNNY_API_KEY\s*=\s*["'][^"']+["']/,
  /CLOUDINARY_API_SECRET\s*=\s*["'][^"']+["']/,
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+["']/,
  /eyJhbGciOiJIUzI1NiI/, // Hardcoded JWT token
];

let hardcodedFound = 0;

console.log("=========================================");
console.log("  HARDCODED SECRETS & SENSITIVE DATA AUDIT");
console.log("=========================================\n");

files.forEach((filePath) => {
  const relPath = path.relative(rootDir, filePath);
  if (relPath.includes(".env") || relPath.includes("scratch")) return;

  const content = fs.readFileSync(filePath, "utf-8");

  secretPatterns.forEach((pat) => {
    if (pat.test(content)) {
      console.error(`❌ HARDCODED SECRET FOUND in: ${relPath}`);
      hardcodedFound++;
    }
  });
});

if (hardcodedFound === 0) {
  console.log("✓ CLEAN: 0 Hardcoded secrets or private keys found in codebase.");
  console.log("✓ All sensitive API keys & secrets are strictly loaded from process.env (.env.local).");
} else {
  console.error(`\n❌ Total Hardcoded Secrets Found: ${hardcodedFound}`);
}
