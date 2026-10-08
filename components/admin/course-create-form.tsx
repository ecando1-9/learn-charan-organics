"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2, Image as ImageIcon, IndianRupee,
  Link2, Loader2, Pencil, Plus, Trash2, Upload, X, Youtube, Eye, EyeOff
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Course } from "@/lib/types";
import { notifyAllUsersNewCourse } from "@/app/actions/notifications";

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
  const [bunnyVideoId, setBunnyVideoId] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("199");
  const [published, setPublished] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("1");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setTitle(""); setYoutubeUrl(""); setBunnyVideoId(""); setPdfUrl("");
    setIsFree(false); setPrice("199"); setPublished(true);
    setThumbnailUrl(""); setDescription(""); setSortOrder("1"); setMessage(null);
  }
  function close() { setOpen(false); reset(); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title || (!youtubeUrl && !bunnyVideoId)) {
      setMessage({ type: "error", text: "Course name and a video (YouTube link or Bunny Video ID) are required." });
      return;
    }
    setLoading(true); setMessage(null);
    const supabase = createClient();
    const courseSlug = slugify(title);
    const videoId = youtubeUrl ? getYoutubeId(youtubeUrl) : "dummy";
    const finalThumb = thumbnailUrl.trim() || (youtubeUrl ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "");
    const finalPrice = isFree ? 0 : (Number(price) || 0);

    let categoryId: string | null = null;
    try {
      const { data: category } = await supabase
        .from("lms_course_categories")
        .upsert({ name: title, slug: courseSlug }, { onConflict: "slug" })
        .select("id").maybeSingle();
      categoryId = category?.id ?? null;
    } catch (e) {
      // Category upsert optional fallback
    }

    const basePayload: any = {
      category_id: categoryId,
      title,
      slug: courseSlug,
      description,
      thumbnail_url: finalThumb,
      youtube_url: youtubeUrl || null,
      pdf_url: pdfUrl || null,
      price_inr: finalPrice,
      published,
      sort_order: Number(sortOrder) || 1,
    };

    let course: any = null;
    let courseErr: any = null;

    // Try upsert with is_free first
    const res = await supabase
      .from("lms_courses")
      .upsert({ ...basePayload, is_free: isFree }, { onConflict: "slug" })
      .select("id")
      .single();

    if (res.error && res.error.message.includes("is_free")) {
      // Fallback if column does not exist
      const fallbackRes = await supabase
        .from("lms_courses")
        .upsert(basePayload, { onConflict: "slug" })
        .select("id")
        .single();
      course = fallbackRes.data;
      courseErr = fallbackRes.error;
    } else {
      course = res.data;
      courseErr = res.error;
    }

    if (courseErr || !course) {
      setMessage({ type: "error", text: courseErr?.message || "Failed to create course." });
      setLoading(false);
      return;
    }

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

    const videoPayload: any = {
      lesson_id: lesson.id,
      youtube_video_id: (youtubeUrl && videoId) ? videoId : "",
      bunny_video_id: bunnyVideoId.trim() || null,
    };

    const { error: vidErr } = await supabase
      .from("lms_videos")
      .insert(videoPayload);
    if (vidErr) { setMessage({ type: "error", text: vidErr.message }); setLoading(false); return; }

    if (pdfUrl) {
      await supabase.from("lms_pdf_resources").insert({
        lesson_id: lesson.id, course_id: course.id,
        title: `${title} notes`, storage_path: pdfUrl,
      });
    }

    // Trigger notification to all registered users if published
    if (published) {
      try {
        await notifyAllUsersNewCourse(title, courseSlug);
      } catch (err) {
        console.error("Error creating new course notification:", err);
      }
    }

    setLoading(false);
    setMessage({ type: "success", text: `"${title}" added successfully! Refreshing…` });
    setTimeout(() => { close(); window.location.reload(); }, 1200);
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
          subtitle="Fill in the details — it will appear in the course catalog."
          fields={{ title, youtubeUrl, bunnyVideoId, pdfUrl, isFree, price, published, thumbnailUrl, description, sortOrder }}
          setters={{
            setTitle, setYoutubeUrl, setBunnyVideoId, setPdfUrl,
            setIsFree: (val: boolean) => {
              setIsFree(val);
              if (val) setPrice("0");
              else if (price === "0") setPrice("199");
            },
            setPrice,
            setPublished, setThumbnailUrl, setDescription, setSortOrder
          }}
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
  bunnyVideoId?: string;
  pdfUrl: string;
  price: number;
  published: boolean;
  thumbnailUrl: string;
  description: string;
  sortOrder: number;
};

