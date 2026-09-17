"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SmartImage } from "@/components/ui/SmartImage";
import { useUiStore } from "@/store/useUiStore";

export default function PhotoUpload({ currentUrl, name }: { currentUrl?: string; name: string }) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [preview, setPreview] = useState<string | undefined>(currentUrl);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch("/api/me/photo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Could not upload photo", "error");
        return;
      }
      setPreview(data.photoUrl);
      showToast("Photo updated", "success");
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className="relative h-28 w-28 rounded-full overflow-hidden ring-4 ring-pt-gold/40 bg-pt-black-soft cursor-pointer group block">
      {preview ? (
        <SmartImage src={preview} alt={name} fill className="object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-3xl font-semibold text-pt-gold">
          {name.charAt(0)}
        </div>
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white transition-opacity">
        {uploading ? "Uploading…" : "Change"}
      </div>
      <input type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={uploading} />
    </label>
  );
}
