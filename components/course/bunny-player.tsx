"use client";

import { getBunnyEmbedUrl } from "@/lib/bunny";

interface BunnyPlayerProps {
  bunnyVideoId?: string | null;
  bunnyLibraryId?: string | null;
  youtubeVideoId?: string | null;
  title?: string;
  autoplay?: boolean;
  className?: string;
}

export function BunnyPlayer({
  bunnyVideoId,
  bunnyLibraryId,
  youtubeVideoId,
  title = "Video lesson",
  autoplay = false,
  className = "",
}: BunnyPlayerProps) {
  // Bunny Stream takes priority; falls back to YouTube if bunny ID is absent
  if (bunnyVideoId) {
    const src = getBunnyEmbedUrl(bunnyVideoId, bunnyLibraryId ?? undefined, autoplay);
    return (
      <div
        className={`relative w-full overflow-hidden rounded-[2rem] bg-black ${className}`}
        style={{ paddingTop: "56.25%" }}
      >
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  if (youtubeVideoId) {
    const src = `https://www.youtube.com/embed/${youtubeVideoId}${autoplay ? "?autoplay=1" : ""}`;
    return (
      <div
        className={`relative w-full overflow-hidden rounded-[2rem] bg-black ${className}`}
        style={{ paddingTop: "56.25%" }}
      >
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  // No video available
  return (
    <div
      className={`flex items-center justify-center rounded-[2rem] bg-forest/5 p-12 text-center ${className}`}
    >
      <div>
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-forest/10 text-forest">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
          </svg>
        </div>
        <p className="font-black text-forest">Video not available</p>
        <p className="mt-1 text-sm text-ink/60">
          The instructor hasn&apos;t uploaded this lesson yet.
        </p>
      </div>
    </div>
  );
}
