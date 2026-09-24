// Search terms get interpolated into Mongo $regex filters — without this, a
// crafted pattern like "(a+)+$" causes catastrophic backtracking (ReDoS) in
// mongod, and literal regex metacharacters (e.g. a name with a ".") behave
// unpredictably. Escape first so the term is always matched literally.
export function escapeRegex(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "₹5,000" style — undefined/null renders as "N/A", not "₹0". */
export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null) return "N/A";
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** "2 weeks ago" style relative timestamp, e.g. for review dates. */
export function formatRelativeTime(date: Date | string): string {
  const seconds = (new Date(date).getTime() - Date.now()) / 1000;
  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return rtf.format(Math.round(seconds / secondsInUnit), unit);
    }
  }
  return rtf.format(Math.round(seconds), "second");
}
