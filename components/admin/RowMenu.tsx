"use client";

import { useEffect, useRef, useState } from "react";

export function RowMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-pt-border/60 text-pt-muted"
        aria-label="Row actions"
      >
        ⋮
      </button>
      {open && (
        <div
          className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-pt-border bg-pt-black-card shadow-xl py-1"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function RowMenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="block px-4 py-2 text-sm text-pt-cream hover:bg-pt-border/40">
      {children}
    </a>
  );
}