export function EditCourseModal({ course, onDone }: { course: EditableCourse; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(course.title);
  const [youtubeUrl, setYoutubeUrl] = useState(course.youtubeUrl);
  const [bunnyVideoId, setBunnyVideoId] = useState(course.bunnyVideoId ?? "");
  const [pdfUrl, setPdfUrl] = useState(course.pdfUrl);
  const [isFree, setIsFree] = useState(course.price === 0);
  const [price, setPrice] = useState(String(course.price));
  const [published, setPublished] = useState(course.published ?? true);
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnailUrl);
  const [description, setDescription] = useState(course.description);
  const [sortOrder, setSortOrder] = useState(String(course.sortOrder));
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync state whenever course prop or open changes
  useEffect(() => {
    if (open) {
      setTitle(course.title);
      setYoutubeUrl(course.youtubeUrl);
      setBunnyVideoId(course.bunnyVideoId ?? "");
      setPdfUrl(course.pdfUrl);
      setIsFree(course.price === 0);
      setPrice(String(course.price));
      setPublished(course.published ?? true);
      setThumbnailUrl(course.thumbnailUrl);
      setDescription(course.description ?? "");
      setSortOrder(String(course.sortOrder ?? 1));
      setMessage(null);
    }
  }, [open, course]);

  function close() { setOpen(false); setMessage(null); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title || (!youtubeUrl && !bunnyVideoId)) {
      setMessage({ type: "error", text: "Course name and a video (YouTube link or Bunny Video ID) are required." });
      return;
    }
    setLoading(true); setMessage(null);
    const supabase = createClient();
    const videoId = youtubeUrl ? getYoutubeId(youtubeUrl) : null;
    const finalThumb = thumbnailUrl.trim() || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "");
    const finalPrice = isFree ? 0 : (Number(price) || 0);

    const baseUpdate: any = {
      title,
      description,
      thumbnail_url: finalThumb,
      youtube_url: youtubeUrl || null,
      pdf_url: pdfUrl || null,
      price_inr: finalPrice,
      published,
      sort_order: Number(sortOrder) || 1,
    };

    // Update course row with fallback
    let { error: courseErr } = await supabase
      .from("lms_courses")
      .update({ ...baseUpdate, is_free: isFree })
      .eq("id", course.id);

    if (courseErr && courseErr.message.includes("is_free")) {
      const fallbackRes = await supabase
        .from("lms_courses")
        .update(baseUpdate)
        .eq("id", course.id);
      courseErr = fallbackRes.error;
    }

    if (courseErr) { setMessage({ type: "error", text: courseErr.message }); setLoading(false); return; }

    // Find existing module & lesson for this course
    const { data: existingModules } = await supabase
      .from("lms_modules")
      .select("id")
      .eq("course_id", course.id);

    const moduleIds = (existingModules ?? []).map((m) => m.id);
    let targetModuleId: string | null = moduleIds[0] ?? null;
    let lessonId: string | null = null;

    if (moduleIds.length > 0) {
      const { data: existingLessons } = await supabase
        .from("lms_lessons")
        .select("id")
        .in("module_id", moduleIds)
        .limit(1);
      lessonId = existingLessons?.[0]?.id ?? null;
    }

    if (!targetModuleId) {
      const { data: newModule, error: modErr } = await supabase
        .from("lms_modules")
        .insert({ course_id: course.id, title: "Course Video", sort_order: 1 })
        .select("id").single();

      if (modErr) { setMessage({ type: "error", text: modErr.message }); setLoading(false); return; }
      targetModuleId = newModule.id;
    }

    if (!lessonId && targetModuleId) {
      const { data: newLesson, error: lesErr } = await supabase
        .from("lms_lessons")
        .insert({ module_id: targetModuleId, title, slug: "main-video", description, sort_order: 1, published: true })
        .select("id").single();

      if (lesErr) { setMessage({ type: "error", text: lesErr.message }); setLoading(false); return; }
      lessonId = newLesson.id;
    }

    // Upsert video
    if (lessonId) {
      const { data: existingVideo } = await supabase
        .from("lms_videos")
        .select("id")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      const videoPayload: any = {
        youtube_video_id: videoId || "",
        bunny_video_id: bunnyVideoId.trim() || null,
      };

      if (existingVideo) {
        await supabase.from("lms_videos")
          .update(videoPayload)
          .eq("lesson_id", lessonId);
      } else {
        await supabase.from("lms_videos")
          .insert({ lesson_id: lessonId, ...videoPayload });
      }
    }

    // Upsert PDF resource
    if (pdfUrl && lessonId) {
      await supabase.from("lms_pdf_resources")
        .upsert({ course_id: course.id, lesson_id: lessonId, title: `${title} notes`, storage_path: pdfUrl }, { onConflict: "course_id" });
    }

    setLoading(false);
    setMessage({ type: "success", text: "Course updated successfully! Refreshing…" });
    setTimeout(() => { close(); onDone(); window.location.reload(); }, 1200);
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
          fields={{ title, youtubeUrl, bunnyVideoId, pdfUrl, isFree, price, published, thumbnailUrl, description, sortOrder }}
          setters={{
            setTitle, setYoutubeUrl, setBunnyVideoId, setPdfUrl,
            setIsFree: (val: boolean) => {
              setIsFree(val);
              if (val) setPrice("0");
              else if (price === "0") setPrice("199");
            },
            setPrice,
            setPublished, setThumbnailUrl, setDescription, setSortOrder
          }}
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
  fields: {
    title: string; youtubeUrl: string; bunnyVideoId: string; pdfUrl: string;
    isFree: boolean; price: string; published: boolean; thumbnailUrl: string;
    description: string; sortOrder: string;
  };
  setters: {
    setTitle: (v: string) => void;
    setYoutubeUrl: (v: string) => void;
    setBunnyVideoId: (v: string) => void;
    setPdfUrl: (v: string) => void;
    setIsFree: (v: boolean) => void;
    setPrice: (v: string) => void;
    setPublished: (v: boolean) => void;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-lg rounded-[2rem] bg-white shadow-2xl dark:bg-[#0e1f18] max-h-[95vh] flex flex-col border border-forest/10 dark:border-white/10"
        onKeyDown={(e) => e.stopPropagation()}
      >
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
            <div className="rounded-2xl overflow-hidden border border-forest/10 dark:border-white/10 aspect-video bg-black/5">
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

          {/* Published vs Hidden Toggle */}
          <div className="flex items-center justify-between rounded-2xl bg-linen p-4 dark:bg-white/5 border border-forest/10 dark:border-white/10">
            <div>
              <p className="text-xs font-bold text-forest dark:text-cream uppercase tracking-wide flex items-center gap-1.5">
                {fields.published ? <Eye size={14} className="text-leaf" /> : <EyeOff size={14} className="text-amber-500" />}
                Course Visibility
              </p>
              <p className="text-[11px] text-ink/55 dark:text-cream/55 mt-0.5">
                {fields.published ? "Visible in public catalog for students" : "Hidden (Draft mode) — Only visible to admins"}
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={fields.published}
                onChange={(e) => setters.setPublished(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-300 dark:bg-white/20 after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-leaf peer-checked:after:translate-x-full" />
            </label>
          </div>

          {/* Free Course Checkbox */}
          <div className="flex items-center justify-between rounded-2xl bg-linen p-4 dark:bg-white/5 border border-forest/10 dark:border-white/10">
            <div>
              <p className="text-xs font-bold text-forest dark:text-cream uppercase tracking-wide">
                Free Course Option
              </p>
              <p className="text-[11px] text-ink/55 dark:text-cream/55 mt-0.5">
                Check this if the course is 100% free for all students
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fields.isFree}
                onChange={(e) => setters.setIsFree(e.target.checked)}
                className="size-4 rounded accent-leaf cursor-pointer"
              />
              <span className="text-xs font-black text-leaf uppercase">FREE</span>
            </label>
          </div>

          <Field label="Bunny Stream Video ID (Recommended)" hint="Found in Bunny Stream dashboard under Video ID. Priority streaming.">
            <div className={wrapCls}>
              <span className="shrink-0 text-sm font-black text-amber-500">🐰</span>
              <input
                value={fields.bunnyVideoId}
                onChange={(e) => setters.setBunnyVideoId(e.target.value)}
                placeholder="e.g. 8f7d9a12-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className={inputCls}
              />
            </div>
          </Field>

          <Field label="YouTube Link (Fallback / Alternative)">
            <div className={wrapCls}>
              <Youtube size={17} className="shrink-0 text-red-500" />
              <input
                value={fields.youtubeUrl}
                onChange={(e) => setters.setYoutubeUrl(e.target.value)}
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
              <div className={`${wrapCls} ${fields.isFree ? "opacity-50 pointer-events-none bg-black/5" : ""}`}>
                <IndianRupee size={17} className="shrink-0 text-leaf" />
                <input
                  value={fields.isFree ? "0" : fields.price}
                  onChange={(e) => setters.setPrice(e.target.value)}
                  disabled={fields.isFree}
                  type="number" min="0"
                  placeholder="199"
                  className={inputCls + " font-semibold"}
                />
              </div>
            </Field>

            <Field label="Position (Order)" hint="Lower = appears first (1, 2, 3...)">
              <div className={wrapCls}>
                <span className="shrink-0 text-sm font-black text-leaf">#</span>
                <input
                  value={fields.sortOrder}
                  onChange={(e) => setters.setSortOrder(e.target.value)}
                  type="number" min="1"
                  placeholder="1"
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
