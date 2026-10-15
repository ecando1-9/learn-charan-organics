"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Sparkles, PlayCircle, ChevronLeft, ChevronRight, Leaf, LogIn, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const slides = [
  {
    id: "courses",
    title: "Master Natural Organic Product Manufacturing",
    description: "Expert-led video lessons complete with PDF formulation sheets, ingredient breakdowns, and step-by-step batch guides.",
    primaryAction: { label: "Browse Courses", href: "/courses", icon: BookOpen },
    secondaryAction: { label: "Watch Free Classes", href: "/#free-classes", icon: PlayCircle },
    badge: "Certified Formulation Training",
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=75&w=1200&auto=format&fit=crop",
    gradient: "from-[#0a2318] via-[#05140e] to-emerald-950"
  },
  {
    id: "community",
    title: "A Thriving Community of Organic Product Makers",
    description: "Join hundreds of formulation students. Share your progress, get expert feedback, and launch your brand together.",
    primaryAction: { label: "Join the Community", href: "/community", icon: Users },
    secondaryAction: { label: "Learn More", href: "/about" },
    badge: "Exclusive Student Network",
    icon: Users,
    image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=75&w=1200&auto=format&fit=crop",
    gradient: "from-[#081e15] via-[#04100b] to-teal-950"
  },
  {
    id: "features",
    title: "Everything You Need to Launch Your Brand",
    description: "Protected HD video streaming, verifiable completion certificates, and lifetime access to enrolled formulation batches.",
    primaryAction: { label: "Get Started", href: "/register", icon: Sparkles },
    secondaryAction: { label: "View Catalog", href: "/courses" },
    badge: "Professional Certification",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=75&w=1200&auto=format&fit=crop",
    gradient: "from-[#09291b] via-[#061810] to-forest"
  }
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Swipe / Drag gesture tracking
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);
  const [mouseStartX, setMouseStartX] = useState<number | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Auto-play timer that pauses when user is interacting
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused, current]);

  function nextSlide() {
    setCurrent((prev) => (prev + 1) % slides.length);
  }

  function prevSlide() {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }

  function handleImageError(id: string) {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  }

  // Touch Swipe Handlers
  function handleTouchStart(e: React.TouchEvent) {
    setIsPaused(true);
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setTouchEndX(null);
    setTouchEndY(null);
  }

  function handleTouchMove(e: React.TouchEvent) {
    setTouchEndX(e.touches[0].clientX);
    setTouchEndY(e.touches[0].clientY);
  }

  function handleTouchEnd() {
    setIsPaused(false);
    if (touchStartX === null || touchEndX === null) return;

    const deltaX = touchStartX - touchEndX;
    const deltaY = (touchStartY ?? 0) - (touchEndY ?? 0);

    // Ensure swipe was primarily horizontal with minimum 40px threshold
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        // Swiped left -> next slide
        nextSlide();
      } else {
        // Swiped right -> previous slide
        prevSlide();
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
    setTouchEndX(null);
    setTouchEndY(null);
  }

  // Mouse Drag Handlers (for desktop trackpad/mouse swipe)
  function handleMouseDown(e: React.MouseEvent) {
    setIsMouseDown(true);
    setMouseStartX(e.clientX);
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (isMouseDown && mouseStartX !== null) {
      const deltaX = mouseStartX - e.clientX;
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }
    setIsMouseDown(false);
    setMouseStartX(null);
  }

  function handleMouseLeave() {
    setIsMouseDown(false);
    setMouseStartX(null);
    setIsPaused(false);
  }

  return (
    <div
      className="relative min-h-[480px] sm:min-h-[440px] sm:h-[58svh] max-h-[600px] w-full overflow-hidden bg-[#07140f] group touch-pan-y select-none cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsPaused(true)}
    >
      {slides.map((slide, index) => {
        const hasFailed = failedImages[slide.id];
        const isActive = index === current;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Layer — Vibrant Image & High Contrast Vignette */}
            <div className="absolute inset-0 bg-[#07140f] overflow-hidden">
              {/* Primary High-Resolution Image */}
              {!hasFailed ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onError={() => handleImageError(slide.id)}
                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-10000 ease-out scale-105 pointer-events-none"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-95`} />
              )}

              {/* Ambient Radial Accent */}
              <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
                <Leaf size={320} className="text-emerald-300" />
              </div>

              {/* Precision Left Vignette Overlay (Dark under text, 100% transparent over image right side) */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
            </div>

            {/* Slide Content */}
            <div className="relative z-20 flex h-full items-center">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl sm:max-w-2xl space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 px-3.5 py-1.5 text-xs font-black text-emerald-200 backdrop-blur-md border border-emerald-400/40 shadow-lg">
                      <slide.icon size={14} /> {slide.badge}
                    </span>

                    {/* Prominent Sign In badge if guest */}
                    {!user && !authLoading && (
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/25 hover:bg-amber-400/35 px-3.5 py-1.5 text-xs font-black text-amber-200 backdrop-blur-md border border-amber-400/40 shadow-lg transition active:scale-95"
                      >
                        <LogIn size={13} />
                        <span>Sign In / Register →</span>
                      </Link>
                    )}
                  </div>

                  {/* Crisp White Title with AAA Contrast Shadow */}
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                    {slide.title}
                  </h1>

                  <p className="text-sm sm:text-base leading-relaxed text-gray-100 max-w-xl line-clamp-3 sm:line-clamp-none font-semibold drop-shadow-[0_1px_5px_rgba(0,0,0,0.9)]">
                    {slide.description}
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
                    <Link href={slide.primaryAction.href} className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-xl border border-emerald-400/30">
                        {slide.primaryAction.icon && <slide.primaryAction.icon size={15} className="mr-2" />}
                        {slide.primaryAction.label}
                      </Button>
                    </Link>

                    {/* High-visibility Sign In CTA if user is not signed in */}
                    {!user && !authLoading ? (
                      <Link href="/login" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-white hover:bg-cream text-forest px-5 py-2.5 text-xs sm:text-sm font-black shadow-2xl border border-white transition active:scale-95">
                          <LogIn size={15} className="mr-1.5" />
                          Sign In
                        </Button>
                      </Link>
                    ) : user ? (
                      <Link href="/dashboard/courses" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-leaf hover:bg-forest text-white px-5 py-2.5 text-xs sm:text-sm font-black shadow-xl border border-leaf/40">
                          <GraduationCap size={15} className="mr-1.5" />
                          My Learning
                        </Button>
                      </Link>
                    ) : null}

                    <Link href={slide.secondaryAction.href} className="w-full sm:w-auto">
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto border-white/40 bg-black/40 text-white hover:bg-black/60 px-5 py-2.5 text-xs sm:text-sm font-bold backdrop-blur-md shadow-lg"
                      >
                        {slide.secondaryAction.icon && <slide.secondaryAction.icon size={15} className="mr-2" />}
                        {slide.secondaryAction.label}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrow Buttons — visible on mobile & desktop */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 grid size-8 sm:size-11 place-items-center rounded-full bg-black/50 sm:bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition sm:opacity-0 sm:group-hover:opacity-100 opacity-80 border border-white/20 shadow-xl active:scale-90"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} className="sm:size-[22px]" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 grid size-8 sm:size-11 place-items-center rounded-full bg-black/50 sm:bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition sm:opacity-0 sm:group-hover:opacity-100 opacity-80 border border-white/20 shadow-xl active:scale-90"
        aria-label="Next slide"
      >
        <ChevronRight size={18} className="sm:size-[22px]" />
      </button>

      {/* Slide Dots Bar & Swipe Hint */}
      <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-30 flex flex-col items-center gap-1.5">
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(index);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === current ? "w-8 bg-emerald-400 shadow-md" : "w-3 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
        <span className="sm:hidden text-[10px] font-bold text-white/60 tracking-wider">
          👈 Swipe to explore 👉
        </span>
      </div>
    </div>
  );
}
