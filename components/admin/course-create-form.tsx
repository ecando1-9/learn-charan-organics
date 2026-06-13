"use client";

import { useState } from "react";
import {
  CheckCircle2, Image as ImageIcon, IndianRupee,
  Link2, Loader2, Pencil, Plus, Trash2, Upload, X, Youtube,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Course } from "@/lib/types";

/* ─────────────────── helpers ─────────────────── */
function slugify(v: string) {
  return v.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function getYoutubeId(url: string) {
  const t = url.trim();
  return t.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? t.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1]
    ?? t.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? t;
}

/* ─────────────────── shared field ─────────────────── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1.5 text-xs font-bold text-ink/60 dark:text-cream/60 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-ink/40 dark:text-cream/40">{hint}</p>}
    </div>
  );
}

/* ─────────────────── shared input styles ─────────────────── */
const inputCls = "min-h-11 w-full bg-transparent text-sm outline-none dark:text-cream dark:placeholder:text-cream/40";
const wrapCls = "flex items-center gap-3 rounded-2xl border border-forest/15 bg-linen px-4 dark:bg-white/5 dark:border-white/15";
const standaloneCls = "w-full rounded-2xl border border-forest/15 bg-linen px-4 py-3 text-sm font-semibold outline-none focus:border-leaf transition dark:bg-white/5 dark:border-white/15 dark:text-cream dark:placeholder:text-cream/40";

