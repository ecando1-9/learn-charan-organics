import type { CourseDurationVariant } from "@/lib/types";

export type { CourseDurationVariant };

/**
 * Extracts duration in months from plan name strings like "6 Months Access", "1 Year Access", "Lifetime".
 */
export function extractMonthsFromName(name: string): number | null {
  const lower = name.toLowerCase().trim();
  if (lower.includes("lifetime") || lower.includes("forever") || lower.includes("unlimited")) {
    return 36; // 3 years equivalent for rate comparison
  }

  // Check years first (e.g. "1 year", "2 years", "1 yr")
  const yearMatch = lower.match(/(\d+)\s*(?:year|yr|yrs|y)/i);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10) * 12;
  }
  if (lower.includes("annual") || lower.includes("1-year") || lower.includes("yearly")) {
    return 12;
  }

  // Check months (e.g. "6 months", "3 mos", "6m")
  const monthMatch = lower.match(/(\d+)\s*(?:month|mo|mos|m)/i);
  if (monthMatch) {
    return parseInt(monthMatch[1], 10);
  }
  if (lower.includes("quarter")) {
    return 3;
  }

  return null;
}

/**
 * Calculates per-month rates, percentage savings compared to the base tier, and adds "Best Value" badges.
 * Industry standard pricing psychology used by Coursera, Udemy, MasterClass, etc.
 */
export function computeVariantEnhancements(
  variants: CourseDurationVariant[]
): CourseDurationVariant[] {
  if (!variants || variants.length === 0) return [];

  if (variants.length === 1) {
    const v = variants[0];
    const months = extractMonthsFromName(v.name);
    return [
      {
        ...v,
        monthlyRate: months && months > 0 ? Math.round(v.price / months) : undefined,
      },
    ];
  }

  // 1. Identify baseline plan (shortest parsed duration with price > 0, or the first tier)
  let baseMonths: number | null = null;
  let basePrice = 0;
  let baseMonthlyRate = 0;

  for (const v of variants) {
    const months = extractMonthsFromName(v.name);
    if (months && months > 0 && v.price > 0) {
      if (baseMonths === null || months < baseMonths) {
        baseMonths = months;
        basePrice = v.price;
        baseMonthlyRate = v.price / months;
      }
    }
  }

  // Fallback: If no duration found in names, assume 1st variant is baseline
  if (!baseMonths && variants.length >= 2) {
    baseMonths = 6;
    basePrice = variants[0].price;
    baseMonthlyRate = basePrice / baseMonths;
  }

  let maxSavings = 0;
  let bestValueVariantId: string | null = null;

  // 2. Compute savings percent against baseline rate
  const enriched = variants.map((v, idx) => {
    let months = extractMonthsFromName(v.name);
    if (!months) {
      months = idx === 0 ? 6 : idx === 1 ? 12 : 24;
    }

    const monthlyRate = months && months > 0 ? Math.round(v.price / months) : undefined;
    let savingsPercent: number | undefined = undefined;
    let savingsLabel: string | undefined = undefined;
    let badge: string | undefined = undefined;

    const lower = v.name.toLowerCase();
    const isLifetime = lower.includes("lifetime") || lower.includes("forever");

    if (baseMonthlyRate > 0 && months && months > (baseMonths || 0) && v.price > 0) {
      // Cost if user renewed the baseline plan for the same duration
      const standardRenewalCost = baseMonthlyRate * months;
      if (standardRenewalCost > v.price) {
        const rawSavings = Math.round(
          ((standardRenewalCost - v.price) / standardRenewalCost) * 100
        );
        if (rawSavings >= 5) {
          savingsPercent = rawSavings;
          savingsLabel = `Save ${rawSavings}%`;
        }
      }
    }

    if (isLifetime) {
      savingsLabel = "Unlimited Access";
      badge = "Best Value";
    }

    if (savingsPercent && savingsPercent > maxSavings) {
      maxSavings = savingsPercent;
      bestValueVariantId = v.id;
    }

    return {
      ...v,
      monthlyRate,
      savingsPercent,
      savingsLabel,
      badge,
    };
  });

  // 3. Mark the top plan as "Best Value" / "Most Popular"
  return enriched.map((v) => {
    const isBest =
      v.id === bestValueVariantId ||
      (!bestValueVariantId &&
        (v.name.toLowerCase().includes("1 year") || v.name.toLowerCase().includes("annual")));

    return {
      ...v,
      isBestValue: isBest,
      badge: v.badge || (isBest ? "Best Value" : undefined),
    };
  });
}

/**
 * Normalizes duration variants stored in JSONB or creates standard fallback plans.
 * Ensures consistent data across frontend checkout, course details, and admin forms.
 */
export function parseDurationVariants(
  rawVariants: any,
  basePrice: number,
  price1Year?: number | null
): CourseDurationVariant[] {
  let list: CourseDurationVariant[] = [];

  if (Array.isArray(rawVariants) && rawVariants.length > 0) {
    const valid = rawVariants
      .filter((v) => v && (v.name || v.price_inr !== undefined || v.price !== undefined))
      .map((v: any, idx: number) => ({
        id: String(v.id || `plan_${idx + 1}`),
        name: String(v.name || (idx === 0 ? "6 Months Access" : "1 Year Access")),
        price: Number(v.price_inr ?? v.price ?? basePrice),
        isDefault: Boolean(v.is_default ?? v.isDefault ?? (idx === 0)),
      }));

    if (valid.length > 0) {
      if (!valid.some((v) => v.isDefault)) {
        valid[0].isDefault = true;
      }
      list = valid;
    }
  }

  if (list.length === 0 && basePrice > 0) {
    // Synthesize standard fallback tiers: 6 Months & 1 Year
    const fallbackList: CourseDurationVariant[] = [
      {
        id: "6_months",
        name: "6 Months Access",
        price: basePrice,
        isDefault: true,
      },
    ];

    const yPrice =
      price1Year && Number(price1Year) > 0
        ? Number(price1Year)
        : Math.round(basePrice * 1.5);

    fallbackList.push({
      id: "1_year",
      name: "1 Year Access",
      price: yPrice,
      isDefault: false,
    });

    list = fallbackList;
  }

  return computeVariantEnhancements(list);
}

/**
 * Gets the active plan variant object for a course.
 */
export function getSelectedVariant(
  variants: CourseDurationVariant[] | undefined,
  selectedId?: string
): CourseDurationVariant | undefined {
  if (!variants || variants.length === 0) return undefined;
  if (selectedId) {
    const found = variants.find((v) => v.id === selectedId);
    if (found) return found;
  }
  return variants.find((v) => v.isDefault) || variants[0];
}
