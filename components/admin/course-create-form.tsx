"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2, Image as ImageIcon, IndianRupee,
  Link2, Loader2, Pencil, Plus, Trash2, Upload, X, Youtube, Eye, EyeOff, FileText, Clock, Sparkles, ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Course } from "@/lib/types";
import { notifyAllUsersNewCourse } from "@/app/actions/notifications";
import { computeVariantEnhancements } from "@/lib/course-variants";
import { parsePdfResources, CoursePdfResource } from "@/lib/course-pdfs";

export type PdfMaterialItem = {
  id: string;
  title: string;
  url: string;
  description?: string;
};

export function parseInitialPdfs(rawPdfResources: any, fallbackPdfUrl?: string | null, courseTitle?: string): PdfMaterialItem[] {
  const parsed = parsePdfResources(rawPdfResources, fallbackPdfUrl, courseTitle);
  return parsed.map((p, idx) => ({
    id: p.id || `pdf_${idx + 1}`,
    title: p.title || `Formulation Material ${idx + 1}`,
    url: p.url,
    description: p.description || "",
  }));
}

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

export type DurationVariantItem = {
  id: string;
  name: string;
  price: string;
  isDefault?: boolean;
};

const DEFAULT_VARIANTS: DurationVariantItem[] = [
  { id: "var_6m", name: "6 Months Access", price: "199", isDefault: true },
  { id: "var_1y", name: "1 Year Access", price: "299", isDefault: false },
];

