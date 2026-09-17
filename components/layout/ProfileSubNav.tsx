"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileSubNav({ memberId }: { memberId: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/me/${memberId}`, label: "Manage Profile" },
    { href: `/me/${memberId}/password`, label: "Change Password" },
    { href: `/me/${memberId}/rides`, label: "My Rides" },
  ];

  return (
    <div className="flex gap-6 border-b border-pt-border mb-8 overflow-x-auto">
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
  );
}
