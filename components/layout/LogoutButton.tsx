"use client";

import { Button } from "@/components/ui/Button";

export default function LogoutButton({ className = "" }: { className?: string }) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // Hard navigation — see LoginForm for why: the root layout's admin/user
    // nav state comes from the session cookie, and only a full reload
    // guarantees that layout re-runs against the now-cleared cookie.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional hard reload, see comment above
    window.location.href = "/";
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} className={className}>
      Logout
    </Button>
  );
}
