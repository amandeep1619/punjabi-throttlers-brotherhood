"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/store/useUiStore";

export function RowMenuAction({
  url,
  method = "PATCH",
  body,
  label,
  confirmMessage,
  successMessage,
  danger,
}: {
  url: string;
  method?: string;
  body?: Record<string, unknown>;
  label: string;
  confirmMessage?: string;
  successMessage?: string;
  danger?: boolean;
}) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const res = await fetch(url, {
        method,
        ...(body && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error ?? "Action failed", "error");
        return;
      }
      showToast(successMessage ?? "Done", "success");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`block w-full text-left px-4 py-2 text-sm hover:bg-pt-border/40 ${danger ? "text-red-300" : "text-pt-cream"}`}
    >
      {loading ? "…" : label}
    </button>
  );
}
