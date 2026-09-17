"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";

export function RideStatusActions({ rideId, status }: { rideId: string; status: string }) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [loading, setLoading] = useState(false);

  async function setStatus(next: string, confirmMessage?: string) {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/manage-rides/${rideId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Could not update status", "error");
        return;
      }
      showToast(`Ride marked ${next}`, "success");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "upcoming") {
    return (
      <div className="flex gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() =>
            setStatus("completed", "Mark this ride completed? Km will be awarded to every enrolled member.")
          }
        >
          Mark Completed
        </Button>
        <Button size="sm" variant="danger" disabled={loading} onClick={() => setStatus("cancelled", "Cancel this ride?")}>
          Cancel
        </Button>
      </div>
    );
  }

  return null;
}
