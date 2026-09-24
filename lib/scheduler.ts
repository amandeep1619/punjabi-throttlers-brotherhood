// Runs inside the same Next.js server process that's already handling web
// traffic — not a separate worker/queue. A 5-minute poll doing one or two
// cheap Mongo queries is negligible; a dedicated process would be pure RAM
// overhead this 1GB box can't spare. Started once from instrumentation.ts.
import { runBirthdayCheck, runReviewReminderCheck, istHour } from "@/lib/notifications";

const POLL_INTERVAL_MS = 5 * 60 * 1000;
const BIRTHDAY_NOT_BEFORE_IST_HOUR = 7;

let started = false;

export function startScheduler() {
  if (started) return; // guards against register() firing more than once (e.g. dev HMR)
  started = true;

  async function tick() {
    if (istHour() >= BIRTHDAY_NOT_BEFORE_IST_HOUR) {
      try {
        const result = await runBirthdayCheck();
        if (result.sent) console.log(`[scheduler] Sent birthday notification for: ${result.names.join(", ")}`);
      } catch (err) {
        console.error("[scheduler] birthday check failed:", err);
      }
    }

    try {
      const reminded = await runReviewReminderCheck();
      if (reminded.length > 0) {
        console.log(`[scheduler] Sent review reminders for: ${reminded.map((r) => r.title).join(", ")}`);
      }
    } catch (err) {
      console.error("[scheduler] review reminder check failed:", err);
    }
  }

  tick(); // also run once at boot, so a restart doesn't wait up to 5 min to catch up
  setInterval(tick, POLL_INTERVAL_MS);
}
