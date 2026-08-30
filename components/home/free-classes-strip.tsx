import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { FreeClass } from "@/lib/types";

async function getFreeClasses(): Promise<FreeClass[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lms_free_classes")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .limit(6);
  return (data ?? []) as FreeClass[];
}

export async function FreeClassesStrip() {
  const classes = await getFreeClasses();

  if (classes.length === 0) return null;

  return (
    <section className="bg-forest text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-bold uppercase tracking-[0.18em] text-leaf">100% Free</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Free Classes on YouTube
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Learn the basics of herbal product making — no login needed. Watch directly on YouTube.
            </p>
          </div>
          <Link
            href="/free-classes"
            className="inline-flex shrink-0 items-center gap-2 font-bold text-leaf"
          >
            View all free classes <ArrowRight size={18} />
          </Link>
        </div>

        <div className="mt-8 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {classes.map((fc) => {
            const thumb =
              fc.thumbnail_url ||
              `https://img.youtube.com/vi/${fc.youtube_video_id}/hqdefault.jpg`;
            return (
              <a
                key={fc.id}
                href={`https://www.youtube.com/watch?v=${fc.youtube_video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-72 shrink-0 overflow-hidden rounded-[2rem] bg-white/10 transition hover:bg-white/20"
              >
                <div className="relative h-44 overflow-hidden rounded-t-[2rem]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt={fc.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                    <span className="grid size-12 place-items-center rounded-full bg-white/90 text-forest">
                      <Play size={20} className="translate-x-0.5" />
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 text-sm font-black leading-snug">
                    {fc.title}
                  </p>
                  {fc.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-white/60">
                      {fc.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs font-bold text-leaf">
                    Watch on YouTube →
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
