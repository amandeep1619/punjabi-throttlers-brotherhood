"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";
import { useAuthStore } from "@/store/useAuthStore";

const QUEUE_TOOLTIP = "Slots are already full but we will add you into the queue if you want";

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
  const pathname = usePathname();
  const showToast = useUiStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(alreadyEnrolled);

  // The page itself is public now — /api/rides/[id]/enroll still requires a
  // session (proxy.ts), so a logged-out visitor gets a clean prompt instead
  // of clicking "Enroll" and hitting a raw "Unauthorized" toast.
  if (!user) {
    return (
      <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="block">
        <Button variant="outline" size="lg" className="w-full">
          Log in to enroll
        </Button>
      </Link>
    );
  }

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
      showToast(data.queued ? "You're on the waitlist — we'll add you if a slot opens up." : "You're enrolled! See you on the road.", "success");
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

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleEnroll}
      disabled={loading}
      title={isFull ? QUEUE_TOOLTIP : undefined}
    >
      {loading ? "Enrolling…" : "Enroll"}
    </Button>
  );
}
