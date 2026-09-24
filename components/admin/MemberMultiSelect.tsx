"use client";

import { useEffect, useRef, useState } from "react";

type MemberOption = { _id: string; fullName: string; memberId: string };

/**
 * Tag-style multi-select: type to search active members (by name or member
 * ID), pick from the dropdown, picks become removable chips. Renders one
 * hidden input per selection so a plain <form>/FormData submit (how RideForm
 * already works) picks them all up under `name`.
 */
export function MemberMultiSelect({ name }: { name: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemberOption[]>([]);
  const [selected, setSelected] = useState<MemberOption[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const handle = setTimeout(async () => {
      const params = new URLSearchParams({ status: "active", includeSelf: "true", pageSize: "8" });
      if (query.trim()) params.set("search", query.trim());
      const res = await fetch(`/api/manage-members?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      const selectedIds = new Set(selected.map((m) => m._id));
      setResults((data.items ?? []).filter((m: MemberOption) => !selectedIds.has(m._id)));
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open]);

  function addMember(member: MemberOption) {
    setSelected((prev) => [...prev, member]);
    setResults((prev) => prev.filter((m) => m._id !== member._id));
    setQuery("");
  }

  function removeMember(id: string) {
    setSelected((prev) => prev.filter((m) => m._id !== id));
  }

  return (
    <div ref={containerRef} className="relative">
      {selected.map((m) => (
        <input key={m._id} type="hidden" name={name} value={m._id} />
      ))}

      <div className="flex flex-wrap gap-2 rounded-lg border border-pt-border bg-pt-black-soft p-2 min-h-[3rem]">
        {selected.map((m) => (
          <span
            key={m._id}
            className="flex items-center gap-1.5 rounded-full border border-pt-gold/40 bg-pt-black-card px-3 py-1 text-xs text-pt-cream"
          >
            {m.fullName}
            <span className="text-pt-muted">({m.memberId})</span>
            <button
              type="button"
              onClick={() => removeMember(m._id)}
              aria-label={`Remove ${m.fullName}`}
              className="text-pt-muted hover:text-pt-cream"
            >
              ✕
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? "Search by name or member ID…" : "Add another…"}
          className="min-w-[10rem] flex-1 bg-transparent text-sm text-pt-cream placeholder:text-pt-muted focus:outline-none"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-pt-border bg-pt-black-card shadow-xl">
          {results.map((m) => (
            <button
              key={m._id}
              type="button"
              onClick={() => addMember(m)}
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-pt-cream hover:bg-pt-border/40"
            >
              <span>{m.fullName}</span>
              <span className="text-xs text-pt-muted">{m.memberId}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
