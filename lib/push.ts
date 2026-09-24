// No "server-only" guard here (unlike most lib/ files) — the notification
// cron scripts import this directly via tsx, outside the Next.js bundler,
// which would throw immediately on the `server-only` marker package.
import webpush, { WebPushError } from "web-push";
import { connectToDatabase } from "@/lib/db";
import { PushSubscription } from "@/models/PushSubscription";
import { Member } from "@/models/Member";

export type PushPayload = { title: string; body: string; url?: string };

// Lazy, not module-top-level: a missing VAPID var must only break an actual
// send attempt, never the whole route that imports this file (the ride-create
// route calls this from `after()`, but other routes/pages importing shared
// code paths shouldn't be able to go down with it — same lesson as the S3
// storage module-load bug from earlier).
let configured = false;
function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT must be set in the environment");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

const SEND_CONCURRENCY = 10; // keeps this light on the 1GB box — a burst of sockets, not all at once

/** Sends one payload to every subscription for the given member ids. Best-effort: a stale subscription (browser revoked it) is deleted; any other failure is skipped, never thrown. */
export async function sendPushToMembers(memberIds: string[], payload: PushPayload): Promise<void> {
  if (memberIds.length === 0) return;
  ensureConfigured();
  await connectToDatabase();

  const subs = await PushSubscription.find({ member: { $in: memberIds } }).lean();
  const body = JSON.stringify(payload);

  for (let i = 0; i < subs.length; i += SEND_CONCURRENCY) {
    const batch = subs.slice(i, i + SEND_CONCURRENCY);
    await Promise.all(
      batch.map(async (sub) => {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, body);
        } catch (err) {
          if (err instanceof WebPushError && (err.statusCode === 404 || err.statusCode === 410)) {
            // Browser/OS revoked this subscription — stop trying it forever, not just this once.
            await PushSubscription.deleteOne({ _id: sub._id }).catch(() => {});
          }
        }
      })
    );
  }
}

/** Sends to every active member — birthday announcements, new-ride notices. */
export async function sendPushToAllActiveMembers(payload: PushPayload): Promise<void> {
  await connectToDatabase();
  const members = await Member.find({ status: "active" }).select("_id").lean();
  await sendPushToMembers(
    members.map((m) => String(m._id)),
    payload
  );
}