/* ─────────────────── ADD modal ─────────────────── */
export function AddCourseModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [bunnyVideoId, setBunnyVideoId] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfMaterials, setPdfMaterials] = useState<PdfMaterialItem[]>([]);
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("199");
  const [price1Year, setPrice1Year] = useState("");
  const [variants, setVariants] = useState<DurationVariantItem[]>(DEFAULT_VARIANTS);
  const [published, setPublished] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("1");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setTitle(""); setYoutubeUrl(""); setBunnyVideoId(""); setPdfUrl(""); setPdfMaterials([]);
    setIsFree(false); setPrice("199"); setPrice1Year(""); setVariants(DEFAULT_VARIANTS); setPublished(true);
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
    const defaultVar = variants.find((v) => v.isDefault) || variants[0];
    const finalPrice = isFree ? 0 : (Number(defaultVar?.price) || Number(price) || 0);
    const oneYearVar = variants.find((v) => v.name.toLowerCase().includes("1 year") || v.name.toLowerCase().includes("12 month"));
    const final1YearPrice = isFree ? null : (oneYearVar ? Number(oneYearVar.price) : (price1Year ? Number(price1Year) : null));
    const variantsPayload = isFree
      ? []
      : variants.map((v, i) => ({
          id: v.id || `plan_${i + 1}`,
          name: v.name.trim(),
          price_inr: Number(v.price) || 0,
          is_default: Boolean(v.isDefault),
        }));

    const validPdfs = pdfMaterials.filter((p) => p.url && p.url.trim().length > 0);
    const primaryPdfUrl = validPdfs[0]?.url || (pdfUrl.trim() || null);

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
      pdf_url: primaryPdfUrl,
      pdf_resources: validPdfs,
      price_inr: finalPrice,
      price_1year_inr: final1YearPrice,
      duration_variants: variantsPayload,
      published,
      sort_order: Number(sortOrder) || 1,
    };

    let course: any = null;
    let courseErr: any = null;

    // Try upsert with duration_variants, pdf_resources, price_1year_inr, and is_free
    let res = await supabase
      .from("lms_courses")
      .upsert({ ...basePayload, is_free: isFree }, { onConflict: "slug" })
      .select("id")
      .single();

    if (res.error && res.error.message.includes("pdf_resources")) {
      delete basePayload.pdf_resources;
      res = await supabase
        .from("lms_courses")
        .upsert({ ...basePayload, is_free: isFree }, { onConflict: "slug" })
        .select("id")
        .single();
    }

    if (res.error && res.error.message.includes("duration_variants")) {
      delete basePayload.duration_variants;
      res = await supabase
        .from("lms_courses")
        .upsert({ ...basePayload, is_free: isFree }, { onConflict: "slug" })
        .select("id")
        .single();
    }

    if (res.error && res.error.message.includes("price_1year_inr")) {
      delete basePayload.price_1year_inr;
      res = await supabase
        .from("lms_courses")
        .upsert({ ...basePayload, is_free: isFree }, { onConflict: "slug" })
        .select("id")
        .single();
    }

    if (res.error && res.error.message.includes("is_free")) {
      delete basePayload.is_free;
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

    // Insert all PDFs into lms_pdf_resources table
    if (validPdfs.length > 0) {
      for (const pdfItem of validPdfs) {
        await supabase.from("lms_pdf_resources").insert({
          lesson_id: lesson.id,
          course_id: course.id,
          title: pdfItem.title || `${title} notes`,
          storage_path: pdfItem.url,
          downloadable: true,
        });
      }
    } else if (primaryPdfUrl) {
      await supabase.from("lms_pdf_resources").insert({
        lesson_id: lesson.id,
        course_id: course.id,
        title: `${title} notes`,
        storage_path: primaryPdfUrl,
        downloadable: true,
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
          fields={{ title, youtubeUrl, bunnyVideoId, pdfUrl, pdfMaterials, isFree, price, price1Year, variants, published, thumbnailUrl, description, sortOrder }}
          setters={{
            setTitle, setYoutubeUrl, setBunnyVideoId, setPdfUrl, setPdfMaterials,
            setIsFree: (val: boolean) => {
              setIsFree(val);
              if (val) { setPrice("0"); setPrice1Year(""); }
              else if (price === "0") setPrice("199");
            },
            setPrice, setPrice1Year, setVariants,
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
function parseInitialVariants(rawVariants: any, basePrice: number, price1Year?: number): DurationVariantItem[] {
  if (Array.isArray(rawVariants) && rawVariants.length > 0) {
    return rawVariants.map((v, i) => ({
      id: String(v.id || `plan_${i + 1}`),
      name: String(v.name || "Access Plan"),
      price: String(v.price_inr ?? v.price ?? basePrice),
      isDefault: Boolean(v.is_default ?? v.isDefault ?? i === 0),
    }));
  }
  const items: DurationVariantItem[] = [
    { id: "var_6m", name: "6 Months Access", price: String(basePrice || 199), isDefault: true },
  ];
  if (price1Year && Number(price1Year) > 0) {
    items.push({ id: "var_1y", name: "1 Year Access", price: String(price1Year), isDefault: false });
  } else {
    items.push({ id: "var_1y", name: "1 Year Access", price: String(Math.round((basePrice || 199) * 1.5)), isDefault: false });
  }
  return items;
}

type EditableCourse = {
  id: string;
  slug: string;
  title: string;
  youtubeUrl: string;
  bunnyVideoId?: string;
  pdfUrl: string;
  pdfResources?: any;
  price: number;
  price1Year?: number;
  durationVariants?: any;
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
  const [pdfMaterials, setPdfMaterials] = useState<PdfMaterialItem[]>(() =>
    parseInitialPdfs(course.pdfResources, course.pdfUrl, course.title)
  );
  const [isFree, setIsFree] = useState(course.price === 0);
  const [price, setPrice] = useState(String(course.price));
  const [price1Year, setPrice1Year] = useState(course.price1Year ? String(course.price1Year) : "");
  const [variants, setVariants] = useState<DurationVariantItem[]>(() =>
    parseInitialVariants(course.durationVariants, course.price, course.price1Year)
  );
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
      setPdfMaterials(parseInitialPdfs(course.pdfResources, course.pdfUrl, course.title));
      setIsFree(course.price === 0);
      setPrice(String(course.price));
      setPrice1Year(course.price1Year ? String(course.price1Year) : "");
      setVariants(parseInitialVariants(course.durationVariants, course.price, course.price1Year));
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
    const defaultVar = variants.find((v) => v.isDefault) || variants[0];
    const finalPrice = isFree ? 0 : (Number(defaultVar?.price) || Number(price) || 0);
    const oneYearVar = variants.find((v) => v.name.toLowerCase().includes("1 year") || v.name.toLowerCase().includes("12 month"));
    const final1YearPrice = isFree ? null : (oneYearVar ? Number(oneYearVar.price) : (price1Year ? Number(price1Year) : null));
    const variantsPayload = isFree
      ? []
      : variants.map((v, i) => ({
          id: v.id || `plan_${i + 1}`,
          name: v.name.trim(),
          price_inr: Number(v.price) || 0,
          is_default: Boolean(v.isDefault),
        }));

    const validPdfs = pdfMaterials.filter((p) => p.url && p.url.trim().length > 0);
    const primaryPdfUrl = validPdfs[0]?.url || (pdfUrl.trim() || null);

    const baseUpdate: any = {
      title,
      description,
      thumbnail_url: finalThumb,
      youtube_url: youtubeUrl || null,
      pdf_url: primaryPdfUrl,
      pdf_resources: validPdfs,
      price_inr: finalPrice,
      price_1year_inr: final1YearPrice,
      duration_variants: variantsPayload,
      published,
      sort_order: Number(sortOrder) || 1,
    };

    // Update course row with fallback
    let { error: courseErr } = await supabase
      .from("lms_courses")
      .update({ ...baseUpdate, is_free: isFree })
      .eq("id", course.id);

    if (courseErr && courseErr.message.includes("pdf_resources")) {
      delete baseUpdate.pdf_resources;
      const res = await supabase
        .from("lms_courses")
        .update({ ...baseUpdate, is_free: isFree })
        .eq("id", course.id);
      courseErr = res.error;
    }

    if (courseErr && courseErr.message.includes("duration_variants")) {
      delete baseUpdate.duration_variants;
      const res = await supabase
        .from("lms_courses")
        .update({ ...baseUpdate, is_free: isFree })
        .eq("id", course.id);
      courseErr = res.error;
    }

    if (courseErr && courseErr.message.includes("price_1year_inr")) {
      delete baseUpdate.price_1year_inr;
      const res = await supabase
        .from("lms_courses")
        .update({ ...baseUpdate, is_free: isFree })
        .eq("id", course.id);
      courseErr = res.error;
    }

    if (courseErr && courseErr.message.includes("is_free")) {
      delete baseUpdate.is_free;
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

    // Upsert PDF resources to lms_pdf_resources table
    if (lessonId) {
      await supabase.from("lms_pdf_resources").delete().eq("course_id", course.id);
      if (validPdfs.length > 0) {
        for (const pdfItem of validPdfs) {
          await supabase.from("lms_pdf_resources").insert({
            course_id: course.id,
            lesson_id: lessonId,
            title: pdfItem.title || `${title} notes`,
            storage_path: pdfItem.url,
            downloadable: true,
          });
        }
      } else if (primaryPdfUrl) {
        await supabase.from("lms_pdf_resources").insert({
          course_id: course.id,
          lesson_id: lessonId,
          title: `${title} notes`,
          storage_path: primaryPdfUrl,
          downloadable: true,
        });
      }
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
          fields={{ title, youtubeUrl, bunnyVideoId, pdfUrl, pdfMaterials, isFree, price, price1Year, variants, published, thumbnailUrl, description, sortOrder }}
          setters={{
            setTitle, setYoutubeUrl, setBunnyVideoId, setPdfUrl, setPdfMaterials,
            setIsFree: (val: boolean) => {
              setIsFree(val);
              if (val) { setPrice("0"); setPrice1Year(""); }
              else if (price === "0") setPrice("199");
            },
            setPrice, setPrice1Year, setVariants,
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
    pdfMaterials: PdfMaterialItem[];
    isFree: boolean; price: string; price1Year: string; variants: DurationVariantItem[]; published: boolean; thumbnailUrl: string;
    description: string; sortOrder: string;
  };
  setters: {
    setTitle: (v: string) => void;
    setYoutubeUrl: (v: string) => void;
    setBunnyVideoId: (v: string) => void;
    setPdfUrl: (v: string) => void;
    setPdfMaterials: (v: PdfMaterialItem[]) => void;
    setIsFree: (v: boolean) => void;
    setPrice: (v: string) => void;
    setPrice1Year: (v: string) => void;
    setVariants: (v: DurationVariantItem[]) => void;
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
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingPdf(true);
    setUploadError(null);
    try {
      const newItems: PdfMaterialItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/community/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }
        const cleanTitle = file.name
          .replace(/\.pdf$/i, "")
          .replace(/[-_]/g, " ")
          .trim();
        newItems.push({
          id: `pdf_${Date.now()}_${i}`,
          title: cleanTitle ? (cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)) : "Course Formulation Guide",
          url: data.url,
          description: "",
        });
      }
      if (newItems.length === 0) {
        throw new Error("No valid PDF files were selected.");
      }
      const updated = [...fields.pdfMaterials, ...newItems];
      setters.setPdfMaterials(updated);
      if (!fields.pdfUrl && updated.length > 0) {
        setters.setPdfUrl(updated[0].url);
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload PDF file");
    } finally {
      setUploadingPdf(false);
      e.target.value = "";
    }
  }

  function addEmptyPdfItem(presetTitle = "") {
    const next: PdfMaterialItem[] = [
      ...fields.pdfMaterials,
      {
        id: `pdf_${Date.now()}`,
        title: presetTitle || `Material #${fields.pdfMaterials.length + 1}`,
        url: "",
        description: "",
      },
    ];
    setters.setPdfMaterials(next);
  }

  function removePdfItem(index: number) {
    const next = fields.pdfMaterials.filter((_, idx) => idx !== index);
    setters.setPdfMaterials(next);
    setters.setPdfUrl(next[0]?.url || "");
  }

  function updatePdfItem(index: number, patch: Partial<PdfMaterialItem>) {
    const next = fields.pdfMaterials.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
    setters.setPdfMaterials(next);
    if (patch.url && index === 0) {
      setters.setPdfUrl(patch.url);
    }
  }

  const videoId = fields.youtubeUrl ? getYoutubeId(fields.youtubeUrl) : null;
  const previewThumb = fields.thumbnailUrl.trim()
    || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);

  const liveEnhancedVariants = useMemo(() => {
    const list = fields.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price) || 0,
      isDefault: v.isDefault,
    }));
    return computeVariantEnhancements(list);
  }, [fields.variants]);

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

          {/* Multiple PDF Course Materials Manager */}
          <div className="rounded-2xl border border-forest/15 dark:border-white/15 bg-linen/50 dark:bg-white/5 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
              <div>
                <label className="text-xs font-bold text-forest dark:text-cream uppercase tracking-wide flex items-center gap-1.5">
                  <FileText size={14} className="text-leaf" />
                  Course PDF Materials & Guides ({fields.pdfMaterials.length})
                </label>
                <p className="text-[11px] text-ink/55 dark:text-cream/55">
                  Attach multiple formulation recipe sheets, ingredient source lists, or safety guides. Only enrolled students can download them.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="multi-pdf-upload-input"
                  accept="application/pdf,.pdf"
                  multiple
                  className="hidden"
                  onChange={handlePdfUpload}
                  disabled={uploadingPdf}
                />
                <label
                  htmlFor="multi-pdf-upload-input"
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-forest/15 dark:border-white/15 px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    uploadingPdf
                      ? "bg-forest/10 text-forest cursor-wait"
                      : "bg-white dark:bg-white/10 text-forest dark:text-cream hover:bg-forest/5 shadow-xs"
                  }`}
                >
                  {uploadingPdf ? <Loader2 size={13} className="animate-spin text-leaf" /> : <Upload size={13} className="text-leaf" />}
                  {uploadingPdf ? "Uploading..." : "Upload PDF(s)"}
                </label>
                <button
                  type="button"
                  onClick={() => addEmptyPdfItem()}
                  className="inline-flex items-center gap-1 rounded-xl bg-forest/10 hover:bg-forest/15 text-forest dark:bg-white/10 dark:text-cream px-3 py-1.5 text-xs font-bold transition"
                >
                  <Plus size={13} /> Add Link
                </button>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded-xl border border-red-200 dark:border-red-900/40">
                {uploadError}
              </p>
            )}

            {/* Quick Formulation Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-ink/40 dark:text-cream/40 uppercase">Quick Presets:</span>
              {[
                "Formulation Recipe Sheet",
                "Raw Material Sourcing List",
                "Safety & INCI Specs",
                "Batch Quality Checklist",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addEmptyPdfItem(preset)}
                  className="rounded-lg border border-forest/15 bg-white dark:bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-forest dark:text-cream hover:border-leaf/50 hover:text-leaf transition"
                >
                  + {preset}
                </button>
              ))}
            </div>

            {/* PDF List */}
            {fields.pdfMaterials.length === 0 ? (
              <div className="rounded-xl border border-dashed border-forest/20 dark:border-white/20 p-4 text-center">
                <FileText size={22} className="mx-auto text-ink/30 dark:text-cream/30 mb-1" />
                <p className="text-xs font-semibold text-ink/60 dark:text-cream/60">No PDF documents attached yet.</p>
                <p className="text-[11px] text-ink/40 dark:text-cream/40 mt-0.5">
                  Click <b>Upload PDF(s)</b> to upload files or <b>Add Link</b> to link external document URLs.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {fields.pdfMaterials.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl border border-forest/10 bg-white dark:bg-white/5 dark:border-white/10 space-y-2 shadow-xs transition hover:border-forest/20"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="grid size-5 place-items-center rounded-full bg-forest/10 dark:bg-white/10 text-[10px] font-black text-forest dark:text-cream shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          value={item.title}
                          onChange={(e) => updatePdfItem(idx, { title: e.target.value })}
                          placeholder="Document Title (e.g. Recipe Notes)"
                          className="flex-1 bg-transparent text-xs font-bold text-forest dark:text-cream outline-none placeholder:text-ink/30"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.url && (
                          <a
                            href={`/api/community/download?url=${encodeURIComponent(item.url)}&name=${encodeURIComponent(item.title || "document")}&view=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-leaf hover:underline px-2 py-1 rounded bg-leaf/10"
                            title="Preview PDF"
                          >
                            <ExternalLink size={12} /> Test
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => removePdfItem(idx)}
                          className="text-ink/40 hover:text-red-600 transition p-1"
                          title="Remove PDF"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* PDF URL Input */}
                    <div className="flex items-center gap-2 rounded-lg bg-linen/60 dark:bg-white/5 px-2.5 py-1.5 border border-forest/10 dark:border-white/10">
                      <Link2 size={13} className="shrink-0 text-ink/40 dark:text-cream/40" />
                      <input
                        value={item.url}
                        onChange={(e) => updatePdfItem(idx, { url: e.target.value })}
                        placeholder="PDF File URL (https://... or uploaded file)"
                        className="w-full bg-transparent text-[11px] font-mono outline-none text-ink/80 dark:text-cream/80 placeholder:text-ink/30"
                      />
                    </div>

                    {/* Optional Description / Subtitle */}
                    <input
                      value={item.description || ""}
                      onChange={(e) => updatePdfItem(idx, { description: e.target.value })}
                      placeholder="Optional notes for students (e.g. Includes batch formulation percentages & suppliers)"
                      className="w-full bg-transparent text-[11px] text-ink/60 dark:text-cream/60 outline-none placeholder:text-ink/30 italic"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Access Duration & Pricing Variants */}
          {!fields.isFree ? (
            <div className="rounded-2xl border border-forest/15 dark:border-white/15 bg-linen/50 dark:bg-white/5 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                <div>
                  <label className="text-xs font-bold text-forest dark:text-cream uppercase tracking-wide flex items-center gap-1.5">
                    <Clock size={14} className="text-leaf" />
                    Access Duration & Pricing Variants
                  </label>
                  <p className="text-[11px] text-ink/55 dark:text-cream/55">
                    Add flexible duration plans (e.g. 3 Months, 6 Months, 1 Year, Lifetime). Students can choose from these options.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newId = `var_${Date.now()}`;
                    setters.setVariants([
                      ...fields.variants,
                      { id: newId, name: "Custom Access", price: "249", isDefault: false },
                    ]);
                  }}
                  className="inline-flex items-center gap-1 self-start sm:self-auto rounded-xl bg-forest/10 hover:bg-forest/15 text-forest dark:bg-white/10 dark:text-cream px-3 py-1.5 text-xs font-bold transition"
                >
                  <Plus size={13} /> Add Variant
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-ink/40 dark:text-cream/40 uppercase">Quick Add:</span>
                {[
                  { name: "3 Months Access", price: "149" },
                  { name: "6 Months Access", price: "199" },
                  { name: "1 Year Access", price: "299" },
                  { name: "Lifetime Access", price: "499" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      if (fields.variants.some((v) => v.name.toLowerCase() === preset.name.toLowerCase())) return;
                      setters.setVariants([
                        ...fields.variants,
                        { id: `var_${Date.now()}`, name: preset.name, price: preset.price, isDefault: false },
                      ]);
                    }}
                    className="rounded-lg border border-forest/15 bg-white dark:bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-forest dark:text-cream hover:border-leaf/50 hover:text-leaf transition"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>

              {/* Variant Rows */}
              <div className="space-y-2 pt-1">
                {fields.variants.map((v, idx) => {
                  const enhanced = liveEnhancedVariants[idx];
                  return (
                    <div
                      key={v.id || idx}
                      className={`flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 rounded-xl border transition ${
                        v.isDefault
                          ? "border-leaf/50 bg-leaf/5 shadow-sm"
                          : "border-forest/10 bg-white dark:bg-white/5 dark:border-white/10"
                      }`}
                    >
                      {/* Plan Name */}
                      <div className="flex-1 min-w-[140px] flex items-center gap-1.5 flex-wrap">
                        <input
                          value={v.name}
                          onChange={(e) => {
                            const next = [...fields.variants];
                            next[idx].name = e.target.value;
                            setters.setVariants(next);
                          }}
                          placeholder="e.g. 6 Months Access"
                          className="w-full bg-transparent text-xs font-bold text-forest dark:text-cream outline-none placeholder:text-ink/30"
                        />
                        {/* Live Savings / Best Value indicator pill */}
                        <div className="flex items-center gap-1">
                          {enhanced?.isBestValue && (
                            <span className="rounded bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 shadow-sm shrink-0">
                              Best Value
                            </span>
                          )}
                          {enhanced?.savingsLabel && (
                            <span className="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black px-1.5 py-0.5 border border-emerald-300 dark:border-emerald-700 shrink-0">
                              {enhanced.savingsLabel}
                            </span>
                          )}
                          {enhanced?.monthlyRate ? (
                            <span className="text-[9px] font-semibold text-ink/40 dark:text-cream/40 shrink-0">
                              (₹{enhanced.monthlyRate}/mo)
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-1 bg-linen dark:bg-white/10 px-2.5 py-1 rounded-lg border border-forest/10 dark:border-white/10 w-28 shrink-0">
                        <span className="text-xs font-black text-leaf">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={v.price}
                          onChange={(e) => {
                            const next = [...fields.variants];
                            next[idx].price = e.target.value;
                            setters.setVariants(next);
                          }}
                          placeholder="199"
                          className="w-full bg-transparent text-xs font-bold text-forest dark:text-cream outline-none"
                        />
                      </div>

                      {/* Default Radio */}
                      <button
                        type="button"
                        title="Mark as default plan"
                        onClick={() => {
                          const next = fields.variants.map((item, i) => ({
                            ...item,
                            isDefault: i === idx,
                          }));
                          setters.setVariants(next);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 ${
                          v.isDefault
                            ? "bg-leaf text-white"
                            : "bg-forest/5 text-ink/50 hover:bg-forest/10 dark:bg-white/10 dark:text-cream/60"
                        }`}
                      >
                        {v.isDefault ? "★ Default" : "Make Default"}
                      </button>

                      {/* Delete Button */}
                      {fields.variants.length > 1 && (
                        <button
                          type="button"
                          title="Remove variant"
                          onClick={() => {
                            const next = fields.variants.filter((_, i) => i !== idx);
                            if (v.isDefault && next.length > 0) {
                              next[0].isDefault = true;
                            }
                            setters.setVariants(next);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Smart Pricing Live Feedback Banner */}
              {liveEnhancedVariants.some((v) => v.savingsLabel || v.isBestValue) && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <Sparkles size={14} className="shrink-0 text-emerald-600" />
                  <span>
                    <strong>Smart Upsell Active:</strong> Students will see badges like{" "}
                    {liveEnhancedVariants
                      .filter((v) => v.savingsLabel)
                      .map((v) => `"${v.name} (${v.savingsLabel})"`)
                      .join(", ")}{" "}
                    encouraging them to buy longer access.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-leaf/20 bg-leaf/10 p-3.5 text-xs text-leaf font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> 100% Free Course — Duration is unlimited for all students.
            </div>
          )}

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
