export function splitAmountEvenly(totalAmount: number, count: number) {
  if (count <= 0) return [];

  const total = Math.max(0, Math.round(totalAmount));
  const base = Math.floor(total / count);
  const remainder = total % count;

  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
}

export function allocateCourseAmounts({
  courseIds,
  totalAmount,
  coursePrices,
  selectedAll = false,
}: {
  courseIds: string[];
  totalAmount: number;
  coursePrices: Map<string, number>;
  selectedAll?: boolean;
}) {
  const uniqueCourseIds = Array.from(new Set(courseIds.filter(Boolean)));
  const total = Math.max(0, Math.round(totalAmount));
  const amounts = new Map<string, number>();

  if (uniqueCourseIds.length === 0) {
    return amounts;
  }

  const prices = uniqueCourseIds.map((id) => Math.max(0, Math.round(coursePrices.get(id) ?? 0)));
  const priceTotal = prices.reduce((sum, price) => sum + price, 0);

  if (!selectedAll && priceTotal > 0 && Math.abs(priceTotal - total) <= 1) {
    uniqueCourseIds.forEach((id, index) => amounts.set(id, prices[index]));
    return amounts;
  }

  if (!selectedAll && priceTotal > 0) {
    let allocated = 0;
    uniqueCourseIds.forEach((id, index) => {
      const isLast = index === uniqueCourseIds.length - 1;
      const amount = isLast ? total - allocated : Math.round((total * prices[index]) / priceTotal);
      allocated += amount;
      amounts.set(id, Math.max(0, amount));
    });
    return amounts;
  }

  splitAmountEvenly(total, uniqueCourseIds.length).forEach((amount, index) => {
    amounts.set(uniqueCourseIds[index], amount);
  });

  return amounts;
}
