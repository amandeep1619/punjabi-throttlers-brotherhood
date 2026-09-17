import "server-only";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Ride } from "@/models/Ride";
import { Member } from "@/models/Member";

export async function getLatestRide() {
  await connectToDatabase();
  return Ride.findOne().sort({ startDate: -1 }).lean();
}

export async function getFeaturedRide() {
  await connectToDatabase();
  return Ride.findOne({ featured: true }).sort({ startDate: -1 }).lean();
}

export async function getNextUpcomingRide() {
  await connectToDatabase();
  return Ride.findOne({ status: "upcoming" }).sort({ startDate: 1 }).lean();
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
  if (search.trim()) filter.title = { $regex: search.trim(), $options: "i" };
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
      .select("title description banner distanceKm startDate endDate status tags featured")
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
  // ponytail: check-then-push, not an atomic $expr update — a two-rider dead
  // heat on the very last slot could over-enroll by one. Not worth a
  // transaction at this club's scale (human-paced clicks, not a queue).
  if (ride.maxSlots && ride.enrolledMembers.length >= ride.maxSlots) {
    return { ok: false as const, reason: "This ride is full" };
  }
  ride.enrolledMembers.push(new mongoose.Types.ObjectId(memberId));
  await ride.save();
  return { ok: true as const };
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
      await ride.save({ session });
      awarded = true;
    });
    return { ok: true as const, awarded };
  } finally {
    await session.endSession();
  }
}
