"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PRESETS = [
  { key: "all", label: "All Members" },
  { key: "3m", label: "3 Months" },
  { key: "6m", label: "6 Months" },
  { key: "9m", label: "9 Months" },
  { key: "custom", label: "Custom" },
] as const;

export function MemberActivityFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("inactive") ?? "all";
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  function apply(preset: string, nextFrom = from, nextTo = to) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // a new filter always starts back at page 1
    if (preset === "all") {
      params.delete("inactive");
      params.delete("from");
      params.delete("to");
    } else if (preset === "custom") {
      params.set("inactive", "custom");
      if (nextFrom) params.set("from", nextFrom);
      else params.delete("from");
      if (nextTo) params.set("to", nextTo);
      else params.delete("to");
    } else {
      params.set("inactive", preset);
      params.delete("from");
      params.delete("to");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-pt-muted uppercase tracking-wide mr-1">Hasn&apos;t joined a ride:</span>
      {PRESETS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => apply(p.key)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            active === p.key
              ? "bg-pt-gold text-pt-black border-pt-gold"
              : "border-pt-border text-pt-muted hover:text-pt-cream"
          }`}
        >
          {p.label}
        </button>
      ))}
      {active === "custom" && (
        <div className="flex items-center gap-2 ml-1">
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              apply("custom", e.target.value, to);
            }}
            className="rounded-lg border border-pt-border bg-pt-black-soft px-2.5 py-1.5 text-xs text-pt-cream focus:outline-none focus:border-pt-gold"
          />
          <span className="text-xs text-pt-muted">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              apply("custom", from, e.target.value);
            }}
            className="rounded-lg border border-pt-border bg-pt-black-soft px-2.5 py-1.5 text-xs text-pt-cream focus:outline-none focus:border-pt-gold"
          />
        </div>
      )}
    </div>
  );
}
