// A small icon badge instead of a second text pill — keeps the status badge
// from having to share space/fight for legibility with a "FEATURED" label.
export function FeaturedBadge() {
  return (
    <span
      title="Featured ride"
      className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-pt-gold text-pt-black shadow-[0_0_12px_-2px_rgba(221,163,101,0.8)]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7-5.4-4.7 7.1-.7L12 2z" />
      </svg>
    </span>
  );
}
