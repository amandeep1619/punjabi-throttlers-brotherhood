"use client";

import { useUiStore } from "@/store/useUiStore";

const VARIANT_STYLES: Record<string, string> = {
  success: "border-pt-gold/60 bg-pt-black-card text-pt-cream",
  error: "border-red-500/60 bg-pt-black-card text-red-200",
  info: "border-pt-border bg-pt-black-card text-pt-cream",
};

export default function ToastViewport() {
  const toasts = useUiStore((s) => s.toasts);
  const dismissToast = useUiStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => dismissToast(toast.id)}
          className={`text-left rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm transition hover:opacity-90 ${VARIANT_STYLES[toast.variant]}`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
