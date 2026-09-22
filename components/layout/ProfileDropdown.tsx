"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AuthUser } from "@/store/useAuthStore";

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={`transition-transform ${open ? "rotate-180" : ""}`}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export function ProfileDropdown({ user }: { user: NonNullable<AuthUser> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- see LogoutButton for why this is a hard nav
    window.location.href = "/";
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-pt-cream/80 hover:text-pt-gold"
      >
        <span>{user.name.split(" ")[0]}</span>
        <span className="text-xs text-pt-muted">({user.memberId})</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-pt-border bg-pt-black-card shadow-xl py-1.5 overflow-hidden"
          onClick={() => setOpen(false)}
        >
          <Link href={`/me/${user.id}`} className="block px-4 py-2.5 text-sm text-pt-cream hover:bg-pt-border/40">
            Manage Profile
          </Link>
          <Link href={`/me/${user.id}/password`} className="block px-4 py-2.5 text-sm text-pt-cream hover:bg-pt-border/40">
            Change Password
          </Link>
          <Link href={`/me/${user.id}/rides`} className="block px-4 py-2.5 text-sm text-pt-cream hover:bg-pt-border/40">
            My Rides
          </Link>
          <Link href={`/me/${user.id}/badges`} className="block px-4 py-2.5 text-sm text-pt-cream hover:bg-pt-border/40">
            Badges
          </Link>
          <div className="border-t border-pt-border my-1.5" />
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2.5 text-sm text-red-300 hover:bg-pt-border/40"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
