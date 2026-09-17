"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SmartImage } from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";

type GalleryItem = { _id: string; url: string; type: "photo" | "video"; source: "upload" | "external" };

export function GalleryManager({ rideId, initialItems }: { rideId: string; initialItems: GalleryItem[] }) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [items, setItems] = useState(initialItems);
  const [submitting, setSubmitting] = useState(false);

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {items.map((item) => (
          <div key={item._id} className="relative aspect-square rounded-xl overflow-hidden bg-pt-black-soft border border-pt-border group">
            {item.type === "photo" ? (
              <SmartImage src={item.url} alt="" fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-pt-muted">Video</div>
            )}
            <button
              onClick={() => handleDelete(item._id)}
              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 text-white text-xs opacity-0 group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="col-span-full text-sm text-pt-muted">No gallery items yet.</p>}
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 border-t border-pt-border pt-5">
        <div>
          <label className="block text-xs text-pt-muted mb-1">Upload photo/video</label>
          <input type="file" name="file" accept="image/*,video/*" className="text-xs text-pt-muted" />
        </div>
        <span className="text-xs text-pt-muted">or</span>
        <div>
          <label className="block text-xs text-pt-muted mb-1">External URL</label>
          <input name="url" placeholder="https://…" className="rounded-lg border border-pt-border bg-pt-black-soft px-3 py-1.5 text-sm text-pt-cream" />
        </div>
        <div>
          <label className="block text-xs text-pt-muted mb-1">Type</label>
          <select name="type" className="rounded-lg border border-pt-border bg-pt-black-soft px-3 py-1.5 text-sm text-pt-cream">
            <option value="photo">Photo</option>
            <option value="video">Video</option>
          </select>
        </div>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Adding…" : "Add"}
        </Button>
      </form>
    </div>
  );
}
