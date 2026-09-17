"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";

export function DeleteRideButton({ rideId }: { rideId: string }) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this ride permanently? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/manage-rides/${rideId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? "Could not delete ride", "error");
        return;
      }
      showToast("Ride deleted", "success");
      router.push("/manage-rides");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? "Deleting…" : "Delete Ride"}
    </Button>
  );
}
