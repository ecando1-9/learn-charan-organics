export type CoursePdfResource = {
  id: string;
  title: string;
  url: string;
  description?: string;
  size?: string;
};

export function parsePdfResources(
  raw: any,
  fallbackPdfUrl?: string | null,
  courseTitle?: string
): CoursePdfResource[] {
  const results: CoursePdfResource[] = [];
  const seenUrls = new Set<string>();

  // 1. If raw is already an array of items
  if (Array.isArray(raw) && raw.length > 0) {
    raw.forEach((item, index) => {
      if (!item) return;
      if (typeof item === "string" && item.trim()) {
        const url = item.trim();
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          results.push({
            id: `pdf_${index + 1}`,
            title: `Formulation Resource ${index + 1}`,
            url,
          });
        }
      } else if (typeof item === "object" && (item.url || item.storage_path)) {
        const url = (item.url || item.storage_path || "").trim();
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          results.push({
            id: String(item.id || `pdf_${index + 1}`),
            title: String(item.title || `Formulation Guide ${index + 1}`).trim(),
            url,
            description: item.description ? String(item.description).trim() : undefined,
            size: item.size ? String(item.size).trim() : undefined,
          });
        }
      }
    });
  } else if (typeof raw === "string" && raw.trim()) {
    // Check if raw is a JSON string
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsePdfResources(parsed, fallbackPdfUrl, courseTitle);
      }
    } catch {
      // Not JSON, check if it's a URL
      const trimmed = raw.trim();
      if ((trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) && !seenUrls.has(trimmed)) {
        seenUrls.add(trimmed);
        results.push({
          id: "pdf_primary",
          title: courseTitle ? `${courseTitle} Notes` : "Formulation Guide & Recipe Sheet",
          url: trimmed,
        });
      }
    }
  }

  // 2. Fallback PDF URL if not already in results
  if (fallbackPdfUrl && typeof fallbackPdfUrl === "string") {
    const trimmed = fallbackPdfUrl.trim();
    if (trimmed) {
      // Maybe fallback is JSON
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            const extra = parsePdfResources(parsed, null, courseTitle);
            extra.forEach((e) => {
              if (!seenUrls.has(e.url)) {
                seenUrls.add(e.url);
                results.push(e);
              }
            });
          }
        } catch {
          // ignore
        }
      } else if ((trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) && !seenUrls.has(trimmed)) {
        seenUrls.add(trimmed);
        results.unshift({
          id: "pdf_primary",
          title: courseTitle ? `${courseTitle} Formulation Handbook` : "Formulation Handbook & Notes",
          url: trimmed,
        });
      }
    }
  }

  return results;
}
