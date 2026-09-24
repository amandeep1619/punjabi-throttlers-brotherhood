// Manual/testing entry point for the review-reminder check — in production
// this runs automatically via the in-process scheduler (lib/scheduler.ts,
// started from instrumentation.ts). No cron needed. Kept as a script for
// on-demand testing without restarting the server.
//   npm run notify:review-reminders
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { runReviewReminderCheck } = await import("../lib/notifications");
  const results = await runReviewReminderCheck();
  if (results.length === 0) {
    console.log("No rides need a review reminder right now.");
  } else {
    for (const r of results) console.log(`Reminded ${r.riderCount} rider(s) for "${r.title}".`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
