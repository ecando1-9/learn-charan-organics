import type { CourseDurationVariant } from "@/lib/types";

export type { CourseDurationVariant };

/**
 * Normalizes duration variants stored in JSONB or creates standard fallback plans.
 * Ensures consistent data across frontend checkout, course details, and admin forms.
 */
export function parseDurationVariants(
  rawVariants: any,
  basePrice: number,
  price1Year?: number | null
): CourseDurationVariant[] {
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
      // Ensure at least one is designated as default
      if (!valid.some((v) => v.isDefault)) {
        valid[0].isDefault = true;
      }
      return valid;
    }
  }

  if (basePrice <= 0) return [];

  // Synthesize standard fallback tiers: 6 Months & 1 Year
  const variants: CourseDurationVariant[] = [
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

  variants.push({
    id: "1_year",
    name: "1 Year Access",
    price: yPrice,
    isDefault: false,
  });

  return variants;
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
