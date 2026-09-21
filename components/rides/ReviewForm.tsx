"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StarPicker } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";

export function ReviewForm({
  rideId,
  existing,
}: {
  rideId: string;
  existing?: { rating: number; text: string } | null;
}) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [text, setText] = useState(existing?.text ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      showToast("Pick a star rating", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/rides/${rideId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Could not submit review", "error");
        return;
      }
      showToast(existing ? "Review updated" : "Thanks for the review!", "success");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="How was the ride?"
        rows={3}
        className="w-full rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2.5 text-sm text-pt-cream focus:outline-none focus:border-pt-gold"
      />
      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? "Saving…" : existing ? "Update Review" : "Post Review"}
      </Button>
    </form>
  );
}
