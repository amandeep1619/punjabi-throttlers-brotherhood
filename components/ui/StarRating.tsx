"use client";

import { useState } from "react";

const StarIcon = ({ filled, dim }: { filled: boolean; dim: string }) => (
  <svg width={dim} height={dim} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7-5.4-4.7 7.1-.7L12 2z" />
  </svg>
);

/** Read-only display, e.g. inside a review card. */
export function StarDisplay({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "14" : "20";
  return (
    <div className="flex items-center gap-0.5 text-pt-gold">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= value} dim={dim} />
      ))}
    </div>
  );
}

/** Clickable 1-5 picker for the review form. */
export function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div className="flex items-center gap-1 text-pt-gold" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="hover:scale-110 transition-transform"
        >
          <StarIcon filled={n <= shown} dim="24" />
        </button>
      ))}
    </div>
  );
}
