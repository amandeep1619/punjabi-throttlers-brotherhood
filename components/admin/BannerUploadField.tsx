"use client";

import { useRef, useState } from "react";

/**
 * Groups the upload-vs-external-link choice into one clearly-bounded card
 * with a live preview, instead of two plain inputs sitting loose in the
 * form — and makes the "pick one" relationship explicit: choosing a file
 * clears the URL field and vice versa, since the server only ever uses one.
 */
export function BannerUploadField({
  fileFieldName = "bannerFile",
  urlFieldName = "bannerUrl",
  previewUrl,
  externalUrl = "",
}: {
  fileFieldName?: string;
  urlFieldName?: string;
  /** Shown on load regardless of source — the ride's current banner, if editing one. */
  previewUrl?: string;
  /** Only set when the current banner's source is "external" — prefills the URL field itself, not just the preview. */
  externalUrl?: string;
}) {
  const [preview, setPreview] = useState<string | null>(previewUrl ?? null);
  const [urlValue, setUrlValue] = useState(externalUrl);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUrlValue(""); // a chosen file wins on submit — clear the URL field so that's visually unambiguous
    setPreview(URL.createObjectURL(file));
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUrlValue(value);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreview(value || null);
  }

  function clearAll() {
    setPreview(null);
    setUrlValue("");
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <label className="block text-sm text-pt-muted mb-1.5">Banner Image</label>
      <div className="rounded-xl border border-pt-border bg-pt-black-soft p-4 sm:p-5">
        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg border border-pt-border bg-pt-black">
          {preview ? (
            // Live preview of a local file (blob: URL) or a pasted external
            // link — next/image can't optimize either of those, so plain <img>.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Banner preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-pt-muted">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="8.5" cy="10" r="1.5" />
                <path d="M21 15l-5-5-9 9" />
              </svg>
              <p className="text-xs">No banner selected yet</p>
            </div>
          )}
          {preview && (
            <button
              type="button"
              onClick={clearAll}
              aria-label="Clear banner"
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs text-white hover:bg-black/90"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-pt-gold px-4 py-2 text-sm font-medium text-pt-black hover:bg-pt-gold-bright">
            Choose File
            <input
              ref={fileInputRef}
              type="file"
              name={fileFieldName}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <span className="truncate text-xs text-pt-muted">{fileName ?? "No file chosen"}</span>
        </div>

        <div className="my-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-pt-border" />
          <span className="text-[11px] uppercase tracking-wide text-pt-muted">or paste a URL</span>
          <div className="h-px flex-1 bg-pt-border" />
        </div>

        <input
          name={urlFieldName}
          value={urlValue}
          onChange={handleUrlChange}
          placeholder="https://…"
          className="w-full rounded-lg border border-pt-border bg-pt-black-card px-4 py-2.5 text-sm text-pt-cream focus:outline-none focus:border-pt-gold"
        />
      </div>
    </div>
  );
}
