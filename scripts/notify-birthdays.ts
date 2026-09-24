// Manual/testing entry point for the birthday check — in production this
// runs automatically via the in-process scheduler (lib/scheduler.ts,
// started from instrumentation.ts). No cron needed. Kept as a script for
// on-demand testing without restarting the server.
//   npm run notify:birthdays
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { runBirthdayCheck } = await import("../lib/notifications");
  const result = await runBirthdayCheck();
  console.log(result.sent ? `Sent birthday notification for: ${result.names.join(", ")}` : "Nothing to send (no birthday today, or already sent today).");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
