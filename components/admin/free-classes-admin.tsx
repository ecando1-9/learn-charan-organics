"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Youtube,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  ExternalLink,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { FreeClass } from "@/lib/types";

export type FreeCatalogCourse = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  youtube_url: string | null;
  published: boolean;
  is_free: boolean;
  price_inr: number;
};

export function FreeClassesAdmin() {
  const [standaloneClasses, setStandaloneClasses] = useState<FreeClass[]>([]);
  const [catalogFreeCourses, setCatalogFreeCourses] = useState<FreeCatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "catalog" | "standalone">("all");
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    youtube_video_id: "",
    thumbnail_url: "",
    sort_order: 0,
    published: true,
  });

  const supabase = createClient();

  async function fetchClasses() {
    setLoading(true);

    // 1. Fetch standalone YouTube free classes
    const { data: standaloneData } = await supabase
      .from("lms_free_classes")
      .select("*")
      .order("sort_order", { ascending: true });

    setStandaloneClasses((standaloneData ?? []) as FreeClass[]);

    // 2. Fetch courses in lms_courses labeled as free
    const { data: coursesData } = await supabase
      .from("lms_courses")
      .select("id, title, slug, description, thumbnail_url, youtube_url, published, is_free, price_inr")
      .or("is_free.eq.true,price_inr.eq.0")
      .order("sort_order", { ascending: true });

    setCatalogFreeCourses((coursesData ?? []) as FreeCatalogCourse[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  function extractYouTubeId(input: string): string {
    return (
      input.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1] ??
      input.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1] ??
      input.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1] ??
      input
    );
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const videoId = extractYouTubeId(form.youtube_video_id);
      await supabase.from("lms_free_classes").insert({
        ...form,
        youtube_video_id: videoId,
      });
      setForm({
        title: "",
        description: "",
        youtube_video_id: "",
        thumbnail_url: "",
        sort_order: standaloneClasses.length,
        published: true,
      });
      setShowForm(false);
      fetchClasses();
    });
  }

  async function handleDeleteStandalone(id: string) {
    if (!confirm("Delete this standalone free class?")) return;
    await supabase.from("lms_free_classes").delete().eq("id", id);
    fetchClasses();
  }

  async function togglePublishStandalone(fc: FreeClass) {
    await supabase
      .from("lms_free_classes")
      .update({ published: !fc.published })
      .eq("id", fc.id);
    fetchClasses();
  }

  async function togglePublishCourse(course: FreeCatalogCourse) {
    await supabase
      .from("lms_courses")
      .update({ published: !course.published })
      .eq("id", course.id);
    fetchClasses();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">Admin Management</p>
          <h1 className="text-3xl font-black text-forest dark:text-cream">Free Classes & Courses</h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
            Manage all 100% free classes across your course catalog and standalone YouTube lessons.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-full bg-leaf px-4 py-2 text-sm font-bold text-white hover:bg-forest transition self-start sm:self-auto shadow-sm cursor-pointer"
        >
          <Plus size={16} /> Add YouTube Free Class
        </button>
      </div>

      {/* Stats & Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest/10 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeTab === "all"
                ? "bg-forest text-white dark:bg-leaf"
                : "bg-forest/5 text-forest hover:bg-forest/10 dark:bg-white/10 dark:text-cream"
            }`}
          >
            All Free Content ({catalogFreeCourses.length + standaloneClasses.length})
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "catalog"
                ? "bg-forest text-white dark:bg-leaf"
                : "bg-forest/5 text-forest hover:bg-forest/10 dark:bg-white/10 dark:text-cream"
            }`}
          >
            <BookOpen size={13} />
            Catalog Free Courses ({catalogFreeCourses.length})
          </button>
          <button
            onClick={() => setActiveTab("standalone")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "standalone"
                ? "bg-forest text-white dark:bg-leaf"
                : "bg-forest/5 text-forest hover:bg-forest/10 dark:bg-white/10 dark:text-cream"
            }`}
          >
            <Youtube size={13} />
            YouTube Standalone ({standaloneClasses.length})
          </button>
        </div>

        <Link
          href="/admin/courses"
          className="text-xs font-bold text-leaf hover:underline flex items-center gap-1"
        >
          <span>Manage in Course Catalog</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 space-y-4 border border-forest/10 dark:border-white/10"
        >
          <h2 className="font-black text-forest dark:text-cream text-lg">Add New Standalone YouTube Free Class</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink/70 dark:text-cream/70">Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. How to make Aloe Vera Shampoo"
                className="w-full rounded-2xl border border-forest/20 bg-linen px-4 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:border-white/10 dark:bg-white/5 dark:text-cream"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink/70 dark:text-cream/70">
                YouTube URL or Video ID *
              </label>
              <input
                required
                value={form.youtube_video_id}
                onChange={(e) => setForm((f) => ({ ...f, youtube_video_id: e.target.value }))}
                placeholder="https://youtube.com/watch?v=... or Video ID"
                className="w-full rounded-2xl border border-forest/20 bg-linen px-4 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:border-white/10 dark:bg-white/5 dark:text-cream"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink/70 dark:text-cream/70">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Short description of what this class covers..."
                className="w-full rounded-2xl border border-forest/20 bg-linen px-4 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:border-white/10 dark:bg-white/5 dark:text-cream"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink/70 dark:text-cream/70">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                className="w-full rounded-2xl border border-forest/20 bg-linen px-4 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:border-white/10 dark:bg-white/5 dark:text-cream"
              />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input
                type="checkbox"
                id="pub"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="size-4 accent-leaf"
              />
              <label htmlFor="pub" className="text-sm font-bold text-ink/70 dark:text-cream/70">
                Publish immediately to website
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-leaf px-5 py-2 text-sm font-bold text-white hover:bg-forest transition disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Saving..." : "Save Free Class"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-forest/20 px-5 py-2 text-sm font-bold text-ink/70 hover:bg-linen transition dark:border-white/10 dark:text-cream/70 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-[2rem] animate-pulse bg-forest/10" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTION 1: Catalog Free Courses */}
          {(activeTab === "all" || activeTab === "catalog") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-forest dark:text-cream text-base flex items-center gap-2">
                  <BookOpen size={16} className="text-leaf" />
                  Free Courses From Course Catalog ({catalogFreeCourses.length})
                </h3>
                <span className="text-xs text-ink/50 dark:text-cream/50">
                  Labeled as Free in Course Management
                </span>
              </div>

              {catalogFreeCourses.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 text-center dark:bg-white/5 border border-forest/10 dark:border-white/10">
                  <p className="text-xs text-ink/60 dark:text-cream/60">
                    No courses labeled as free in the course catalog yet. Set any course price to ₹0 or check "Free Course" in Course Management to reflect it here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catalogFreeCourses.map((c) => {
                    const videoId =
                      c.youtube_url?.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1] ??
                      c.youtube_url?.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1];
                    const thumb =
                      c.thumbnail_url ||
                      (videoId
                        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                        : "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png");

                    return (
                      <div
                        key={c.id}
                        className="overflow-hidden rounded-[2rem] bg-white shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 flex flex-col justify-between"
                      >
                        <div className="relative h-36 bg-black/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={thumb} alt={c.title} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <span className="absolute left-3 top-3 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-black shadow-xs">
                            🎁 Catalog Free Course
                          </span>
                          <span
                            className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-black ${
                              c.published ? "bg-leaf text-white" : "bg-amber-600 text-white"
                            }`}
                          >
                            {c.published ? "Live" : "Draft / Hidden"}
                          </span>
                        </div>

                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-black text-sm text-forest dark:text-cream line-clamp-1">
                              {c.title}
                            </h4>
                            {c.description && (
                              <p className="mt-1 text-xs text-ink/60 dark:text-cream/60 line-clamp-2">
                                {c.description}
                              </p>
                            )}
                            <p className="mt-1 text-[11px] font-mono text-ink/40 dark:text-cream/40">
                              Slug: /{c.slug}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-forest/10 dark:border-white/10 flex items-center justify-between gap-2">
                            <button
                              onClick={() => togglePublishCourse(c)}
                              className="flex items-center gap-1 rounded-full border border-forest/20 px-3 py-1 text-xs font-bold text-ink/70 hover:bg-linen transition dark:border-white/10 dark:text-cream/70 cursor-pointer"
                            >
                              {c.published ? (
                                <>
                                  <EyeOff size={11} /> Hide
                                </>
                              ) : (
                                <>
                                  <Eye size={11} /> Publish
                                </>
                              )}
                            </button>

                            <Link
                              href="/admin/courses"
                              className="inline-flex items-center gap-1 text-xs font-bold text-leaf hover:underline"
                            >
                              <span>Edit in Courses</span>
                              <ExternalLink size={11} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: Standalone YouTube Classes */}
          {(activeTab === "all" || activeTab === "standalone") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-forest dark:text-cream text-base flex items-center gap-2">
                  <Youtube size={16} className="text-red-500" />
                  Standalone YouTube Classes ({standaloneClasses.length})
                </h3>
                <span className="text-xs text-ink/50 dark:text-cream/50">
                  Managed directly on this page
                </span>
              </div>

              {standaloneClasses.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 text-center dark:bg-white/5 border border-forest/10 dark:border-white/10">
                  <Youtube className="mx-auto mb-2 text-leaf" size={28} />
                  <p className="font-bold text-xs text-forest dark:text-cream">No standalone YouTube classes</p>
                  <p className="text-xs text-ink/60 dark:text-cream/60 mt-1">
                    Click "Add YouTube Free Class" above to create standalone video lessons.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {standaloneClasses.map((fc) => {
                    const thumb =
                      fc.thumbnail_url || `https://img.youtube.com/vi/${fc.youtube_video_id}/hqdefault.jpg`;

                    return (
                      <div
                        key={fc.id}
                        className="overflow-hidden rounded-[2rem] bg-white shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 flex flex-col justify-between"
                      >
                        <div className="relative h-36 bg-black/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={thumb} alt={fc.title} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <span className="absolute left-3 top-3 rounded-full bg-red-600 text-white px-2 py-0.5 text-[10px] font-black">
                            YouTube Lesson
                          </span>
                          <span
                            className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-black ${
                              fc.published ? "bg-leaf text-white" : "bg-clay text-white"
                            }`}
                          >
                            {fc.published ? "Live" : "Draft"}
                          </span>
                        </div>

                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="font-black text-sm text-forest dark:text-cream line-clamp-1">{fc.title}</p>
                            {fc.description && (
                              <p className="mt-1 text-xs text-ink/60 dark:text-cream/60 line-clamp-2">
                                {fc.description}
                              </p>
                            )}
                            <p className="mt-1 text-xs font-mono text-ink/40 dark:text-cream/40 truncate">
                              ID: {fc.youtube_video_id}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-forest/10 dark:border-white/10 pt-2">
                            <button
                              onClick={() => togglePublishStandalone(fc)}
                              className="flex items-center gap-1 rounded-full border border-forest/20 px-3 py-1 text-xs font-bold text-ink/70 hover:bg-linen transition dark:border-white/10 dark:text-cream/70 cursor-pointer"
                            >
                              {fc.published ? (
                                <>
                                  <EyeOff size={11} /> Hide
                                </>
                              ) : (
                                <>
                                  <Eye size={11} /> Publish
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteStandalone(fc.id)}
                              className="flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-50 transition dark:border-red-900/40 dark:hover:bg-red-900/20 cursor-pointer"
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
