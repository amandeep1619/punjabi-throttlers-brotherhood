// 3 dummy rides for testing reviews from the admin account — each is
// status "completed" with completedAt 48h in the past (reviews unlock 24h
// after completedAt, see lib/queries/reviews.ts) and has the admin
// (ADMIN_EMAIL) enrolled, so reviews are writable immediately after seeding.
// Safe to re-run — skips rides whose title already exists.
//   npm run seed:review-test
import { config } from "dotenv";
config({ path: ".env.local" });

const RIDES = [
  {
    title: "Test Ride — Sirhind Canal Run",
    description: "Dummy ride for testing the review flow.",
    distanceKm: 120,
    startDate: "2026-09-10",
  },
  {
    title: "Test Ride — Pathankot Border Loop",
    description: "Dummy ride for testing the review flow.",
    distanceKm: 240,
    startDate: "2026-09-05",
  },
  {
    title: "Test Ride — Kapurthala Heritage Run",
    description: "Dummy ride for testing the review flow.",
    distanceKm: 90,
    startDate: "2026-08-28",
  },
];

async function main() {
  const { connectToDatabase } = await import("../lib/db");
  const { Member } = await import("../models/Member");
  const { Ride } = await import("../models/Ride");

  const email = process.env.ADMIN_EMAIL;
  if (!email) throw new Error("Set ADMIN_EMAIL in .env.local before running this script.");

  await connectToDatabase();

  const admin = await Member.findOne({ email: email.toLowerCase(), role: "admin" });
  if (!admin) throw new Error(`No admin found for ${email}. Run "npm run seed:admin" first.`);

  const completedAt = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48h ago — past the 24h review-unlock wait

  for (const [i, r] of RIDES.entries()) {
    const existing = await Ride.findOne({ title: r.title });
    if (existing) {
      console.log(`Skipped (already exists) — ${r.title}`);
      continue;
    }

    await Ride.create({
      title: r.title,
      description: r.description,
      distanceKm: r.distanceKm,
      startDate: new Date(r.startDate),
      status: "completed",
      completedAt,
      kmAwarded: true,
      tags: ["one-day"],
      featured: false,
      banner: { url: `https://picsum.photos/seed/review-test-${i + 1}/1000/560`, source: "external" },
      gallery: [],
      itinerary: [],
      enrolledMembers: [admin._id],
    });
    console.log(`Created ride — ${r.title}`);
  }

  console.log(`\nDone. Log in as ${email} and open any "Test Ride —" ride to leave a review.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
