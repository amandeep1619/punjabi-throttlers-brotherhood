"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUiStore } from "@/store/useUiStore";

type Section = { heading: string; body: string; order: number };

export function PolicyEditor({ initialSections }: { initialSections: Section[] }) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [sections, setSections] = useState(initialSections.length ? initialSections : [{ heading: "", body: "", order: 0 }]);
  const [saving, setSaving] = useState(false);

  function update(i: number, field: "heading" | "body", value: string) {
    setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  function addSection() {
    setSections((prev) => [...prev, { heading: "", body: "", order: prev.length }]);
  }

  function removeSection(i: number) {
    setSections((prev) => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx })));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/manage-policies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: sections.map((s, i) => ({ ...s, order: i })) }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Could not save policies", "error");
        return;
      }
      showToast("Policies updated", "success");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <Card key={i} className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <input
              value={section.heading}
              onChange={(e) => update(i, "heading", e.target.value)}
              placeholder="Section heading"
              className="font-medium text-pt-cream bg-transparent border-b border-pt-border focus:outline-none focus:border-pt-gold flex-1"
            />
            <button onClick={() => removeSection(i)} className="text-red-300 text-xs ml-4">
              Remove
            </button>
          </div>
          <textarea
            value={section.body}
            onChange={(e) => update(i, "body", e.target.value)}
            rows={2}
            placeholder="Rule text"
            className="w-full rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2.5 text-sm text-pt-cream focus:outline-none focus:border-pt-gold"
          />
        </Card>
      ))}

      <div className="flex items-center justify-between pt-2">
        <button onClick={addSection} className="text-sm text-pt-gold hover:underline">
          + Add section
        </button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Policies"}
        </Button>
      </div>
    </div>
  );
}
