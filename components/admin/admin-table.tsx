"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { parseDurationVariants } from "@/lib/course-variants";
import { parsePdfResources } from "@/lib/course-pdfs";
import type { AdminCourse } from "@/app/admin/courses/page";
import { EditCourseModal } from "@/components/admin/course-create-form";
import {
  Eye, EyeOff, ImageOff, Loader2, Sparkles, Youtube,
  CheckSquare, Square, MoreVertical, Pencil, Trash2, CheckCircle2, X
} from "lucide-react";
import {
  toggleCourseVisibility,
  bulkUpdateCourseVisibility,
  deleteCourse,
  bulkDeleteCourses
} from "@/app/actions/courses";

export function AdminCoursesTable({ courses }: { courses: AdminCourse[] }) {
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "free" | "hidden">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!courses.length) {
    return (
      <div className="rounded-[2rem] bg-white dark:bg-white/5 shadow-soft p-10 text-center">
        <p className="text-sm font-semibold text-ink/60 dark:text-cream/60">
          No courses yet. Add the first course using the button above.
        </p>
      </div>
    );
  }

  const hiddenCount = courses.filter((c) => !c.published).length;
  const freeCount = courses.filter((c) => Boolean((c as any).is_free) || Number(c.price_inr) === 0).length;
  const paidCount = courses.filter((c) => !Boolean((c as any).is_free) && Number(c.price_inr) > 0).length;

  const filteredCourses = courses.filter((c) => {
    if (activeTab === "hidden") return !c.published;
    const isFree = Boolean((c as any).is_free) || Number(c.price_inr) === 0;
    if (activeTab === "paid") return !isFree;
    if (activeTab === "free") return isFree;
    return true;
  });

  const allFilteredSelected =
    filteredCourses.length > 0 && filteredCourses.every((c) => selectedIds.has(c.id));

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAllFiltered() {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCourses.map((c) => c.id)));
    }
  }

  async function handleSingleToggle(courseId: string, currentPublished: boolean) {
    setUpdatingId(courseId);
    setOpenMenuId(null);
    setMessage(null);
    const result = await toggleCourseVisibility(courseId, !currentPublished);
    setUpdatingId(null);
    if (result.error) {
      setMessage(`Error: ${result.error}`);
    } else {
      window.location.reload();
    }
  }

  async function handleSingleDelete(course: AdminCourse) {
    if (!confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
      return;
    }
    setUpdatingId(course.id);
    setOpenMenuId(null);
    setMessage(null);
    const result = await deleteCourse(course.id);
    setUpdatingId(null);
    if (result.error) {
      setMessage(`Delete error: ${result.error}`);
    } else {
      window.location.reload();
    }
  }

  async function handleBulkVisibility(published: boolean) {
    if (selectedIds.size === 0) return;
    setBulkUpdating(true);
    setMessage(null);
    const ids = Array.from(selectedIds);
    const result = await bulkUpdateCourseVisibility(ids, published);
    setBulkUpdating(false);
    if (result.error) {
      setMessage(`Bulk update error: ${result.error}`);
    } else {
      setSelectedIds(new Set());
      window.location.reload();
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected courses? This action cannot be undone.`)) return;
    setBulkUpdating(true);
    setMessage(null);
    const ids = Array.from(selectedIds);
    const result = await bulkDeleteCourses(ids);
    setBulkUpdating(false);
    if (result.error) {
      setMessage(`Bulk delete error: ${result.error}`);
    } else {
      setSelectedIds(new Set());
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs & Select All Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-white/5 border border-forest/10 dark:border-white/10 w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "all"
                ? "bg-forest text-white shadow-sm"
                : "text-ink/60 dark:text-cream/60 hover:text-ink dark:hover:text-cream"
            }`}
          >
            All Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("paid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "paid"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-ink/60 dark:text-cream/60 hover:text-amber-500"
            }`}
          >
            <Sparkles size={14} />
            <span>Premium</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{paidCount}</span>
          </button>
          <button
            onClick={() => setActiveTab("free")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "free"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-ink/60 dark:text-cream/60 hover:text-emerald-500"
            }`}
          >
            <Youtube size={14} />
            <span>Free</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{freeCount}</span>
          </button>
          <button
            onClick={() => setActiveTab("hidden")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "hidden"
                ? "bg-red-600 text-white shadow-sm"
                : "text-ink/60 dark:text-cream/60 hover:text-red-500"
            }`}
          >
            <EyeOff size={14} />
            <span>Hidden ({hiddenCount})</span>
          </button>
        </div>

        {/* Select All checkbox */}
        <button
          onClick={toggleSelectAllFiltered}
          className="inline-flex items-center gap-2 rounded-xl border border-forest/15 bg-white dark:bg-white/5 px-4 py-2 text-xs font-bold text-forest dark:text-cream hover:bg-forest/5 transition"
        >
          {allFilteredSelected ? (
            <CheckSquare size={16} className="text-leaf" />
          ) : (
            <Square size={16} className="text-ink/40 dark:text-cream/40" />
          )}
          <span>{allFilteredSelected ? "Deselect All" : "Select All Courses"}</span>
        </button>
      </div>

      {/* Sticky Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-20 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-forest px-6 py-4 text-white shadow-2xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="grid size-7 place-items-center rounded-full bg-white/20 text-xs font-black">
              {selectedIds.size}
            </span>
            <span className="text-sm font-bold">
              {selectedIds.size} course{selectedIds.size > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkVisibility(false)}
              disabled={bulkUpdating}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-black text-white hover:bg-amber-600 transition disabled:opacity-50"
            >
              {bulkUpdating ? <Loader2 size={14} className="animate-spin" /> : <EyeOff size={14} />}
              Hide Selected
            </button>
            <button
              onClick={() => handleBulkVisibility(true)}
              disabled={bulkUpdating}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {bulkUpdating ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
              Unhide / Publish Selected
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkUpdating}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-700 transition disabled:opacity-50"
            >
              {bulkUpdating ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-cream/80 hover:bg-white/20 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {message}
        </p>
      )}

      {filteredCourses.length === 0 ? (
        <div className="rounded-[2rem] bg-white dark:bg-white/5 shadow-soft p-10 text-center">
          <p className="text-sm font-semibold text-ink/60 dark:text-cream/60">
            No courses found in this view.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isSelected = selectedIds.has(course.id);
            const isMenuOpen = openMenuId === course.id;
            const isBunny = Boolean(course.bunny_video_id);
            const isPremium = course.price_inr > 0 || isBunny;
            const isHidden = !course.published;

            const thumb = course.thumbnail_url
              || (course.youtube_url
                ? `https://img.youtube.com/vi/${extractYtId(course.youtube_url)}/hqdefault.jpg`
                : null);

            return (
              <div
                key={course.id}
                className={`group relative rounded-[2rem] bg-white dark:bg-white/5 shadow-soft overflow-visible flex flex-col border transition-all ${
                  isSelected
                    ? "border-leaf ring-2 ring-leaf/40 shadow-lg"
                    : isHidden
                    ? "border-amber-500/40 opacity-95 bg-amber-500/5 dark:bg-amber-950/10"
                    : "border-forest/5 dark:border-white/5"
                }`}
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video rounded-t-[2rem] bg-forest/5 dark:bg-white/5 overflow-hidden">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={course.title}
                      className={`w-full h-full object-cover transition duration-300 ${
                        isHidden ? "grayscale-[40%] opacity-80" : ""
                      }`}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff size={32} className="text-ink/20 dark:text-cream/20" />
                    </div>
                  )}

                  {/* Multi-Select Checkbox Overlay (Top Left) */}
                  <button
                    onClick={() => toggleSelect(course.id)}
                    className="absolute top-3 left-3 z-10 grid size-8 place-items-center rounded-xl bg-black/60 text-white backdrop-blur transition hover:scale-105"
                    title={isSelected ? "Deselect course" : "Select course"}
                  >
                    {isSelected ? (
                      <CheckSquare size={18} className="text-emerald-400" />
                    ) : (
                      <Square size={18} className="text-white/80" />
                    )}
                  </button>

                  {/* Three-Dots Options Menu Button (Top Right) */}
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      onClick={() => setOpenMenuId(isMenuOpen ? null : course.id)}
                      className="grid size-8 place-items-center rounded-xl bg-black/70 text-white backdrop-blur shadow-md hover:bg-black/90 transition"
                      aria-label="More options"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* Three-Dots Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#0e1f18] p-2 shadow-2xl border border-forest/10 dark:border-white/10 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150"
                        onMouseLeave={() => setOpenMenuId(null)}
                      >
                        <button
                          onClick={() => handleSingleToggle(course.id, course.published)}
                          disabled={updatingId === course.id}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-bold transition hover:bg-forest/5 dark:hover:bg-white/10 text-forest dark:text-cream"
                        >
                          {updatingId === course.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : isHidden ? (
                            <Eye size={14} className="text-emerald-600" />
                          ) : (
                            <EyeOff size={14} className="text-amber-500" />
                          )}
                          <span>{isHidden ? "Unhide / Publish" : "Hide Course"}</span>
                        </button>

                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            setEditingCourse(course);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-bold transition hover:bg-forest/5 dark:hover:bg-white/10 text-forest dark:text-cream"
                        >
                          <Pencil size={14} className="text-leaf" />
                          <span>Edit Details</span>
                        </button>

                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            toggleSelect(course.id);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-bold transition hover:bg-forest/5 dark:hover:bg-white/10 text-forest dark:text-cream"
                        >
                          {isSelected ? <CheckSquare size={14} className="text-leaf" /> : <Square size={14} />}
                          <span>{isSelected ? "Deselect" : "Select for Bulk"}</span>
                        </button>

                        <div className="h-px bg-forest/10 dark:bg-white/10 my-1" />

                        <button
                          onClick={() => handleSingleDelete(course)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                        >
                          <Trash2 size={14} />
                          <span>Delete Course</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Hidden vs Visible Badge on Card */}
                  <span className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-[10px] font-black backdrop-blur shadow-md flex items-center gap-1.5 ${
                    isHidden
                      ? "bg-red-600 text-white border border-red-400/50"
                      : "bg-emerald-600 text-white border border-emerald-400/40"
                  }`}>
                    {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                    {isHidden ? "🔒 HIDDEN (Draft)" : "VISIBLE"}
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex flex-col flex-1 p-4 gap-3">
                  <div className="flex-1">
                    <h3 className="font-black text-forest dark:text-cream leading-tight line-clamp-2">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="mt-1 text-xs text-ink/55 dark:text-cream/55 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                  </div>

                  {/* Individual Price Display */}
                  <div className="flex items-center justify-between border-t border-forest/10 dark:border-white/10 pt-3">
                    <span className="text-lg font-black text-forest dark:text-cream">
                      {course.price_inr > 0 ? formatCurrency(course.price_inr) : <span className="text-leaf font-extrabold">FREE</span>}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-ink/50 dark:text-cream/50 font-semibold">
                      {isBunny ? (
                        <span className="text-amber-500 font-bold">🐰 Bunny</span>
                      ) : course.youtube_url ? (
                        <span>📹 YouTube</span>
                      ) : null}
                      {(() => {
                        const pdfCount = parsePdfResources(course.pdf_resources, course.pdf_url).length;
                        return pdfCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-forest/5 dark:bg-white/10 px-1.5 py-0.5 text-[11px] font-bold text-forest dark:text-cream">
                            📄 {pdfCount} {pdfCount === 1 ? "PDF" : "PDFs"}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  {/* Configured Duration Plan Badges with Smart Pricing Badges */}
                  {Array.isArray(course.duration_variants) && course.duration_variants.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {parseDurationVariants(course.duration_variants, course.price_inr).map((v) => (
                        <span
                          key={v.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-forest/5 dark:bg-white/10 border border-forest/10 dark:border-white/10 px-2 py-0.5 text-[10px] font-bold text-ink/70 dark:text-cream/70"
                        >
                          <span className="text-leaf">●</span> {v.name}: ₹{v.price.toLocaleString("en-IN")}
                          {v.savingsLabel && (
                            <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-[9px]">
                              ({v.savingsLabel})
                            </span>
                          )}
                          {v.isBestValue && (
                            <span className="text-amber-500 font-black text-[9px]">
                              ★ Best Value
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSingleToggle(course.id, course.published)}
                      disabled={updatingId === course.id}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition ${
                        isHidden
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:bg-amber-400/20 dark:text-amber-300"
                      }`}
                    >
                      {updatingId === course.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : isHidden ? (
                        <Eye size={13} />
                      ) : (
                        <EyeOff size={13} />
                      )}
                      <span>{isHidden ? "Unhide" : "Hide"}</span>
                    </button>

                    <button
                      onClick={() => setEditingCourse(course)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-forest/8 dark:bg-white/10 px-3 py-2 text-xs font-bold text-forest dark:text-cream hover:bg-forest/15 dark:hover:bg-white/20 transition"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editing Course Modal controlled by 3-dots or edit button */}
      {editingCourse && (
        <EditCourseModal
          course={{
            id: editingCourse.id,
            slug: editingCourse.slug,
            title: editingCourse.title,
            youtubeUrl: editingCourse.youtube_url ?? "",
            bunnyVideoId: editingCourse.bunny_video_id ?? "",
            pdfUrl: editingCourse.pdf_url ?? "",
            pdfResources: editingCourse.pdf_resources,
            price: editingCourse.price_inr,
            price1Year: editingCourse.price_1year_inr ? Number(editingCourse.price_1year_inr) : undefined,
            durationVariants: editingCourse.duration_variants,
            published: editingCourse.published ?? true,
            thumbnailUrl: editingCourse.thumbnail_url ?? "",
            description: editingCourse.description ?? "",
            sortOrder: editingCourse.sort_order ?? 999,
          }}
          onDone={() => setEditingCourse(null)}
        />
      )}
    </div>
  );
}

function extractYtId(url: string) {
  return url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? url.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1]
    ?? url.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? url;
}
