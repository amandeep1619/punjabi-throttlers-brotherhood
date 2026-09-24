import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * One call site for every page's title/description/canonical, so length
 * targets and the NEXT_PUBLIC_SITE_URL + path canonical pattern stay
 * consistent everywhere instead of hand-rolled per page.
 *
 * `title` is set as `absolute` (bypasses the root layout's "%s | ..."
 * template) so each page fully controls its own rendered <title> length
 * against SEO-checker thresholds (~50–60 chars) instead of the template
 * suffix pushing it out of range.
 */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: canonicalUrl(path) },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

/**
 * Fits `base + " " + suffix` into an SEO-friendly title length (50–60 chars
 * by default) for titles built from admin-authored content (ride titles,
 * badge names) whose length isn't otherwise controlled: truncates `base`
 * with an ellipsis if over `max`, inserts `pad` before `suffix` if under
 * `min` (trimmed to fit if there isn't room for all of it). Real content is
 * best-effort, not guaranteed — a one-word base plus a short pad can still
 * land under `min`, the same limitation any SEO tool has with free text.
 */
export function fitTitle(base: string, suffix: string, pad = "", min = 50, max = 60): string {
  const plain = `${base} ${suffix}`.trim();
  if (plain.length > max) {
    const keep = Math.max(max - suffix.length - 2, 10);
    return `${base.slice(0, keep).trimEnd()}… ${suffix}`;
  }
  if (plain.length < min && pad) {
    const full = `${base} ${pad} ${suffix}`.trim();
    if (full.length <= max) return full;
    const room = max - base.length - suffix.length - 2;
    if (room > 3) return `${base} ${pad.slice(0, room).trimEnd()} ${suffix}`.trim();
  }
  return plain;
}

/**
 * Fits free text into an SEO-friendly description length (120–158 chars by
 * default): truncates with an ellipsis if too long, appends `pad` if too
 * short (falling back to truncation if even `text + pad` overshoots).
 */
export function fitDescription(text: string, pad: string, min = 120, max = 158): string {
  const trimmed = text.trim();
  if (trimmed.length > max) return trimmed.slice(0, max - 1).trimEnd() + "…";
  if (trimmed.length >= min) return trimmed;
  const padded = `${trimmed}${/[.!?]$/.test(trimmed) ? "" : "."} ${pad}`.trim();
  return padded.length > max ? padded.slice(0, max - 1).trimEnd() + "…" : padded;
}
