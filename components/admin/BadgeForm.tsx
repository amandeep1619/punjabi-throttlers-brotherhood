"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";
import { badgeCriteriaTypes } from "@/lib/validation/badge";

const inputClass =
  "w-full rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2.5 text-pt-cream focus:outline-none focus:border-pt-gold";
const labelClass = "block text-sm text-pt-muted mb-1.5";

export type BadgeFormDefaults = {
  name: string;
  description: string;
  icon: string;
  criteriaType: "RIDE_COUNT" | "TOTAL_KM";
  tag: string;
  threshold: number;
  active: boolean;
};

export default function BadgeForm({ badgeId, defaults }: { badgeId?: string; defaults?: BadgeFormDefaults }) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [criteriaType, setCriteriaType] = useState(defaults?.criteriaType ?? "RIDE_COUNT");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Object.fromEntries takes the LAST value for a repeated key, not the
      // first — that's what makes the hidden-input checkbox fallback work
      // (FormData.get() would always return the first / hidden value instead).
      const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
      const payload = {
        name: raw.name,
        description: raw.description,
        icon: raw.icon,
        criteriaType: raw.criteriaType,
        tag: raw.tag || undefined,
        threshold: raw.threshold,
        active: raw.active === "true",
      };

      const res = await fetch(badgeId ? `/api/manage-badges/${badgeId}` : "/api/manage-badges", {
        method: badgeId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Could not save badge", "error");
        return;
      }
      showToast(badgeId ? "Badge updated" : "Badge created", "success");
      router.push("/manage-badges");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-[80px_1fr] gap-5">
        <div>
          <label className={labelClass}>Icon</label>
          <input name="icon" defaultValue={defaults?.icon} placeholder="🏆" maxLength={4} required className={`${inputClass} text-center text-xl`} />
        </div>
        <div>
          <label className={labelClass}>Name</label>
          <input name="name" defaultValue={defaults?.name} placeholder="Gold Rider" required className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" defaultValue={defaults?.description} rows={2} required className={inputClass} />
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className={labelClass}>Criteria Type</label>
          <select
            name="criteriaType"
            value={criteriaType}
            onChange={(e) => setCriteriaType(e.target.value as "RIDE_COUNT" | "TOTAL_KM")}
            className={inputClass}
          >
            {badgeCriteriaTypes.map((t) => (
              <option key={t} value={t}>
                {t === "RIDE_COUNT" ? "Ride Count" : "Total Km"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{criteriaType === "TOTAL_KM" ? "Km Threshold" : "Ride Count Threshold"}</label>
          <input type="number" min={1} name="threshold" defaultValue={defaults?.threshold} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Tag (optional)</label>
          <input
            name="tag"
            defaultValue={defaults?.tag}
            placeholder="e.g. one-day"
            disabled={criteriaType === "TOTAL_KM"}
            className={`${inputClass} disabled:opacity-40`}
          />
        </div>
      </div>
      {criteriaType === "RIDE_COUNT" && (
        <p className="text-xs text-pt-muted -mt-4">
          Leave the tag blank to count every completed ride, or set it to only count rides tagged with that value
          (e.g. &quot;one-day&quot;, &quot;night-stay&quot;).
        </p>
      )}

      <div className="flex items-center gap-3">
        <input type="hidden" name="active" value="false" />
        <input type="checkbox" id="active" name="active" value="true" defaultChecked={defaults?.active ?? true} className="h-4 w-4 accent-pt-gold" />
        <label htmlFor="active" className="text-sm text-pt-cream">
          Active (inactive badges are never awarded, but keep their history)
        </label>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : badgeId ? "Save Changes" : "Create Badge"}
      </Button>
    </form>
  );
}