/* ─────────────────── ADD modal ─────────────────── */
export function AddCourseModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [price, setPrice] = useState("199");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("999");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setTitle(""); setYoutubeUrl(""); setPdfUrl("");
    setPrice("199"); setThumbnailUrl(""); setDescription(""); setSortOrder("999"); setMessage(null);
  }
  function close() { setOpen(false); reset(); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title || !youtubeUrl) {
      setMessage({ type: "error", text: "Course name and YouTube link are required." });
      return;
    }
    setLoading(true); setMessage(null);
    const supabase = createClient();
    const courseSlug = slugify(title);
    const videoId = getYoutubeId(youtubeUrl);
    const finalThumb = thumbnailUrl.trim() || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    const { data: category, error: catErr } = await supabase
      .from("lms_course_categories")
      .upsert({ name: title, slug: courseSlug }, { onConflict: "slug" })
      .select("id").single();
    if (catErr) { setMessage({ type: "error", text: catErr.message }); setLoading(false); return; }

    const { data: course, error: courseErr } = await supabase
      .from("lms_courses")
      .upsert({
        category_id: category.id, title, slug: courseSlug, description,
        thumbnail_url: finalThumb, youtube_url: youtubeUrl,
        pdf_url: pdfUrl || null, price_inr: Number(price) || 199, published: true,
        sort_order: Number(sortOrder) || 999,
      }, { onConflict: "slug" })
      .select("id").single();
    if (courseErr) { setMessage({ type: "error", text: courseErr.message }); setLoading(false); return; }

    const { data: mod, error: modErr } = await supabase
      .from("lms_modules")
      .insert({ course_id: course.id, title: "Course Video", sort_order: 1 })
      .select("id").single();
    if (modErr) { setMessage({ type: "error", text: modErr.message }); setLoading(false); return; }

    const { data: lesson, error: lesErr } = await supabase
      .from("lms_lessons")
      .insert({ module_id: mod.id, title, slug: "main-video", description, sort_order: 1, published: true })
      .select("id").single();
    if (lesErr) { setMessage({ type: "error", text: lesErr.message }); setLoading(false); return; }

    const { error: vidErr } = await supabase
      .from("lms_videos")
      .insert({ lesson_id: lesson.id, youtube_video_id: videoId });
    if (vidErr) { setMessage({ type: "error", text: vidErr.message }); setLoading(false); return; }

    if (pdfUrl) {
      await supabase.from("lms_pdf_resources").insert({
        lesson_id: lesson.id, course_id: course.id,
        title: `${title} notes`, storage_path: pdfUrl,
      });
    }

    setLoading(false);
    setMessage({ type: "success", text: `"${title}" added! Refreshing…` });
    setTimeout(() => { close(); window.location.reload(); }, 1500);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-soft hover:bg-leaf transition active:scale-95"
      >
        <Plus size={18} /> New course
      </button>

      {open && (
        <CourseModal
          title="Add New Course"
          subtitle="Fill in the details — it will appear in the course catalog immediately."
          fields={{ title, youtubeUrl, pdfUrl, price, thumbnailUrl, description, sortOrder }}
          setters={{ setTitle, setYoutubeUrl, setPdfUrl, setPrice, setThumbnailUrl, setDescription, setSortOrder }}
          loading={loading}
          message={message}
          submitLabel="Add Course"
          onClose={close}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

/* ─────────────────── EDIT modal ─────────────────── */
type EditableCourse = {
  id: string;
  slug: string;
  title: string;
  youtubeUrl: string;
  pdfUrl: string;
  price: number;
  thumbnailUrl: string;
  description: string;
  sortOrder: number;
};

export function EditCourseModal({ course, onDone }: { course: EditableCourse; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(course.title);
  const [youtubeUrl, setYoutubeUrl] = useState(course.youtubeUrl);
  const [pdfUrl, setPdfUrl] = useState(course.pdfUrl);
  const [price, setPrice] = useState(String(course.price));
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnailUrl);
  const [description, setDescription] = useState(course.description);
  const [sortOrder, setSortOrder] = useState(String(course.sortOrder));
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function close() { setOpen(false); setMessage(null); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title || !youtubeUrl) {
      setMessage({ type: "error", text: "Course name and YouTube link are required." });
      return;
    }
    setLoading(true); setMessage(null);
    const supabase = createClient();
    const videoId = getYoutubeId(youtubeUrl);
    const finalThumb = thumbnailUrl.trim() || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Update course row
    const { error: courseErr } = await supabase
      .from("lms_courses")
      .update({
        title,
        description,
        thumbnail_url: finalThumb,
        youtube_url: youtubeUrl,
        pdf_url: pdfUrl || null,
        price_inr: Number(price) || 199,
        sort_order: Number(sortOrder) || 999,
      })
      .eq("id", course.id);

    if (courseErr) { setMessage({ type: "error", text: courseErr.message }); setLoading(false); return; }

    // Find existing lesson for this course
    const { data: existingLessons } = await supabase
      .from("lms_lessons")
      .select("id, lms_modules!inner(course_id)")
      .eq("lms_modules.course_id", course.id)
      .limit(1);

    let lessonId: string | null = existingLessons?.[0]?.id ?? null;

    if (!lessonId) {
      // No module/lesson exists yet (seed course) — create them now
      const { data: newModule, error: modErr } = await supabase
        .from("lms_modules")
        .insert({ course_id: course.id, title: "Course Video", sort_order: 1 })
        .select("id").single();

      if (modErr) { setMessage({ type: "error", text: modErr.message }); setLoading(false); return; }

      const { data: newLesson, error: lesErr } = await supabase
        .from("lms_lessons")
        .insert({ module_id: newModule.id, title, slug: "main-video", description, sort_order: 1, published: true })
        .select("id").single();

      if (lesErr) { setMessage({ type: "error", text: lesErr.message }); setLoading(false); return; }

      lessonId = newLesson.id;
    }

    // Upsert video — update if exists, insert if not
    if (lessonId) {
      const { data: existingVideo } = await supabase
        .from("lms_videos")
        .select("id")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (existingVideo) {
        await supabase.from("lms_videos")
          .update({ youtube_video_id: videoId })
          .eq("lesson_id", lessonId);
      } else {
        await supabase.from("lms_videos")
          .insert({ lesson_id: lessonId, youtube_video_id: videoId });
      }
    }

    // Upsert PDF resource
    if (pdfUrl && lessonId) {
      await supabase.from("lms_pdf_resources")
        .upsert({ course_id: course.id, lesson_id: lessonId, title: `${title} notes`, storage_path: pdfUrl }, { onConflict: "course_id" });
    }

    setLoading(false);
    setMessage({ type: "success", text: "Course updated! Refreshing…" });
    setTimeout(() => { close(); onDone(); window.location.reload(); }, 1500);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("lms_courses").delete().eq("id", course.id);
    if (error) { alert("Delete failed: " + error.message); setDeleting(false); return; }
    window.location.reload();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Edit course"
        className="inline-flex items-center gap-1.5 rounded-xl bg-forest/8 dark:bg-white/10 px-3 py-1.5 text-xs font-bold text-forest dark:text-cream hover:bg-forest/15 dark:hover:bg-white/20 transition"
      >
        <Pencil size={13} /> Edit
      </button>

      {open && (
        <CourseModal
          title="Edit Course"
          subtitle="Update the course details below. Changes apply immediately."
          fields={{ title, youtubeUrl, pdfUrl, price, thumbnailUrl, description, sortOrder }}
          setters={{ setTitle, setYoutubeUrl, setPdfUrl, setPrice, setThumbnailUrl, setDescription, setSortOrder }}
          loading={loading}
          message={message}
          submitLabel="Save Changes"
          onClose={close}
          onSubmit={handleSubmit}
          extraFooter={
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 dark:border-red-800 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50"
            >
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Delete course
            </button>
          }
        />
      )}
    </>
  );
}

/* ─────────────────── shared modal shell ─────────────────── */
function CourseModal({
  title, subtitle, fields, setters, loading, message, submitLabel, onClose, onSubmit, extraFooter,
}: {
  title: string;
  subtitle: string;
  fields: { title: string; youtubeUrl: string; pdfUrl: string; price: string; thumbnailUrl: string; description: string; sortOrder: string };
  setters: {
    setTitle: (v: string) => void;
    setYoutubeUrl: (v: string) => void;
    setPdfUrl: (v: string) => void;
    setPrice: (v: string) => void;
    setThumbnailUrl: (v: string) => void;
    setDescription: (v: string) => void;
    setSortOrder: (v: string) => void;
  };
  loading: boolean;
  message: { type: "success" | "error"; text: string } | null;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  extraFooter?: React.ReactNode;
}) {
  const videoId = fields.youtubeUrl ? getYoutubeId(fields.youtubeUrl) : null;
  const previewThumb = fields.thumbnailUrl.trim()
    || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-[2rem] bg-white shadow-2xl dark:bg-[#0e1f18] max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-forest/10 px-6 py-5 dark:border-white/10 shrink-0">
          <div>
            <h2 className="text-xl font-black text-forest dark:text-cream">{title}</h2>
            <p className="mt-0.5 text-xs text-ink/55 dark:text-cream/55">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full bg-forest/5 hover:bg-forest/10 transition dark:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Thumbnail preview */}
          {previewThumb && (
            <div className="rounded-2xl overflow-hidden border border-forest/10 dark:border-white/10 aspect-video">
              <img
                src={previewThumb}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          <Field label="Course Name *">
            <input
              value={fields.title}
              onChange={(e) => setters.setTitle(e.target.value)}
              required
              placeholder="e.g. Neem Shampoo Making"
              className={standaloneCls}
            />
          </Field>

          <Field label="YouTube Link *">
            <div className={wrapCls}>
              <Youtube size={17} className="shrink-0 text-red-500" />
              <input
                value={fields.youtubeUrl}
                onChange={(e) => setters.setYoutubeUrl(e.target.value)}
                required
                placeholder="https://youtu.be/..."
                className={inputCls}
              />
            </div>
          </Field>

          <Field
            label="Custom Thumbnail URL (optional)"
            hint="Leave empty to auto-use the YouTube thumbnail."
          >
            <div className={wrapCls}>
              <ImageIcon size={17} className="shrink-0 text-leaf" />
              <input
                value={fields.thumbnailUrl}
                onChange={(e) => setters.setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={inputCls}
              />
            </div>
          </Field>

          <Field label="PDF Notes Link (optional)">
            <div className={wrapCls}>
              <Upload size={17} className="shrink-0 text-leaf" />
              <input
                value={fields.pdfUrl}
                onChange={(e) => setters.setPdfUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className={inputCls}
              />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)">
              <div className={wrapCls}>
                <IndianRupee size={17} className="shrink-0 text-leaf" />
                <input
                  value={fields.price}
                  onChange={(e) => setters.setPrice(e.target.value)}
                  type="number" min="0"
                  className={inputCls + " font-semibold"}
                />
              </div>
            </Field>

            <Field label="Position (Order)" hint="Lower = appears first. e.g. 1, 2, 3...">
              <div className={wrapCls}>
                <span className="shrink-0 text-sm font-black text-leaf">#</span>
                <input
                  value={fields.sortOrder}
                  onChange={(e) => setters.setSortOrder(e.target.value)}
                  type="number" min="1"
                  placeholder="e.g. 1"
                  className={inputCls + " font-semibold"}
                />
              </div>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={fields.description}
              onChange={(e) => setters.setDescription(e.target.value)}
              rows={3}
              placeholder="What will students learn in this course?"
              className="w-full rounded-2xl border border-forest/15 bg-linen px-4 py-3 text-sm outline-none focus:border-leaf transition resize-none dark:bg-white/5 dark:border-white/15 dark:text-cream dark:placeholder:text-cream/40"
            />
          </Field>

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

          <div className="flex flex-wrap gap-3 pt-1">
            {extraFooter}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-forest/15 py-3 text-sm font-bold text-forest hover:bg-forest/5 transition dark:border-white/15 dark:text-cream"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-forest py-3 text-sm font-bold text-white hover:bg-leaf transition disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
              {loading ? "Saving…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
