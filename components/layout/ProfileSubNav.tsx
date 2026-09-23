"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileSubNav({ memberId }: { memberId: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/me/${memberId}`, label: "Manage Profile" },
    { href: `/me/${memberId}/password`, label: "Change Password" },
    { href: `/me/${memberId}/rides`, label: "My Rides" },
    { href: `/me/${memberId}/badges`, label: "Badges" },
  ];

  return (
    <div className="relative mb-8 border-b border-pt-border">
      <div className="flex gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                active ? "border-pt-gold text-pt-gold" : "border-transparent text-pt-muted hover:text-pt-cream"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {/* Hints that the tab strip scrolls — on narrow phones "Badges" sits fully
          off-screen with no other affordance that it's there. */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-px w-8 bg-linear-to-l from-pt-black to-transparent sm:hidden" />
    </div>
  );
}
