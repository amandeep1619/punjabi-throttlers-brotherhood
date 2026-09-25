"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";
import { rideStatusOptions } from "@/lib/validation/ride";
import { MemberMultiSelect } from "@/components/admin/MemberMultiSelect";
import { BannerUploadField } from "@/components/admin/BannerUploadField";

const inputClass =
  "w-full rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2.5 text-pt-cream focus:outline-none focus:border-pt-gold";
const labelClass = "block text-sm text-pt-muted mb-1.5";

export type RideFormDefaults = {
  title: string;
  description: string;
  distanceKm: number;
  startDate: string;
  endDate: string;
  status: string;
  tags: string;
  featured: boolean;
  bannerUrl: string;
  /** Always the ride's current banner, whatever its source — preview only, never submitted directly. */
  currentBannerUrl?: string;
  maxSlots?: number | "";
  budget?: number | "";
  itinerary?: { day: string; title: string; description: string }[];
};

export default function RideForm({
  rideId,
  defaults,
}: {
  rideId?: string;
  defaults?: RideFormDefaults;
}) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [submitting, setSubmitting] = useState(false);

  // FormData can't carry a nested array natively — the day-rows are kept as
  // component state and serialized into one hidden JSON field on submit
  // (parsed back into an array server-side, see lib/validation/ride.ts).
  const [itinerary, setItinerary] = useState(defaults?.itinerary ?? []);

  function addDay() {
    setItinerary((prev) => [...prev, { day: `Day ${prev.length + 1}`, title: "", description: "" }]);
  }
  function updateDay(index: number, field: "day" | "title" | "description", value: string) {
    setItinerary((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }
  function removeDay(index: number) {
    setItinerary((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch(rideId ? `/api/manage-rides/${rideId}` : "/api/manage-rides", {
        method: rideId ? "PATCH" : "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Could not save ride", "error");
        return;
      }
      showToast(rideId ? "Ride updated" : "Ride created", "success");
      router.push(rideId ? `/manage-rides/${rideId}` : `/manage-rides/${data.ride._id}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>Title</label>
        <input name="title" defaultValue={defaults?.title} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" defaultValue={defaults?.description} rows={4} required className={inputClass} />
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className={labelClass}>Distance (km)</label>
          <input type="number" name="distanceKm" defaultValue={defaults?.distanceKm} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Start Date</label>
          <input type="date" name="startDate" defaultValue={defaults?.startDate} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input type="date" name="endDate" defaultValue={defaults?.endDate} className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Status</label>
          <select name="status" defaultValue={defaults?.status ?? "upcoming"} className={inputClass}>
            {rideStatusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Tags (comma separated)</label>
          <input name="tags" defaultValue={defaults?.tags} placeholder="one-day, night-stay" className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Max Slots (optional — leave blank for unlimited)</label>
          <input
            type="number"
            min={1}
            name="maxSlots"
            defaultValue={defaults?.maxSlots ?? ""}
            placeholder="e.g. 20"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Budget (optional, ₹)</label>
          <input
            type="number"
            min={0}
            name="budget"
            defaultValue={defaults?.budget ?? ""}
            placeholder="e.g. 5000"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Unchecked checkboxes send no FormData entry at all — this hidden
            "false" fallback (overridden by the checkbox's "true" when checked,
            since FormData keeps both and the last entry wins) is what lets the
            server tell "explicitly unchecked" apart from "field omitted". */}
        <input type="hidden" name="featured" value="false" />
        <input type="checkbox" id="featured" name="featured" value="true" defaultChecked={defaults?.featured} className="h-4 w-4 accent-pt-gold" />
        <label htmlFor="featured" className="text-sm text-pt-cream">
          Mark as featured ride
        </label>
      </div>

      {!rideId && (
        <div>
          <label className={labelClass}>Enroll Members (optional)</label>
          <MemberMultiSelect name="enrolledMemberIds" />
        </div>
      )}

      <div className="border-t border-pt-border pt-6">
        <div className="flex items-center justify-between mb-1.5">
          <label className={`${labelClass} mb-0`}>Itinerary (optional)</label>
          <button type="button" onClick={addDay} className="text-xs text-pt-gold hover:underline">
            + Add Day
          </button>
        </div>
        {itinerary.length === 0 ? (
          <p className="text-xs text-pt-muted">No itinerary yet — add a day to start building one.</p>
        ) : (
          <div className="space-y-4">
            {itinerary.map((item, i) => (
              <div key={i} className="rounded-lg border border-pt-border bg-pt-black-soft p-4">
                <div className="grid sm:grid-cols-[120px_1fr_auto] gap-3 items-start">
                  <input
                    value={item.day}
                    onChange={(e) => updateDay(i, "day", e.target.value)}
                    placeholder="Day 1"
                    required
                    className={inputClass}
                  />
                  <input
                    value={item.title}
                    onChange={(e) => updateDay(i, "title", e.target.value)}
                    placeholder="Assembly & Departure"
                    required
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeDay(i)}
                    className="text-xs text-red-300 hover:underline sm:mt-2.5 sm:justify-self-end"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={item.description}
                  onChange={(e) => updateDay(i, "description", e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className={`${inputClass} mt-3`}
                />
              </div>
            ))}
          </div>
        )}
        <input type="hidden" name="itinerary" value={JSON.stringify(itinerary)} />
      </div>

      <div className="border-t border-pt-border pt-6">
        <BannerUploadField previewUrl={defaults?.currentBannerUrl} externalUrl={defaults?.bannerUrl} />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : rideId ? "Save Changes" : "Create Ride"}
      </Button>
    </form>
  );
}
