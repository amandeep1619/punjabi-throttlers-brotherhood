"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/manage-members", label: "Members" },
  { href: "/manage-rides", label: "Rides" },
  { href: "/manage-badges", label: "Badges" },
  { href: "/manage-policies", label: "Policies" },
];

export default function AdminSubNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-pt-border/60 bg-pt-black-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex gap-6 overflow-x-auto">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                active ? "border-pt-gold text-pt-gold" : "border-transparent text-pt-muted hover:text-pt-cream"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
