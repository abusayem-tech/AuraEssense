const bdt = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

/** Format a number as Bangladeshi Taka, e.g. 5500 -> "৳ 5,500" (handles negatives). */
export function formatBDT(amount: number | null | undefined): string {
  const value = typeof amount === "number" ? amount : 0;
  const sign = value < 0 ? "-" : "";
  // Format the magnitude so the sign doesn't break the symbol normalization,
  // then re-prepend it. Intl narrowSymbol yields "৳5,500" -> "৳ 5,500".
  const formatted = bdt
    .format(Math.abs(value))
    .replace(/^৳/, "৳ ")
    .replace(/^BDT\s?/, "৳ ");
  return `${sign}${formatted}`;
}

export function formatNumber(n: number | null | undefined): string {
  return new Intl.NumberFormat("en-US").format(n ?? 0);
}

export function formatDate(
  date: string | Date | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", opts).format(d);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : plural ?? `${singular}s`;
}

export function truncate(text: string, max = 120) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
