"use client";

import { useEffect, useState } from "react";
import { BadgeAvatar } from "@/components/badges/BadgeAvatar";

type EarnedBadge = {
  _id: string;
  awardedAt: string;
  badge: { name: string; description: string; icon?: string; imageUrl?: string } | null;
};

export function BadgeGrid({ earned }: { earned: EarnedBadge[] }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
      {earned.map((e) => (
        <BadgeItem key={e._id} earned={e} />
      ))}
    </div>
  );
}

// A fixed, viewport-covering modal can't be hover-driven: the instant it opens
// it sits on top of the cursor, the browser fires a real mouseleave on the
// trigger, and it closes itself. So the card is anchored to the badge instead,
// nested inside the same hoverable wrapper as the button — moving the cursor
// from icon to card never "leaves" that wrapper.
function BadgeItem({ earned }: { earned: EarnedBadge }) {
  const [open, setOpen] = useState(false);
  const badge = earned.badge!;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-col items-center gap-1.5 text-center"
      >
        <BadgeAvatar name={badge.name} imageUrl={badge.imageUrl} className="transition-transform hover:scale-110" />
        <p className="text-[11px] text-pt-muted leading-tight line-clamp-2">{badge.name}</p>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={badge.name}
          className="pt-modal-in absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 flex overflow-hidden rounded-2xl border border-pt-gold/30 bg-pt-black-card shadow-2xl"
        >
          <div className="w-20 shrink-0 flex items-center justify-center bg-pt-black-soft">
            <BadgeAvatar name={badge.name} imageUrl={badge.imageUrl} size="lg" />
          </div>
          <div className="flex-1 p-3 min-w-0">
            <h3 className="font-semibold text-pt-cream text-sm">{badge.name}</h3>
            <p className="text-xs text-pt-muted mt-1">{badge.description}</p>
            <p className="text-[10px] text-pt-gold/80 mt-2 uppercase tracking-wide">
              Earned {new Date(earned.awardedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
