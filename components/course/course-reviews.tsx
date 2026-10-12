"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquareHeart, Plus, CheckCircle2, Sparkles, Loader2, Award, UserRound } from "lucide-react";
import { getTestimonialReviews, submitTestimonialReview, type StudentReview } from "@/app/actions/testimonials";

export function CourseReviews({
  courseTitle,
  courseSlug,
}: {
  courseTitle: string;
  courseSlug: string;
}) {
  const [reviews, setReviews] = useState<StudentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [courseTitle]);

  async function loadReviews() {
    setLoading(true);
    const data = await getTestimonialReviews(courseTitle);
    setReviews(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;

    setSubmitting(true);
    setError(null);

    const res = await submitTestimonialReview(
      name,
      role,
      quote,
      rating,
      courseTitle,
      courseSlug
    );

    setSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      const initials = name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      const newReview: StudentReview = {
        name: name.trim(),
        role: `${role.trim() || "Student"} • ${courseTitle}`,
        quote: quote.trim(),
        avatar: initials || "ST",
        rating,
        isNew: true,
      };

      setReviews((prev) => [newReview, ...prev]);

      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
        setName("");
        setRole("");
        setQuote("");
        setRating(5);
      }, 1800);
    }
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <div className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest/10 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MessageSquareHeart size={18} />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream">
              Student Reviews & Experiences
            </h2>
          </div>
          <p className="text-xs text-ink/60 dark:text-cream/60 mt-1">
            Real feedback from formulation learners who took <b>{courseTitle}</b>.
          </p>
        </div>

        {/* Rating score badge & Add review toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-linen dark:bg-white/10 px-3.5 py-2 border border-forest/5 dark:border-white/5">
            <div className="flex text-amber-400">
              <Star size={16} fill="currentColor" />
            </div>
            <span className="text-sm font-black text-forest dark:text-cream">{avgRating}</span>
            <span className="text-xs text-ink/40 dark:text-cream/40">({reviews.length} reviews)</span>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest hover:bg-leaf text-white px-4 py-2 text-xs font-black shadow-md transition scale-100 hover:scale-105"
            >
              <Plus size={14} /> Write Review
            </button>
          )}
        </div>
      </div>

      {/* ── WRITE REVIEW EXPANDABLE FORM ── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-linen/60 dark:bg-white/[0.04] p-5 sm:p-6 border border-emerald-500/20 shadow-sm space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-forest dark:text-cream flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" /> Share Your Course Experience
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs font-bold text-ink/40 hover:text-forest dark:text-cream/40"
            >
              Cancel
            </button>
          </div>

          {/* Rating Stars Picker */}
          <div>
            <label className="block text-xs font-bold text-forest dark:text-cream mb-1.5">
              Rating *
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 text-amber-400 hover:scale-110 transition"
                >
                  <Star
                    size={22}
                    fill={(hoverRating ?? rating) >= star ? "currentColor" : "none"}
                    className={
                      (hoverRating ?? rating) >= star
                        ? "text-amber-400"
                        : "text-ink/20 dark:text-cream/20"
                    }
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-forest dark:text-cream">
                {rating === 5
                  ? "⭐⭐⭐⭐⭐ Outstanding"
                  : rating === 4
                  ? "⭐⭐⭐⭐ Great"
                  : `${rating} Stars`}
              </span>
            </div>
          </div>

          {/* Inputs Row */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-ink/60 dark:text-cream/60 uppercase mb-1">
                Your Name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sunita Devi"
                required
                className="w-full rounded-xl border border-forest/15 bg-white px-3.5 py-2 text-xs font-medium text-forest outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-white/10 dark:text-cream"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink/60 dark:text-cream/60 uppercase mb-1">
                Role / Title (Optional)
              </label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Home Soap Maker / Beginner"
                className="w-full rounded-xl border border-forest/15 bg-white px-3.5 py-2 text-xs font-medium text-forest outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-white/10 dark:text-cream"
              />
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-[11px] font-bold text-ink/60 dark:text-cream/60 uppercase mb-1">
              Your Review / Formulation Feedback *
            </label>
            <textarea
              rows={3}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="How was the video demonstration, formulation formula, and batch scaling instructions? Did you successfully make your product?"
              required
              className="w-full rounded-xl border border-forest/15 bg-white p-3 text-xs font-medium text-forest outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-white/10 dark:text-cream"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-500/20">
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
              <CheckCircle2 size={15} /> Thank you! Your review was published and is visible on both this course and the homepage.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full px-4 py-2 text-xs font-bold border border-forest/20 text-forest dark:border-white/20 dark:text-cream"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              Submit Review
            </button>
          </div>
        </form>
      )}

      {/* ── REVIEWS LIST ── */}
      {loading ? (
        <div className="py-8 text-center text-xs text-ink/50 dark:text-cream/50">
          Loading student feedback...
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl bg-linen/50 dark:bg-white/5 p-6 text-center space-y-2">
          <p className="text-xs font-bold text-forest dark:text-cream">
            Be the first student to review this course!
          </p>
          <p className="text-[11px] text-ink/60 dark:text-cream/60 max-w-sm mx-auto">
            Share how the formulation recipe worked for your practical batches and inspire future makers.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-forest text-white px-4 py-2 text-xs font-bold"
          >
            <Plus size={13} /> Write the First Review
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.slice(0, 6).map((item, idx) => (
            <div
              key={`${item.id || item.name}-${idx}`}
              className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                item.isNew
                  ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm"
                  : "bg-linen/40 dark:bg-white/[0.03] border-forest/10 dark:border-white/10"
              }`}
            >
              {/* Rating stars & New badge */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex text-amber-400 gap-0.5">
                  {Array.from({ length: item.rating || 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={10} /> Verified Learner
                </span>
              </div>

              {/* Quote */}
              <p className="text-xs sm:text-sm font-medium text-ink/80 dark:text-cream/85 leading-relaxed italic line-clamp-4">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Student info */}
              <div className="mt-3.5 pt-3 border-t border-forest/10 dark:border-white/10 flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-forest/10 dark:bg-white/10 text-forest dark:text-cream grid place-items-center text-xs font-black shrink-0">
                  {item.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-forest dark:text-cream truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-ink/50 dark:text-cream/50 truncate">
                    {item.role || "Verified Student"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
