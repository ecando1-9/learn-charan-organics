"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Lock, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { CourseDurationVariant } from "@/lib/types";

interface Props {
  slug: string;
  basePrice: number;
  variants?: CourseDurationVariant[];
}

export function CourseEnrollWidget({ slug, basePrice, variants = [] }: Props) {
  const router = useRouter();

  // Find initial default variant or fallback
  const defaultVariant = variants.find((v) => v.isDefault) || variants[0];
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    defaultVariant ? defaultVariant.id : "default"
  );

  const activePlan = variants.find((v) => v.id === selectedPlanId) || {
    id: "default",
    name: "Full Access",
    price: basePrice,
  };

  function handleDirectProceed(planId: string) {
    setSelectedPlanId(planId);
    router.push(`/enroll?course=${slug}&plan=${planId}`);
  }

  return (
    <div className="space-y-4">
      {/* Price & Plan Count Header */}
      <div className="flex items-baseline justify-between border-b border-forest/10 pb-3 dark:border-white/10">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50 dark:text-cream/50">
            {variants.length > 1 ? "Selected Plan Price" : "Course Fee"}
          </span>
          <div className="text-3xl font-black text-forest dark:text-cream leading-tight">
            {formatCurrency(activePlan.price)}
          </div>
        </div>
        {variants.length > 1 && (
          <span className="text-[11px] font-black text-leaf bg-leaf/10 dark:text-emerald-400 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
            {variants.length} Access Plans Available
          </span>
        )}
      </div>

      {/* Duration Plans Selector */}
      {variants.length > 0 && (
        <div className="space-y-2.5">
          <p className="font-bold text-forest dark:text-cream text-xs flex items-center gap-1.5">
            <Clock size={13} className="text-leaf" /> Choose Access Duration:
          </p>

          <div className="space-y-2">
            {variants.map((v) => {
              const isSelected = v.id === activePlan.id;

              return (
                <div
                  key={v.id}
                  onClick={() => {
                    if (isSelected) {
                      router.push(`/enroll?course=${slug}&plan=${v.id}`);
                    } else {
                      setSelectedPlanId(v.id);
                    }
                  }}
                  className={`group/plan relative flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-500/10 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                      : "border-forest/10 bg-white/70 hover:border-forest/30 dark:border-white/10 dark:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {/* Radio Indicator */}
                    <div
                      className={`grid size-4 shrink-0 place-items-center rounded-full border-2 transition ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-600 dark:border-emerald-500"
                          : "border-forest/30 dark:border-cream/30"
                      }`}
                    >
                      {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-forest dark:text-cream text-xs sm:text-sm leading-snug">
                          {v.name}
                        </span>
                        {v.isBestValue && (
                          <span className="rounded-full bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 shadow-sm">
                            ⭐ BEST VALUE
                          </span>
                        )}
                        {v.savingsLabel && (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black px-2 py-0.5 border border-emerald-300 dark:border-emerald-700">
                            🔥 {v.savingsLabel}
                          </span>
                        )}
                      </div>
                      {v.monthlyRate ? (
                        <p className="text-[10px] text-ink/50 dark:text-cream/50 mt-0.5">
                          Only ₹{v.monthlyRate}/month
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-black text-leaf dark:text-emerald-400">
                      ₹{v.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security & Verification Banner */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
        <span>💳 Instant UPI QR Checkout & Fast Manual Approval</span>
      </div>

      {/* Primary Proceed CTA Button */}
      <Link
        href={`/enroll?course=${slug}&plan=${activePlan.id}`}
        className="block pt-1"
      >
        <Button className="w-full gap-2 py-3.5 sm:py-4 text-xs sm:text-sm font-black rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-700/25 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
          <Lock size={16} />
          <span>Proceed to Enroll &middot; {formatCurrency(activePlan.price)}</span>
          <ArrowRight size={16} className="ml-auto" />
        </Button>
      </Link>
    </div>
  );
}
