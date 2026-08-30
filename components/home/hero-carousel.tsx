"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Sparkles, PlayCircle } from "lucide-react";

const slides = [
  {
    id: "community",
    title: "More than just courses. A thriving community.",
    description: "Join hundreds of makers. Share your formulas, ask questions, and grow your organic brand together in our exclusive private batches.",
    primaryAction: { label: "Join the Community", href: "/register", icon: Users },
    secondaryAction: { label: "Learn more", href: "/about" },
    icon: Users,
    image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: "courses",
    title: "Master natural product manufacturing.",
    description: "Expert-led video lessons, complete with PDF formulas, ingredient breakdowns, and step-by-step batch worksheets.",
    primaryAction: { label: "Browse Courses", href: "/courses", icon: BookOpen },
    secondaryAction: { label: "Watch Free Classes", href: "/free-classes", icon: PlayCircle },
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: "features",
    title: "Everything you need to launch your brand.",
    description: "High-quality, ad-free protected videos, verifiable certificates, and lifetime access to your enrolled batches.",
    primaryAction: { label: "Get Started", href: "/register", icon: Sparkles },
    secondaryAction: { label: "View Curriculum", href: "/courses" },
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=2000&auto=format&fit=crop"
  }
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000); // 3 seconds interval
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[80svh] min-h-[600px] w-full overflow-hidden bg-[#07140f]">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {/* Background Image & Overlays */}
          <div className="absolute inset-0">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={slide.image} alt={slide.title} className="h-full w-full object-cover opacity-50" />
             <div className="absolute inset-0 bg-gradient-to-r from-[#07140f] via-[#07140f]/80 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#07140f] via-transparent to-transparent" />
          </div>

          {/* Slide Content */}
          <div className="relative z-20 flex h-full items-center">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-leaf/20 px-4 py-2 text-sm font-bold text-leaf backdrop-blur">
                  <slide.icon size={16} /> Charan Organics Academy
                </span>
                <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl">
                  {slide.title}
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-white/80 sm:text-xl">
                  {slide.description}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link href={slide.primaryAction.href} className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-leaf hover:bg-forest text-white px-8 py-6 text-base font-bold shadow-lg shadow-leaf/20">
                      {slide.primaryAction.icon && <slide.primaryAction.icon size={20} className="mr-2" />}
                      {slide.primaryAction.label}
                    </Button>
                  </Link>
                  <Link href={slide.secondaryAction.href} className="w-full sm:w-auto">
                    <Button variant="secondary" className="w-full sm:w-auto border-white/20 bg-white/10 text-white hover:bg-white/20 px-8 py-6 text-base font-bold backdrop-blur">
                      {slide.secondaryAction.icon && <slide.secondaryAction.icon size={20} className="mr-2" />}
                      {slide.secondaryAction.label}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation Progress/Dots */}
      <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden ${
              index === current ? "w-16 bg-white/20" : "w-8 bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === current && (
              <div 
                className="h-full bg-leaf animate-[progress_3s_linear]"
                style={{ width: '100%' }}
              />
            )}
          </button>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </div>
  );
}
