export const parseRatingScore = (raw: string): number => {
  const normalized = raw.trim().replace(",", ".");
  if (!normalized) return Number.NaN;
  if (!/^\d*\.?\d+$/.test(normalized)) return Number.NaN;
  return Number.parseFloat(normalized);
};
