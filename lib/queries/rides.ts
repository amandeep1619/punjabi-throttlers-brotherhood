// No "server-only" guard here (unlike most lib/ files) — the notification
// cron scripts import this directly via tsx, outside the Next.js bundler,
// which would throw immediately on the `server-only` marker package.
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Ride } from "@/models/Ride";
import { Member } from "@/models/Member";
import { escapeRegex } from "@/lib/format";

const CARD_FIELDS = "title description banner distanceKm startDate endDate status tags featured enrolledMembers";

export async function getFeaturedRide() {
  await connectToDatabase();
  return Ride.findOne({ featured: true }).sort({ startDate: -1 }).select(CARD_FIELDS).lean();
}

export async function getNextUpcomingRide() {
  await connectToDatabase();
  return Ride.findOne({ status: "upcoming" }).sort({ startDate: 1 }).select(CARD_FIELDS).lean();
}

/** Up to `limit` soonest upcoming rides — homepage preview. */
export async function listUpcomingRides(limit = 5) {
  await connectToDatabase();
  return Ride.find({ status: "upcoming" }).sort({ startDate: 1 }).limit(limit).select(CARD_FIELDS).lean();
}

/** Up to `limit` most recently completed rides — homepage preview. */
export async function listRecentCompletedRides(limit = 5) {
  await connectToDatabase();
  return Ride.find({ status: "completed" }).sort({ startDate: -1 }).limit(limit).select(CARD_FIELDS).lean();
}

/**
 * Whether `userId` is in a ride's enrolledMembers — accepts either raw
 * ObjectIds or populated Member docs, since callers fetch rides both ways.
 */
export function isRideEnrolled(ride: unknown, userId?: string): boolean {
  if (!userId) return false;
  const enrolledMembers = (ride as { enrolledMembers?: unknown[] }).enrolledMembers ?? [];
  return enrolledMembers.some((m) => {
    const id = typeof m === "object" && m !== null && "_id" in (m as object) ? (m as { _id: unknown })._id : m;
    return String(id) === userId;
  });
}

/** Rides a given member is enrolled in — "My Rides". */
export async function listMemberRides(memberId: string) {
  await connectToDatabase();
  return Ride.find({ enrolledMembers: memberId })
    .sort({ startDate: -1 })
    .select("title description banner distanceKm startDate endDate status tags featured")
    .lean();
}

export async function listRides({
  page = 1,
  pageSize = 9,
  search = "",
  status,
  year,
  tag,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  year?: number;
  tag?: string;
}) {
  await connectToDatabase();
  const filter: Record<string, unknown> = {};
  if (search.trim()) filter.title = { $regex: escapeRegex(search.trim()), $options: "i" };
  if (status) filter.status = status;
  if (tag) filter.tags = tag;
  if (year) {
    filter.startDate = {
      $gte: new Date(`${year}-01-01T00:00:00.000Z`),
      $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
    };
  }

  const [items, total] = await Promise.all([
    Ride.find(filter)
      .sort({ startDate: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select(CARD_FIELDS)
      .lean(),
    Ride.countDocuments(filter),
  ]);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getRideById(id: string) {
  await connectToDatabase();
  return Ride.findById(id).populate("enrolledMembers", "memberId fullName photoUrl location").lean();
}

export async function getRideRaw(id: string) {
  await connectToDatabase();
  return Ride.findById(id).lean();
}

export async function enrollMemberInRide(rideId: string, memberId: string) {
  await connectToDatabase();
  const ride = await Ride.findOne({ _id: rideId, status: "upcoming" });
  if (!ride) return { ok: false as const, reason: "Ride is not open for enrollment" };
  if (ride.enrolledMembers.some((m) => m.toString() === memberId)) {
    return { ok: false as const, reason: "Already enrolled" };
  }
  // Slots are a soft cap, not a hard one: once full, enrolling still
  // succeeds — the rider just joins past capacity (a waitlist/queue by
  // effect, not a separate tracked state) rather than being blocked.
  const queued = Boolean(ride.maxSlots && ride.enrolledMembers.length >= ride.maxSlots);
  ride.enrolledMembers.push(new mongoose.Types.ObjectId(memberId));
  await ride.save();
  return { ok: true as const, queued };
}

/**
 * Marks a ride completed and awards its distance to every enrolled member's
 * totalKmWithClub, exactly once. `kmAwarded: false` in the initial filter is
 * the idempotency key — a retry/double-click matches nothing and no-ops.
 */
export async function completeRide(rideId: string) {
  await connectToDatabase();
  const session = await mongoose.startSession();
  try {
    let awarded = false;
    await session.withTransaction(async () => {
      const ride = await Ride.findOne({ _id: rideId, kmAwarded: false }).session(session);
      if (!ride) return;
      await Member.updateMany(
        { _id: { $in: ride.enrolledMembers } },
        { $inc: { totalKmWithClub: ride.distanceKm } },
        { session }
      );
      ride.status = "completed";
      ride.kmAwarded = true;
      ride.completedAt = new Date();
      await ride.save({ session });
      awarded = true;
    });
    return { ok: true as const, awarded };
  } finally {
    await session.endSession();
  }
}

/** Completed rides at least 24h old with no review-reminder push sent yet. */
export async function getRidesNeedingReviewReminder() {
  await connectToDatabase();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return Ride.find({ status: "completed", reviewReminderSent: false, completedAt: { $lte: cutoff } })
    .select("title enrolledMembers")
    .lean();
}

export async function markReviewReminderSent(rideId: string) {
  await connectToDatabase();
  await Ride.updateOne({ _id: rideId }, { reviewReminderSent: true });
}
