"use client";

import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui/Button";

// Shared by each route group's error.tsx — same "shell stays, content area
// swaps" boundary placement as LoadingScreen, so the navbar doesn't vanish
// when a page segment throws.
export default function ErrorScreen({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="h-14 w-14 rounded-full border border-red-500/40 bg-red-500/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-300">
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold text-pt-cream">Something went wrong</p>
        <p className="text-sm text-pt-muted mt-1 max-w-sm">
          This page hit an unexpected error. You can try again, or head back home.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
        <LinkButton href="/" variant="ghost">
          Go home
        </LinkButton>
      </div>
    </div>
  );
}
