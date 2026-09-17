"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";

export function EnrollButton({
  rideId,
  alreadyEnrolled,
  isFull,
}: {
  rideId: string;
  alreadyEnrolled: boolean;
  isFull?: boolean;
}) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(alreadyEnrolled);

  async function handleEnroll() {
    setLoading(true);
    try {
      const res = await fetch(`/api/rides/${rideId}/enroll`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Could not enroll", "error");
        return;
      }
      setEnrolled(true);
      showToast("You're enrolled! See you on the road.", "success");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (enrolled) {
    return (
      <Button variant="outline" size="lg" disabled className="w-full">
        You&apos;re Enrolled
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button variant="outline" size="lg" disabled className="w-full">
        Ride Full
      </Button>
    );
  }

  return (
    <Button size="lg" className="w-full" onClick={handleEnroll} disabled={loading}>
      {loading ? "Enrolling…" : "Enroll for this Ride"}
    </Button>
  );
}
