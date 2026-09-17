"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";

export function AdminActionButton({
  url,
  method = "PATCH",
  label,
  confirmMessage,
  variant = "outline",
  successMessage,
}: {
  url: string;
  method?: string;
  label: string;
  confirmMessage?: string;
  variant?: "primary" | "outline" | "ghost" | "danger";
  successMessage?: string;
}) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const res = await fetch(url, { method });
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
    <Button variant={variant} size="sm" onClick={handleClick} disabled={loading}>
      {loading ? "…" : label}
    </Button>
  );
}
