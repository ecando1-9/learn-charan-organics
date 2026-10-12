import { type Metadata } from "next";
import Link from "next/link";
import { Play, Youtube, Sparkles, BookOpen, ArrowRight, CheckCircle2, Video } from "lucide-react";
import { Section } from "@/components/ui/section";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Free Classes | Charan Organics Academy",
  description:
    "Watch free herbal cosmetic formulation classes. Learn soap, shampoo, and natural hair care basics from Charan Organics Academy — 100% free.",
};

export const dynamic = "force-dynamic";

function extractYouTubeId(url: string | null | undefined): string {
  if (!url) return "";
  return (
    url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1] ??
    url.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1] ??
    url.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1] ??
    ""
  );
}

type CombinedFreeClass = {
  id: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  thumbnailUrl: string;
  courseSlug?: string;
};

async function getAllFreeClasses(): Promise<CombinedFreeClass[]> {
  const supabase = await createClient();

  // 1. Fetch free courses from lms_courses (courses marked is_free or price_inr = 0)
  const { data: freeCourses } = await supabase
    .from("lms_courses")
    .select("id, title, slug, description, thumbnail_url, youtube_url, is_free, price_inr")
    .eq("published", true)
    .or("is_free.eq.true,price_inr.eq.0");

  // 2. Fetch standalone free classes from lms_free_classes
  const { data: standaloneFree } = await supabase
    .from("lms_free_classes")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  const list: CombinedFreeClass[] = [];
  const seenVideoIds = new Set<string>();

  // Add free courses from lms_courses
  (freeCourses ?? []).forEach((c) => {
    const videoId = extractYouTubeId(c.youtube_url);
    if (videoId) seenVideoIds.add(videoId);
    list.push({
      id: c.id,
      title: c.title.trim(),
      description: c.description || "",
      youtubeVideoId: videoId,
      thumbnailUrl: c.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ""),
      courseSlug: c.slug,
    });
  });

  // Add standalone free classes (avoiding duplicates)
  (standaloneFree ?? []).forEach((fc) => {
    if (fc.youtube_video_id && seenVideoIds.has(fc.youtube_video_id)) return;
    list.push({
      id: fc.id,
      title: fc.title.trim(),
      description: fc.description || "",
      youtubeVideoId: fc.youtube_video_id,
      thumbnailUrl: fc.thumbnail_url || (fc.youtube_video_id ? `https://img.youtube.com/vi/${fc.youtube_video_id}/hqdefault.jpg` : ""),
    });
  });

  return list;
}

export default async function FreeClassesPage() {
  const classes = await getAllFreeClasses();

  return (
    <div className="pb-24">
      {/* ── Hero ── */}
      <section className="bg-forest text-cream py-16 sm:py-20 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur text-emerald-300">
            <Sparkles size={15} className="text-emerald-300" /> Free Botanical Classes
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl lg:text-6xl text-white">
            Free Formulation Classes
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-cream/80">
            Learn organic cosmetic making fundamentals completely free of charge. Watch practical formulation lessons directly below.
          </p>
        </div>
      </section>

      {/* ── Free Classes Grid ── */}
      <Section className="py-12 sm:py-16">
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-forest/10 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream">
                Available Free Masterclasses
              </h2>
              <p className="text-xs text-ink/60 dark:text-cream/60 mt-0.5">
                Full-length video lessons with natural formulation recipes
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-black">
              {classes.length} {classes.length === 1 ? "Class" : "Classes"} Free
            </span>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {classes.map((fc) => (
              <div
                key={fc.id}
                className="overflow-hidden rounded-[2.5rem] bg-white shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 flex flex-col justify-between transition-all hover:shadow-glass hover:-translate-y-1 duration-300"
              >
                {/* Responsive 16:9 YouTube Video Embed */}
                {fc.youtubeVideoId ? (
                  <div className="relative w-full aspect-video bg-black/10 overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${fc.youtubeVideoId}`}
                      title={fc.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  </div>
                ) : fc.thumbnailUrl ? (
                  <div className="relative w-full aspect-video bg-black/10 overflow-hidden">
                    <img
                      src={fc.thumbnailUrl}
                      alt={fc.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}

                {/* Content Body */}
                <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 shadow-sm">
                        🎁 100% Free Class
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-forest dark:text-cream leading-tight">
                      {fc.title}
                    </h3>

                    {fc.description && (
                      <p className="text-xs sm:text-sm leading-relaxed text-ink/70 dark:text-cream/70 line-clamp-3">
                        {fc.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-forest/10 dark:border-white/10 flex flex-wrap items-center gap-3">
                    {fc.courseSlug && (
                      <Link
                        href={`/learn/${fc.courseSlug}/main-video`}
                        className="inline-flex items-center gap-2 rounded-full bg-forest hover:bg-leaf text-white px-5 py-2.5 text-xs font-black shadow-md transition"
                      >
                        <Play size={14} /> Watch on Academy
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Call to Action: Explore Complete Masterclasses ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-forest via-[#11402e] to-emerald-950 text-cream p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
          <div className="space-y-2 max-w-xl text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} /> Certified Cosmetic Formulation
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Ready to Formulate Like a Professional?
            </h2>
            <p className="text-xs sm:text-sm text-cream/75 leading-relaxed">
              Explore 25+ specialized paid masterclasses with printable formulation ratio guides, ingredient chemistry notes, and official QR-verifiable certificates.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-full bg-white text-forest hover:bg-cream px-7 py-3.5 text-xs sm:text-sm font-black shadow-lg transition hover:scale-105 shrink-0"
          >
            <BookOpen size={16} /> Explore All Courses <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
