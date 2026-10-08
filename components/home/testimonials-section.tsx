"use client";

import { useEffect, useState } from "react";
import { Star, Plus, X, MessageSquareHeart, CheckCircle2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getTestimonialReviews,
  submitTestimonialReview,
  StudentReview,
} from "@/app/actions/testimonials";

export function TestimonialsSection() {
  const [list, setList] = useState<StudentReview[]>([]);
  const [page, setPage] = useState(0);
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

  const totalPages = Math.max(1, Math.ceil(list.length / 3));

  // Auto-swipe 3 reviews at a time every 5 seconds
  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalPages]);

  async function loadReviews() {
    setLoading(true);
    const reviews = await getTestimonialReviews();
    setList(reviews);
    setLoading(false);
  }

  function nextPage() {
    setPage((prev) => (prev + 1) % totalPages);
  }

  function prevPage() {
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
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
      setPage(0); // Show page 0 containing the newly added review
      setSuccessMsg("Thank you! Your review has been published permanently. 🎉");

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

  // Get current 3 visible reviews for active page
  const visibleReviews = list.slice(page * 3, page * 3 + 3);

  return (
    <section className="bg-forest text-cream py-8 sm:py-10 my-6 rounded-2xl sm:rounded-[2rem] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Header with Title & Add Review Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 border-b border-white/10 pb-3">
        <div className="text-center sm:text-left">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Student & Buyer Feedback</p>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">What Our Makers Say</h2>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-xs font-black shadow-lg transition-transform hover:scale-105 shrink-0"
        >
          <Plus size={15} /> Add Your Review
        </button>
      </div>

      {/* 3-Card Auto-Swiping Grid */}
      {loading ? (
        <p className="text-center text-xs text-cream/60 py-8">Loading reviews...</p>
      ) : list.length === 0 ? (
        <p className="text-center text-xs text-cream/60 py-8">No reviews available yet.</p>
      ) : (
        <div className="relative group px-1 sm:px-2 py-1">
          {/* 3 Reviews Grid */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3 transition-all duration-500 animate-in fade-in">
            {visibleReviews.map((item, idx) => (
              <div
                key={`${item.id || item.name}-${idx}`}
                className={`rounded-2xl p-4 sm:p-5 border flex flex-col justify-between transition-all duration-300 ${
                  item.isNew
                    ? "bg-emerald-500/20 border-emerald-400/40 shadow-lg ring-1 ring-emerald-400/30"
                    : "bg-white/10 border-white/15 shadow-md"
                }`}
              >
                <div>
                  {/* Rating stars & New badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                    </div>
                    {item.isNew && (
                      <span className="text-[9px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles size={10} /> New
                      </span>
                    )}
                  </div>

                  {/* Quote text */}
                  <p className="text-xs sm:text-sm leading-relaxed text-cream/90 italic">
                    "{item.quote}"
                  </p>
                </div>

                {/* Author Footer */}
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-leaf text-white font-black text-xs shrink-0 shadow-md">
                    {item.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">{item.name}</div>
                    <div className="text-[10px] text-cream/70">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {totalPages > 1 && (
            <>
              <button
                type="button"
                onClick={prevPage}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 grid size-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition border border-white/20 shadow-xl"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={nextPage}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 grid size-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition border border-white/20 shadow-xl"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>

              {/* Slide Dots Indicator */}
              <div className="mt-5 flex justify-center items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPage(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === page ? "w-6 bg-emerald-400 shadow-sm" : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                    aria-label={`Go to page ${idx + 1}`}
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
                className="grid size-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
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
                        className="p-1 text-amber-400 hover:scale-125 transition"
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
                    className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#202c33] px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Role / Course */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-cream mb-1">
                    Role / Course Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Herbal Soap Making Student"
                    className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#202c33] px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                    placeholder="Share what you loved about our courses or products..."
                    className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-[#202c33] px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-xl border border-gray-300 dark:border-white/10 py-2.5 text-xs font-bold text-gray-700 dark:text-cream hover:bg-gray-100 dark:hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold transition shadow-md"
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
