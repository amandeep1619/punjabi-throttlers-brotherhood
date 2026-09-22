"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/store/useUiStore";
import { useAuthStore } from "@/store/useAuthStore";
import { LinkButton } from "@/components/ui/Button";
import LogoutButton from "@/components/layout/LogoutButton";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";

const LINKS = [
  { href: "/rides", label: "Rides" },
  { href: "/members", label: "Members" },
  { href: "/policies", label: "Policies" },
];

// One navbar for every route group. Which links show (Login/Join vs.
// Admin/profile/Logout) is driven entirely by session state, not by which
// route group rendered it — the homepage is reachable both logged out and
// logged in, so it needs the same auth-aware nav as everywhere else.
export default function Navbar() {
  const pathname = usePathname();
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-40 border-b border-pt-border/60 bg-pt-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-18 flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image src="/brand/logo.png" alt="Punjabi Throttlers Brotherhood" width={44} height={44} className="rounded-full" priority />
          <span className="font-semibold tracking-wide text-pt-cream hidden sm:block">
            Punjabi Throttlers <span className="text-pt-gold">Brotherhood</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href ? "text-pt-gold" : "text-pt-cream/80 hover:text-pt-gold"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/manage-members" className="text-sm text-pt-cream/80 hover:text-pt-gold">
                  Admin
                </Link>
              )}
              <ProfileDropdown user={user} />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-pt-cream/80 hover:text-pt-gold">
                Login
              </Link>
              <LinkButton href="/join" size="sm">
                Join Now
              </LinkButton>
            </>
          )}
        </nav>

        <button className="md:hidden text-pt-cream p-2" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-pt-border/60 px-4 py-4 flex flex-col gap-4">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-sm text-pt-cream/80 hover:text-pt-gold">
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/manage-members" onClick={() => setOpen(false)} className="text-sm text-pt-cream/80 hover:text-pt-gold">
                  Admin
                </Link>
              )}
              <Link href={`/me/${user.id}`} onClick={() => setOpen(false)} className="text-sm text-pt-cream/80 hover:text-pt-gold">
                Manage Profile
              </Link>
              <Link href={`/me/${user.id}/password`} onClick={() => setOpen(false)} className="text-sm text-pt-cream/80 hover:text-pt-gold">
                Change Password
              </Link>
              <Link href={`/me/${user.id}/rides`} onClick={() => setOpen(false)} className="text-sm text-pt-cream/80 hover:text-pt-gold">
                My Rides
              </Link>
              <Link href={`/me/${user.id}/badges`} onClick={() => setOpen(false)} className="text-sm text-pt-cream/80 hover:text-pt-gold">
                Badges
              </Link>
              <LogoutButton className="w-fit" />
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm text-pt-cream/80 hover:text-pt-gold">
                Login
              </Link>
              <LinkButton href="/join" size="sm" className="w-fit">
                Join Now
              </LinkButton>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
