"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";

type GalleryItem = { _id: string; url: string; type: "photo" | "video"; source: "upload" | "external" };

export function GalleryManager({ rideId, initialItems }: { rideId: string; initialItems: GalleryItem[] }) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [items, setItems] = useState(initialItems);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<"photo" | "video">("photo");

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch(`/api/manage-rides/${rideId}/gallery`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Could not add gallery item", "error");
        return;
      }
      setItems(data.gallery);
      e.currentTarget.reset();
      showToast("Gallery updated", "success");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(itemId: string) {
    if (!window.confirm("Delete this gallery item?")) return;
    const res = await fetch(`/api/manage-rides/${rideId}/gallery/${itemId}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i._id !== itemId));
      showToast("Item removed", "success");
    }
  }

  return (
    <div>
      {items.length === 0 ? (
        <p className="mb-6 text-sm text-pt-muted">No gallery items yet.</p>
      ) : (
        // CSS-columns masonry, same as the public gallery — each photo keeps its
        // natural aspect ratio instead of being force-cropped into a square, so a
        // portrait and a landscape shot both look right next to each other.
        <div className="mb-6 columns-2 sm:columns-4 gap-3 [column-fill:balance]">
          {items.map((item) => (
            <div key={item._id} className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl border border-pt-border bg-pt-black-soft">
              {item.type === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" loading="lazy" className="block w-full h-auto" />
              ) : (
                <div className="flex aspect-video items-center justify-center text-xs text-pt-muted">Video</div>
              )}
              <button
                onClick={() => handleDelete(item._id)}
                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 text-white text-xs opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 border-t border-pt-border pt-5">
        <div>
          <label className="block text-xs text-pt-muted mb-1">Type</label>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "photo" | "video")}
            className="rounded-lg border border-pt-border bg-pt-black-soft px-3 py-1.5 text-sm text-pt-cream"
          >
            <option value="photo">Photo</option>
            <option value="video">Video</option>
          </select>
        </div>

        {type === "photo" ? (
          <>
            <div>
              <label className="block text-xs text-pt-muted mb-1">Upload photos (select multiple)</label>
              <input type="file" name="file" accept="image/*" multiple className="text-xs text-pt-muted" />
            </div>
            <span className="text-xs text-pt-muted">or</span>
            <div>
              <label className="block text-xs text-pt-muted mb-1">External photo URL</label>
              <input
                name="url"
                placeholder="https://…"
                className="rounded-lg border border-pt-border bg-pt-black-soft px-3 py-1.5 text-sm text-pt-cream"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs text-pt-muted">
              Video URL
              <span
                title="Video link that you are sharing must be publicly available."
                aria-label="Video link that you are sharing must be publicly available."
                className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-pt-muted text-[9px] leading-none text-pt-muted"
              >
                i
              </span>
            </label>
            <input
              name="url"
              required
              placeholder="https://youtube.com/…"
              className="rounded-lg border border-pt-border bg-pt-black-soft px-3 py-1.5 text-sm text-pt-cream"
            />
            <p className="mt-1 text-[11px] text-pt-muted">
              Videos can only be added as a link (YouTube, Instagram, Drive) — direct video uploads aren&apos;t supported.
            </p>
          </div>
        )}

        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Adding…" : "Add"}
        </Button>
      </form>
    </div>
  );
}
