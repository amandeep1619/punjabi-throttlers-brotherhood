"use client";

import { useState } from "react";
import { toYoutubeEmbedUrl } from "@/lib/media";

type GalleryItem = { _id: string; url: string; type: "photo" | "video"; source: "upload" | "external" };

export function GalleryFilter({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const filtered = items.filter((item) => filter === "all" || item.type === filter);

  if (items.length === 0) return <p className="text-pt-muted text-sm">No gallery items yet.</p>;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {(["all", "photo", "video"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide border transition-colors ${
              filter === f ? "bg-pt-gold text-pt-black border-pt-gold" : "border-pt-border text-pt-muted hover:text-pt-cream"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* CSS-columns masonry — each photo keeps its natural aspect ratio and
          just flows into the next column, instead of being force-cropped
          into a fixed square (which is what "doesn't fit" was about). Plain
          <img>, not next/image: masonry needs each item's real height before
          layout, which next/image's `fill` mode can't give without knowing
          dimensions up front — these are user-uploaded/external photos of
          unknown size. */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:balance]">
        {filtered.map((item) => (
          <div key={item._id} className="mb-3 break-inside-avoid rounded-xl overflow-hidden bg-pt-black-soft border border-pt-border">
            {item.type === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt="" loading="lazy" className="w-full h-auto block" />
            ) : (
              <div className="aspect-video">
                {toYoutubeEmbedUrl(item.url) ? (
                  // YouTube/Instagram-style page links need an iframe embed.
                  <iframe src={toYoutubeEmbedUrl(item.url)!} allowFullScreen className="h-full w-full" />
                ) : (
                  // Uploaded files and direct external video links (.mp4 etc.) both play directly.
                  <video src={item.url} controls className="h-full w-full object-cover" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
