"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Sparkles, PlayCircle, ChevronLeft, ChevronRight, Leaf } from "lucide-react";

const slides = [
  {
    id: "courses",
    title: "Master Natural Organic Product Manufacturing",
    description: "Expert-led video lessons complete with PDF formulation sheets, ingredient breakdowns, and step-by-step batch guides.",
    primaryAction: { label: "Browse Courses", href: "/courses", icon: BookOpen },
    secondaryAction: { label: "Watch Free Classes", href: "/#free-classes", icon: PlayCircle },
    badge: "Certified Formulation Training",
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=2000&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=2000&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=2000&auto=format&fit=crop",
    gradient: "from-[#09291b] via-[#061810] to-forest"
  }
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  function nextSlide() {
    setCurrent((prev) => (prev + 1) % slides.length);
  }

  function prevSlide() {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }

  function handleImageError(id: string) {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <div className="relative h-[55svh] min-h-[380px] max-h-[520px] w-full overflow-hidden bg-[#07140f] group">
      {slides.map((slide, index) => {
        const hasFailed = failedImages[slide.id];

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
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
                  onError={() => handleImageError(slide.id)}
                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-10000 ease-out scale-105"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-95`} />
              )}

              {/* Ambient Radial Accent */}
              <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
                <Leaf size={320} className="text-emerald-300" />
              </div>

              {/* Precision Left Vignette Overlay (Dark under text, 100% transparent over image right side) */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            </div>

            {/* Slide Content */}
            <div className="relative z-20 flex h-full items-center">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl sm:max-w-2xl space-y-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 px-3.5 py-1.5 text-xs font-black text-emerald-200 backdrop-blur-md border border-emerald-400/40 shadow-lg">
                    <slide.icon size={14} /> {slide.badge}
                  </span>

                  {/* Crisp White Title with AAA Contrast Shadow */}
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                    {slide.title}
                  </h1>

                  <p className="text-sm sm:text-base leading-relaxed text-gray-100 max-w-xl line-clamp-3 sm:line-clamp-none font-semibold drop-shadow-[0_1px_5px_rgba(0,0,0,0.9)]">
                    {slide.description}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <Link href={slide.primaryAction.href} className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-sm font-bold shadow-xl border border-emerald-400/30">
                        {slide.primaryAction.icon && <slide.primaryAction.icon size={16} className="mr-2" />}
                        {slide.primaryAction.label}
                      </Button>
                    </Link>
                    <Link href={slide.secondaryAction.href} className="w-full sm:w-auto">
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto border-white/40 bg-black/40 text-white hover:bg-black/60 px-6 py-2.5 text-sm font-bold backdrop-blur-md shadow-lg"
                      >
                        {slide.secondaryAction.icon && <slide.secondaryAction.icon size={16} className="mr-2" />}
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

      {/* Manual Arrow Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden sm:grid size-11 place-items-center rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition opacity-0 group-hover:opacity-100 border border-white/20 shadow-xl"
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden sm:grid size-11 place-items-center rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition opacity-0 group-hover:opacity-100 border border-white/20 shadow-xl"
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Slide Dots Bar */}
      <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === current ? "w-8 bg-emerald-400 shadow-md" : "w-3 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
