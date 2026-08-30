"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Trash2, Youtube, Eye, EyeOff, GripVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { FreeClass } from "@/lib/types";

export function FreeClassesAdmin() {
  const [classes, setClasses] = useState<FreeClass[]>([]);
  const [loading, setLoading] = useState(true);
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
    const { data } = await supabase
      .from("lms_free_classes")
      .select("*")
      .order("sort_order", { ascending: true });
    setClasses((data ?? []) as FreeClass[]);
    setLoading(false);
  }

  useEffect(() => { fetchClasses(); }, []);

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
      setForm({ title: "", description: "", youtube_video_id: "", thumbnail_url: "", sort_order: classes.length, published: true });
      setShowForm(false);
      fetchClasses();
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this free class?")) return;
    await supabase.from("lms_free_classes").delete().eq("id", id);
    fetchClasses();
  }

  async function togglePublish(fc: FreeClass) {
    await supabase.from("lms_free_classes").update({ published: !fc.published }).eq("id", fc.id);
    fetchClasses();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">Admin</p>
          <h1 className="text-3xl font-black text-forest dark:text-cream">Free Classes</h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">Manage YouTube free lesson cards shown on the public site.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-full bg-leaf px-4 py-2 text-sm font-bold text-white hover:bg-forest transition"
        >
          <Plus size={16} /> Add Free Class
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 space-y-4">
          <h2 className="font-black text-forest dark:text-cream">Add New Free Class</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink/70 dark:text-cream/70">Title *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. How to make Aloe Vera Shampoo"
                className="w-full rounded-2xl border border-forest/20 bg-linen px-4 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:border-white/10 dark:bg-white/5 dark:text-cream" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink/70 dark:text-cream/70">YouTube URL or Video ID *</label>
              <input required value={form.youtube_video_id} onChange={e => setForm(f => ({ ...f, youtube_video_id: e.target.value }))}
                placeholder="https://youtube.com/watch?v=... or Video ID"
                className="w-full rounded-2xl border border-forest/20 bg-linen px-4 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:border-white/10 dark:bg-white/5 dark:text-cream" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink/70 dark:text-cream/70">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2} placeholder="Short description of what this class covers..."
                className="w-full rounded-2xl border border-forest/20 bg-linen px-4 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:border-white/10 dark:bg-white/5 dark:text-cream" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink/70 dark:text-cream/70">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                className="w-full rounded-2xl border border-forest/20 bg-linen px-4 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-leaf dark:border-white/10 dark:bg-white/5 dark:text-cream" />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="pub" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="size-4 accent-leaf" />
              <label htmlFor="pub" className="text-sm font-bold text-ink/70 dark:text-cream/70">Publish immediately</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={isPending}
              className="rounded-full bg-leaf px-5 py-2 text-sm font-bold text-white hover:bg-forest transition disabled:opacity-50">
              {isPending ? "Saving..." : "Save Free Class"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-full border border-forest/20 px-5 py-2 text-sm font-bold text-ink/70 hover:bg-linen transition dark:border-white/10 dark:text-cream/70">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-[2rem] animate-pulse bg-forest/10" />)}
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-10 text-center shadow-soft dark:bg-white/5">
          <Youtube className="mx-auto mb-3 text-leaf" size={36} />
          <p className="font-black text-forest dark:text-cream">No free classes yet</p>
          <p className="text-sm text-ink/60 dark:text-cream/60">Click "Add Free Class" to create your first one.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((fc) => {
            const thumb = fc.thumbnail_url || `https://img.youtube.com/vi/${fc.youtube_video_id}/hqdefault.jpg`;
            return (
              <div key={fc.id} className="overflow-hidden rounded-[2rem] bg-white shadow-soft dark:bg-white/5">
                <div className="relative h-36">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb} alt={fc.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-black ${
                    fc.published ? "bg-leaf text-white" : "bg-clay text-white"
                  }`}>
                    {fc.published ? "Live" : "Draft"}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-black text-sm text-forest dark:text-cream line-clamp-2">{fc.title}</p>
                  {fc.description && <p className="mt-1 text-xs text-ink/60 dark:text-cream/60 line-clamp-2">{fc.description}</p>}
                  <p className="mt-1 text-xs font-mono text-ink/40 dark:text-cream/40">{fc.youtube_video_id}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => togglePublish(fc)}
                      className="flex items-center gap-1 rounded-full border border-forest/20 px-3 py-1 text-xs font-bold text-ink/70 hover:bg-linen transition dark:border-white/10 dark:text-cream/70">
                      {fc.published ? <><EyeOff size={11} /> Hide</> : <><Eye size={11} /> Publish</>}
                    </button>
                    <button onClick={() => handleDelete(fc.id)}
                      className="flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-50 transition dark:border-red-900/40 dark:hover:bg-red-900/20">
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
  );
}
