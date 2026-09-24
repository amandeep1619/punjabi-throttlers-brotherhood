// No "server-only" guard — the standalone notify:* scripts import this
// directly via tsx, outside the Next.js bundler.
import { connectToDatabase } from "@/lib/db";
import { getTodaysBirthdays } from "@/lib/queries/members";
import { getRidesNeedingReviewReminder, markReviewReminderSent } from "@/lib/queries/rides";
import { sendPushToAllActiveMembers, sendPushToMembers } from "@/lib/push";
import { NotificationLog } from "@/models/NotificationLog";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // fixed, no DST — safe to hardcode

/** "Wall-clock" IST time, computed from a UTC timestamp shift rather than
 * server-local timezone — the same fix as getTodaysBirthdays' UTC bug, since
 * this reads the shifted timestamp with UTC getters throughout. */
function istNow(): Date {
  return new Date(Date.now() + IST_OFFSET_MS);
}

export function istHour(): number {
  return istNow().getUTCHours();
}

function istDateString(): string {
  return istNow().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/**
 * Sends the daily birthday push once per IST calendar day, only if there's
 * an actual birthday. The "once per day" guard is unconditional (protects
 * against a double-send from any caller); the "only after 7am" business rule
 * is the scheduler's decision, not this function's — a manual/test run
 * should be able to fire regardless of time of day.
 */
export async function runBirthdayCheck(): Promise<{ sent: boolean; names: string[] }> {
  await connectToDatabase();
  const today = istDateString();

  const log = await NotificationLog.findById("birthday").lean();
  if (log?.lastSentDate === today) return { sent: false, names: [] };

  const birthdays = await getTodaysBirthdays();
  // Record today even with zero birthdays — "checked, nothing to send" is
  // still a resolved outcome, so later ticks the same day skip the query.
  await NotificationLog.findByIdAndUpdate("birthday", { lastSentDate: today }, { upsert: true });

  if (birthdays.length === 0) return { sent: false, names: [] };

  const names = birthdays.map((m) => m.fullName);
  await sendPushToAllActiveMembers({
    title: "Happy Birthday!",
    body: `Wish ${names.join(", ")} Happy Birthday`,
    url: "/",
  });
  return { sent: true, names };
}

/** Sends a review-reminder push for every completed ride 24h+ old that hasn't been reminded yet. */
export async function runReviewReminderCheck(): Promise<{ title: string; riderCount: number }[]> {
  await connectToDatabase();
  const rides = await getRidesNeedingReviewReminder();
  const results: { title: string; riderCount: number }[] = [];

  for (const ride of rides) {
    const memberIds = (ride.enrolledMembers as unknown as { toString(): string }[]).map((id) => id.toString());
    if (memberIds.length > 0) {
      await sendPushToMembers(memberIds, {
        title: "Ride Review",
        body: `Share your feedbacks for ${ride.title} Ride`,
        url: `/rides/${ride._id}`,
      });
    }
    await markReviewReminderSent(String(ride._id));
    results.push({ title: ride.title, riderCount: memberIds.length });
  }

  return results;
}
