// Next.js calls register() once when the server process starts. This is
// where the notification scheduler (lib/scheduler.ts) gets started — no
// external cron needed for the birthday/review-reminder triggers, see
// DEPLOYMENT.md § 6.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startScheduler } = await import("@/lib/scheduler");
    startScheduler();
  }
}
