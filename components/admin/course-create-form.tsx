"use client";

import { useState } from "react";
import {
  CheckCircle2, Image as ImageIcon, IndianRupee, Link2, Loader2,
  Plus, Upload, X, Youtube,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getYoutubeId(url: string) {
  const t = url.trim();
  return t.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? t.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1]
    ?? t.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? t;
}

export function AddCourseModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [price, setPrice] = useState("199");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setTitle(""); setYoutubeUrl(""); setPdfUrl("");
    setPrice("199"); setThumbnailUrl(""); setDescription(""); setMessage(null);
  }

  function close() { setOpen(false); reset(); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title || !youtubeUrl) {
      setMessage({ type: "error", text: "Course name and YouTube link are required." });
      return;
    }
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const courseSlug = slugify(title);
    const videoId = getYoutubeId(youtubeUrl);
    const finalThumbnailUrl = thumbnailUrl.trim() || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Upsert category
    const { data: category, error: catErr } = await supabase
      .from("lms_course_categories")
      .upsert({ name: title, slug: courseSlug }, { onConflict: "slug" })
      .select("id").single();
    if (catErr) { setMessage({ type: "error", text: catErr.message }); setLoading(false); return; }

    // Upsert course
    const { data: course, error: courseErr } = await supabase
      .from("lms_courses")
      .upsert({
        category_id: category.id, title, slug: courseSlug, description,
        thumbnail_url: finalThumbnailUrl,
        youtube_url: youtubeUrl, pdf_url: pdfUrl || null,
        price_inr: Number(price) || 199, published: true,
      }, { onConflict: "slug" })
      .select("id").single();
    if (courseErr) { setMessage({ type: "error", text: courseErr.message }); setLoading(false); return; }

    // Insert module
    const { data: module, error: modErr } = await supabase
      .from("lms_modules")
      .insert({ course_id: course.id, title: "Course Video", sort_order: 1 })
      .select("id").single();
    if (modErr) { setMessage({ type: "error", text: modErr.message }); setLoading(false); return; }

    // Insert lesson
    const { data: lesson, error: lesErr } = await supabase
      .from("lms_lessons")
      .insert({ module_id: module.id, title, slug: "main-video", description, sort_order: 1, published: true })
      .select("id").single();
    if (lesErr) { setMessage({ type: "error", text: lesErr.message }); setLoading(false); return; }

    // Insert video
    const { error: vidErr } = await supabase
      .from("lms_videos")
      .insert({ lesson_id: lesson.id, youtube_video_id: videoId });
    if (vidErr) { setMessage({ type: "error", text: vidErr.message }); setLoading(false); return; }

    // Insert PDF if provided
    if (pdfUrl) {
      await supabase.from("lms_pdf_resources").insert({
        lesson_id: lesson.id, course_id: course.id,
        title: `${title} notes`, storage_path: pdfUrl,
      });
    }

    setLoading(false);
    setMessage({ type: "success", text: `"${title}" added successfully!` });
    setTimeout(() => close(), 1800);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-soft hover:bg-leaf transition active:scale-95"
      >
        <Plus size={18} /> New course
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200 rounded-[2rem] bg-white shadow-2xl dark:bg-[#0e1f18]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-forest/10 px-6 py-5 dark:border-white/10">
              <div>
                <h2 className="text-xl font-black text-forest dark:text-cream">Add New Course</h2>
                <p className="mt-0.5 text-xs text-ink/55 dark:text-cream/55">
                  Fill in the details — it will appear in the course catalog immediately.
                </p>
              </div>
              <button
                onClick={close}
                className="grid size-9 place-items-center rounded-full bg-forest/5 hover:bg-forest/10 transition dark:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Course name */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-ink/60 dark:text-cream/60 uppercase tracking-wide">
                  Course Name *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Neem Shampoo Making"
                  className="w-full rounded-2xl border border-forest/15 bg-linen px-4 py-3 text-sm font-semibold outline-none focus:border-leaf transition dark:bg-white/5 dark:border-white/15 dark:text-cream dark:placeholder:text-cream/40"
                />
              </div>

              {/* YouTube link */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-ink/60 dark:text-cream/60 uppercase tracking-wide">
                  YouTube Link *
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-forest/15 bg-linen px-4 dark:bg-white/5 dark:border-white/15">
                  <Youtube size={17} className="shrink-0 text-red-500" />
                  <input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    required
                    placeholder="https://youtu.be/..."
                    className="min-h-11 w-full bg-transparent text-sm outline-none dark:text-cream dark:placeholder:text-cream/40"
                  />
                </div>
              </div>

              {/* Custom Thumbnail URL */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-ink/60 dark:text-cream/60 uppercase tracking-wide">
                  Custom Thumbnail Link <span className="font-normal normal-case">(optional)</span>
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-forest/15 bg-linen px-4 dark:bg-white/5 dark:border-white/15">
                  <ImageIcon size={17} className="shrink-0 text-leaf" />
                  <input
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="e.g. https://example.com/image.jpg"
                    className="min-h-11 w-full bg-transparent text-sm outline-none dark:text-cream dark:placeholder:text-cream/40"
                  />
                </div>
                <p className="mt-1 text-[10px] text-ink/40 dark:text-cream/40">
                  Leave empty to automatically use the default YouTube thumbnail.
                </p>
              </div>

              {/* PDF link */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-ink/60 dark:text-cream/60 uppercase tracking-wide">
                  PDF Notes Link <span className="font-normal normal-case">(optional)</span>
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-forest/15 bg-linen px-4 dark:bg-white/5 dark:border-white/15">
                  <Upload size={17} className="shrink-0 text-leaf" />
                  <input
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="min-h-11 w-full bg-transparent text-sm outline-none dark:text-cream dark:placeholder:text-cream/40"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-ink/60 dark:text-cream/60 uppercase tracking-wide">
                  Price (₹)
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-forest/15 bg-linen px-4 dark:bg-white/5 dark:border-white/15">
                  <IndianRupee size={17} className="shrink-0 text-leaf" />
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    type="number"
                    min="0"
                    className="min-h-11 w-full bg-transparent text-sm font-semibold outline-none dark:text-cream"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-ink/60 dark:text-cream/60 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What will students learn in this course?"
                  className="w-full rounded-2xl border border-forest/15 bg-linen px-4 py-3 text-sm outline-none focus:border-leaf transition resize-none dark:bg-white/5 dark:border-white/15 dark:text-cream dark:placeholder:text-cream/40"
                />
              </div>

              {/* Message */}
              {message && (
                <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
                  message.type === "success"
                    ? "bg-leaf/10 text-leaf"
                    : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                }`}>
                  {message.type === "success" && <CheckCircle2 size={16} />}
                  {message.text}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 rounded-full border border-forest/15 py-3 text-sm font-bold text-forest hover:bg-forest/5 transition dark:border-white/15 dark:text-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-forest py-3 text-sm font-bold text-white hover:bg-leaf transition disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {loading ? "Adding…" : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
