/**
 * Bunny.net Stream helpers
 * Docs: https://docs.bunny.net/docs/stream-getting-started
 */

const BUNNY_CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME ?? "";
const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID ?? "";
const BUNNY_API_KEY = process.env.BUNNY_API_KEY ?? "";

/**
 * Returns the Bunny Stream embed iframe URL.
 */
export function getBunnyEmbedUrl(
  bunnyVideoId: string,
  libraryId?: string,
  autoplay = false
): string {
  const lib = libraryId ?? BUNNY_LIBRARY_ID ?? "";
  const base = `https://iframe.mediadelivery.net/embed/${lib}/${bunnyVideoId}`;
  const params = new URLSearchParams();
  if (autoplay) params.set("autoplay", "true");
  params.set("responsive", "true");

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

/**
 * Returns the Bunny Stream thumbnail URL for a video.
 */
export function getBunnyThumbnailUrl(bunnyVideoId: string): string {
  if (!BUNNY_CDN_HOSTNAME || !bunnyVideoId) return "";
  return `https://${BUNNY_CDN_HOSTNAME}/${bunnyVideoId}/thumbnail.jpg`;
}

/**
 * Fetches real-time video analytics directly from Bunny Stream REST API (0 Supabase logs).
 */
export async function getBunnyLibraryStats(): Promise<{
  totalViews?: number;
  totalStorageUsed?: number;
  videoCount?: number;
  bandwidthUsed?: number;
} | null> {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) return null;

  try {
    const res = await fetch(
      `https://api.bunny.net/videolibrary/${BUNNY_LIBRARY_ID}`,
      {
        headers: {
          AccessKey: BUNNY_API_KEY,
          Accept: "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!res.ok) return null;
    const data = await res.json();

    return {
      totalViews: data.TotalViews ?? 0,
      totalStorageUsed: data.StorageUsage ?? 0,
      videoCount: data.VideoCount ?? 0,
      bandwidthUsed: data.TrafficUsage ?? 0,
    };
  } catch (err) {
    console.error("Failed to fetch Bunny Stream stats:", err);
    return null;
  }
}
