"use client";

import { useEffect, useState } from "react";
import { Star, Plus, X, MessageSquareHeart, CheckCircle2, Sparkles, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  getTestimonialReviews,
  submitTestimonialReview,
  StudentReview,
} from "@/app/actions/testimonials";

export function TestimonialsSection() {
  const [list, setList] = useState<StudentReview[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  // 3-SECOND AUTO-ROTATING LOOP
  useEffect(() => {
    if (list.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % list.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [list.length, isPaused]);

  async function loadReviews() {
    setLoading(true);
    const reviews = await getTestimonialReviews();
    setList(reviews);
    setLoading(false);
  }

  function nextReview() {
    if (list.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % list.length);
  }

  function prevReview() {
    if (list.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + list.length) % list.length);
  }

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await submitTestimonialReview(name, role, quote, rating);
    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      const initials = name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      const newItem: StudentReview = {
        name: name.trim(),
        role: role.trim() || "Student Maker",
        quote: quote.trim(),
        avatar: initials || "ST",
        rating,
        isNew: true,
      };

      setList((prev) => [newItem, ...prev]);
      setActiveIndex(0);
      setSuccessMsg("Thank you! Your review has been published. 🎉");

      setTimeout(() => {
        setSuccessMsg(null);
        setShowModal(false);
        setName("");
        setRole("");
        setQuote("");
        setRating(5);
      }, 1600);
    }
  }

  // Get active items to display (responsive sliding window)
  const getVisibleCards = () => {
    if (list.length === 0) return [];
    if (list.length === 1) return [list[0]];
    if (list.length === 2) {
      return [list[activeIndex % 2], list[(activeIndex + 1) % 2]];
    }
    // 3 or more: show 3 items starting from activeIndex
    return [
      list[activeIndex % list.length],
      list[(activeIndex + 1) % list.length],
      list[(activeIndex + 2) % list.length],
    ];
  };

  const visibleReviews = getVisibleCards();

  return (
    <section className="bg-forest text-cream py-8 sm:py-10 my-6 rounded-2xl sm:rounded-[2rem] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Header with Title & Add Review Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
        <div className="text-center sm:text-left">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Student & Maker Feedback</p>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">What Our Makers Say</h2>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-xs font-black shadow-lg transition-transform hover:scale-105 shrink-0 cursor-pointer"
        >
          <Plus size={15} /> Add Your Review
        </button>
      </div>

      {/* 3-Second Looping Reviews Display */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-xs text-cream/60">
          <Loader2 size={16} className="animate-spin text-emerald-400" />
          <span>Loading verified student reviews...</span>
        </div>
      ) : list.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-400">
            <MessageSquareHeart size={22} />
          </div>
          <h3 className="text-base font-black text-white">
            Be the first to share your learning experience!
          </h3>
          <p className="text-xs text-cream/70 max-w-md mx-auto leading-relaxed">
            Have you completed a formulation class? Share your practical experience, batch recipes, and product results to inspire fellow makers.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 text-xs font-black shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <Plus size={14} /> Add the First Review
            </button>
          </div>
        </div>
      ) : (
        <div
          className="relative group px-1 sm:px-2 py-1"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Card Grid with Smooth Animation */}
          <div
            className={`grid gap-4 sm:gap-6 ${
              visibleReviews.length === 1
                ? "max-w-md mx-auto"
                : visibleReviews.length === 2
                ? "sm:grid-cols-2 max-w-3xl mx-auto"
                : "md:grid-cols-3"
            } transition-all duration-500 animate-in fade-in`}
          >
            {visibleReviews.map((item, idx) => (
              <div
                key={`${item.id || item.name}-${idx}-${activeIndex}`}
                className={`rounded-2xl p-4 sm:p-5 border flex flex-col justify-between transition-all duration-500 hover:scale-[1.01] ${
                  item.isNew
                    ? "bg-emerald-500/20 border-emerald-400/40 shadow-lg ring-1 ring-emerald-400/30"
                    : "bg-white/10 border-white/15 shadow-md"
                }`}
              >
                <div>
                  {/* Rating stars & Verified Learner badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                    </div>
                    {item.isNew ? (
                      <span className="text-[9px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles size={10} /> New
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-white/15 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified Learner
                      </span>
                    )}
                  </div>

                  {/* Quote text */}
                  <p className="text-xs sm:text-sm leading-relaxed text-cream/90 italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                {/* Author Footer */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-emerald-500 text-white font-black text-xs shrink-0 shadow-md">
                    {item.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-emerald-300 font-semibold truncate max-w-[200px]" title={item.role}>
                      {item.role || "Verified Student"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows & Live 3-Sec Progress Indicator */}
          {list.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevReview}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 grid size-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition border border-white/20 shadow-xl cursor-pointer"
                aria-label="Previous review"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={nextReview}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 grid size-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition border border-white/20 shadow-xl cursor-pointer"
                aria-label="Next review"
              >
                <ChevronRight size={18} />
              </button>

              {/* Loop Dots Indicator (Looping every 3s) */}
              <div className="mt-5 flex justify-center items-center gap-1.5">
                {list.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeIndex
                        ? "w-6 bg-emerald-400 shadow-sm"
                        : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                    aria-label={`Go to review ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Add Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-gray-900 dark:text-cream">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111b21] p-6 shadow-2xl border border-gray-200 dark:border-white/10 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <MessageSquareHeart size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-forest dark:text-cream">Write a Review</h3>
                  <p className="text-[11px] text-gray-500 dark:text-cream/60">Share your academy experience</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="grid size-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-xs font-bold text-red-600 border border-red-500/20">
                {errorMsg}
              </div>
            )}

            {successMsg ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500 animate-bounce" />
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4">
                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-cream/50 mb-1.5">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:scale-125 transition cursor-pointer"
                      >
                        <Star size={22} fill={star <= rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-cream mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#202c33] px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:text-cream"
                  />
                </div>

                {/* Role / Course */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-cream mb-1">
                    Role / Course Taken (Optional)
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Soap Base Making Student"
                    className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#202c33] px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:text-cream"
                  />
                </div>

                {/* Review Quote */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-cream mb-1">
                    Your Review / Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Share what you loved about our courses or formulation recipes..."
                    className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#202c33] px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:text-cream"
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-xl border border-gray-300 dark:border-white/10 py-2.5 text-xs font-bold text-gray-700 dark:text-cream hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold transition shadow-md cursor-pointer"
                  >
                    {isSubmitting ? "Saving..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
