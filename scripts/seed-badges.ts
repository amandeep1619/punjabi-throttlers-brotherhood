// Seeds the default achievement badges. Safe to re-run — skips any badge
// whose name already exists (admins may have edited/deleted some by then).
//   npm run seed:badges
import { config } from "dotenv";
config({ path: ".env.local" });

const TIERS = [
  { label: "Rookie", icon: "🔰" },
  { label: "Bronze", icon: "🥉" },
  { label: "Silver", icon: "🥈" },
  { label: "Gold", icon: "🥇" },
  { label: "Platinum", icon: "💠" },
  { label: "Diamond", icon: "💎" },
  { label: "Elite", icon: "⭐" },
  { label: "Master", icon: "🌟" },
  { label: "Champion", icon: "🏆" },
  { label: "Legend", icon: "👑" },
  { label: "Mythic", icon: "🔥" },
  { label: "Immortal", icon: "⚡" },
  { label: "Eternal", icon: "🌌" },
  { label: "Ascendant", icon: "🚀" },
  { label: "Godlike", icon: "☄️" },
];

const OVERALL_RIDE_THRESHOLDS = [1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200];
const KM_THRESHOLDS = [100, 250, 500, 1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000];
const TAGS: { tag: string; label: string }[] = [
  { tag: "one-day", label: "One-Day Rider" },
  { tag: "night-stay", label: "Night Rider" },
  { tag: "weekend", label: "Weekend Warrior" },
  { tag: "multi-day", label: "Multi-Day Explorer" },
  { tag: "rally", label: "Rally Rider" },
];
const TAG_THRESHOLDS = [1, 3, 5, 10, 20];

type SeedBadge = {
  name: string;
  description: string;
  icon: string;
  criteriaType: "RIDE_COUNT" | "TOTAL_KM";
  tag?: string;
  threshold: number;
};

const badges: SeedBadge[] = [
  ...OVERALL_RIDE_THRESHOLDS.map((threshold, i) => ({
    name: `${TIERS[i].label} Rider`,
    description: `Completed ${threshold} ride${threshold === 1 ? "" : "s"} with the brotherhood.`,
    icon: TIERS[i].icon,
    criteriaType: "RIDE_COUNT" as const,
    threshold,
  })),
  ...KM_THRESHOLDS.map((threshold, i) => ({
    name: `${TIERS[i].label} Voyager`,
    description: `Covered ${threshold.toLocaleString("en-IN")} km with the brotherhood.`,
    icon: TIERS[i].icon,
    criteriaType: "TOTAL_KM" as const,
    threshold,
  })),
  ...TAGS.flatMap(({ tag, label }) =>
    TAG_THRESHOLDS.map((threshold, i) => ({
      name: `${TIERS[i].label} ${label}`,
      description: `Completed ${threshold} "${tag}" ride${threshold === 1 ? "" : "s"}.`,
      icon: TIERS[i].icon,
      criteriaType: "RIDE_COUNT" as const,
      tag,
      threshold,
    }))
  ),
];

async function main() {
  const { connectToDatabase } = await import("../lib/db");
  const { Badge } = await import("../models/Badge");
  const { reevaluateBadge } = await import("../lib/queries/badges");
  await connectToDatabase();

  let created = 0;
  for (const b of badges) {
    const existing = await Badge.findOne({ name: b.name });
    if (existing) continue;
    const badge = await Badge.create({ ...b, active: true });
    // Same retroactive-award behavior the real admin create-badge API
    // triggers — members who already qualify get it immediately.
    await reevaluateBadge(String(badge._id));
    created++;
  }

  console.log(`Seeded ${created} new badges (${badges.length} defined, ${badges.length - created} already existed).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
