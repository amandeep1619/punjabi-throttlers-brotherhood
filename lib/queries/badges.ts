// No "server-only" guard (unlike sibling query files) — scripts/seed-badges.ts
// imports reevaluateBadge directly via tsx, outside the Next.js bundler.
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Badge, type BadgeDoc } from "@/models/Badge";
import { MemberBadge } from "@/models/MemberBadge";
import { Member } from "@/models/Member";
import { Ride } from "@/models/Ride";

export async function listBadges() {
  await connectToDatabase();
  return Badge.find().sort({ criteriaType: 1, threshold: 1 }).lean();
}

export async function getBadge(id: string) {
  await connectToDatabase();
  return Badge.findById(id).lean();
}

export async function createBadge(data: {
  name: string;
  description: string;
  icon: string;
  criteriaType: "RIDE_COUNT" | "TOTAL_KM";
  tag?: string;
  threshold: number;
  active: boolean;
}) {
  await connectToDatabase();
  return Badge.create(data);
}

export async function updateBadge(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    icon: string;
    criteriaType: "RIDE_COUNT" | "TOTAL_KM";
    tag?: string;
    threshold: number;
    active: boolean;
  }>
) {
  await connectToDatabase();
  // $unset tag when it's explicitly cleared (criteriaType switched to TOTAL_KM) —
  // an ordinary $set would leave a stale tag value sitting on the document.
  const { tag, ...rest } = data;
  const update: Record<string, unknown> = { $set: rest };
  if ("tag" in data) {
    if (tag) (update.$set as Record<string, unknown>).tag = tag;
    else update.$unset = { tag: "" };
  }
  return Badge.findByIdAndUpdate(id, update, { returnDocument: "after" });
}

export async function deleteBadge(id: string) {
  await connectToDatabase();
  const badge = await Badge.findByIdAndDelete(id);
  if (badge) await MemberBadge.deleteMany({ badge: id });
  return badge;
}

export async function getMemberBadges(memberId: string) {
  await connectToDatabase();
  return MemberBadge.find({ member: memberId })
    .sort({ awardedAt: -1 })
    .populate("badge", "name description icon criteriaType tag threshold")
    .lean();
}

/** Member IDs (as strings) that currently meet a badge's criteria. */
async function getQualifyingMemberIds(badge: Pick<BadgeDoc, "criteriaType" | "tag" | "threshold">): Promise<string[]> {
  if (badge.criteriaType === "TOTAL_KM") {
    const members = await Member.find({ totalKmWithClub: { $gte: badge.threshold } })
      .select("_id")
      .lean();
    return members.map((m) => String(m._id));
  }

  // RIDE_COUNT — count completed rides per member, optionally filtered to a tag.
  const match: Record<string, unknown> = { status: "completed" };
  if (badge.tag) match.tags = badge.tag;
  const results = await Ride.aggregate<{ _id: unknown; count: number }>([
    { $match: match },
    { $unwind: "$enrolledMembers" },
    { $group: { _id: "$enrolledMembers", count: { $sum: 1 } } },
    { $match: { count: { $gte: badge.threshold } } },
  ]);
  return results.map((r) => String(r._id));
}

async function awardBadgeToMembers(badgeId: string, memberIds: string[]) {
  if (memberIds.length === 0) return;
  // Upsert per (member, badge) — a member who already has it is a no-op
  // thanks to the unique index, so this is always safe to re-run.
  await MemberBadge.bulkWrite(
    memberIds.map((memberId) => ({
      updateOne: {
        filter: { member: new Types.ObjectId(memberId), badge: new Types.ObjectId(badgeId) },
        update: {
          $setOnInsert: {
            member: new Types.ObjectId(memberId),
            badge: new Types.ObjectId(badgeId),
            awardedAt: new Date(),
          },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );
}

/**
 * Recomputes one badge against every member and awards it to whoever now
 * qualifies. Never revokes an already-awarded badge — thresholds can only
 * be raised/lowered going forward, not retroactively taken back.
 */
export async function reevaluateBadge(badgeId: string) {
  await connectToDatabase();
  const badge = await Badge.findById(badgeId).lean();
  if (!badge || !badge.active) return;
  const memberIds = await getQualifyingMemberIds(badge);
  await awardBadgeToMembers(badgeId, memberIds);
}

/**
 * Recomputes every active badge. Called after a ride is marked completed,
 * since that can move both ride-count and km-total badges at once — at this
 * club's scale (dozens of badges, hundreds of members) a full recompute per
 * completion is cheap, so there's no need to track exactly which badges a
 * given ride could possibly affect.
 */
export async function reevaluateAllActiveBadges() {
  await connectToDatabase();
  const badges = await Badge.find({ active: true }).lean();
  // Each badge's evaluation + award touches only its own MemberBadge rows,
  // so these are independent — running them one at a time was N sequential
  // round trips for no reason.
  await Promise.all(
    badges.map(async (badge) => {
      const memberIds = await getQualifyingMemberIds(badge);
      await awardBadgeToMembers(String(badge._id), memberIds);
    })
  );
}
