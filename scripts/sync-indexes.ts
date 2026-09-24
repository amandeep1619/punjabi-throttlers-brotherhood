// Mongoose's autoIndex runs in the background on connect and isn't guaranteed
// to finish before the app starts serving queries — confirmed directly with
// .explain() while building the notification feature: a newly added compound
// index on Ride didn't show up in the query plan until this was run once.
// Run after every deploy that changes a model's indexes:
//   npm run sync-indexes
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { connectToDatabase } = await import("../lib/db");
  const { Member } = await import("../models/Member");
  const { Ride } = await import("../models/Ride");
  const { Badge } = await import("../models/Badge");
  const { MemberBadge } = await import("../models/MemberBadge");
  const { Review } = await import("../models/Review");
  const { PushSubscription } = await import("../models/PushSubscription");

  await connectToDatabase();

  for (const model of [Member, Ride, Badge, MemberBadge, Review, PushSubscription]) {
    const dropped = await model.syncIndexes();
    console.log(`${model.modelName}: synced (dropped stale: ${dropped.length ? dropped.join(", ") : "none"})`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
