import { type Metadata } from "next";
import { Play, Youtube } from "lucide-react";
import { Section } from "@/components/ui/section";
import { createClient } from "@/lib/supabase/server";
import type { FreeClass } from "@/lib/types";

export const metadata: Metadata = {
  title: "Free Classes | Charan Organics Academy",
  description:
    "Watch free herbal product making classes on YouTube. Learn soap, shampoo, skin care basics from Charan Organics Academy — no login needed.",
};

async function getPublishedFreeClasses(): Promise<FreeClass[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lms_free_classes")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as FreeClass[];
}

export default async function FreeClassesPage() {
  const classes = await getPublishedFreeClasses();

  return (
    <>
      {/* Hero */}
      <section className="organic-bg text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
            <Youtube size={16} /> Free on YouTube
          </span>
          <h1 className="mt-5 text-4xl font-black sm:text-5xl lg:text-6xl">
            Free Classes
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Learn herbal cosmetic product making basics — 100% free. No login
            required. Watch directly on YouTube.
          </p>
        </div>
      </section>

      <Section>
        {classes.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-12 text-center shadow-soft dark:bg-white/5">
            <Play className="mx-auto mb-4 text-leaf" size={40} />
            <h2 className="text-2xl font-black text-forest dark:text-cream">
              No free classes yet
            </h2>
            <p className="mt-2 text-ink/60 dark:text-cream/60">
              Free classes will be added here by the academy soon. Check back!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {classes.map((fc) => (
              <div
                key={fc.id}
                className="overflow-hidden rounded-[2rem] bg-white shadow-soft dark:bg-white/5"
              >
                {/* YouTube embed */}
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${fc.youtube_video_id}`}
                    title={fc.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-forest dark:text-cream">
                    {fc.title}
                  </h3>
                  {fc.description && (
                    <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-cream/65">
                      {fc.description}
                    </p>
                  )}
                  <a
                    href={`https://www.youtube.com/watch?v=${fc.youtube_video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-leaf px-4 py-2 text-sm font-bold text-white transition hover:bg-forest"
                  >
                    <Youtube size={16} /> Watch on YouTube
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
