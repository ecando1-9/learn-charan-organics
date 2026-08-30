/**
 * Bunny.net Stream helpers
 * Docs: https://docs.bunny.net/docs/stream-getting-started
 */

const BUNNY_CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME ?? '';

/**
 * Returns the Bunny Stream embed iframe URL.
 * @param bunnyVideoId - The Video ID from Bunny Stream dashboard
 * @param libraryId - The Library ID (overrides env default)
 * @param autoplay - Whether to autoplay
 */
export function getBunnyEmbedUrl(bunnyVideoId: string, libraryId?: string, autoplay = false): string {
  const lib = libraryId ?? process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID ?? '';
  const base = `https://iframe.mediadelivery.net/embed/${lib}/${bunnyVideoId}`;
  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', 'true');
  params.set('responsive', 'true');
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

/**
 * Returns the Bunny Stream thumbnail URL for a video.
 * @param bunnyVideoId - The Video ID from Bunny Stream dashboard
 */
export function getBunnyThumbnailUrl(bunnyVideoId: string): string {
  if (!BUNNY_CDN_HOSTNAME || !bunnyVideoId) return '';
  return `https://${BUNNY_CDN_HOSTNAME}/${bunnyVideoId}/thumbnail.jpg`;
}
