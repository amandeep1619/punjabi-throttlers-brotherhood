import "server-only";
import { connectToDatabase } from "@/lib/db";
import { Member } from "@/models/Member";
import type { MemberStatus } from "@/models/Member";
import { escapeRegex } from "@/lib/format";

const PUBLIC_CARD_FIELDS = "memberId fullName photoUrl totalKmWithClub location";
const PROFILE_FIELDS =
  "memberId fullName photoUrl totalKmWithClub location dob gender bloodGroup country motorcycle ridingExperienceYears createdAt";
const ADMIN_FIELDS =
  "memberId fullName email photoUrl totalKmWithClub location permanentAddress dob gender bloodGroup country primaryMobile secondaryMobile motorcycle emergencyContact ridingExperienceYears inAnotherRidingGroup status role createdAt";

export async function getTopMembers(limit = 5, excludeId?: string) {
  await connectToDatabase();
  const filter: Record<string, unknown> = { status: "active" };
  if (excludeId) filter._id = { $ne: excludeId };
  return Member.find(filter)
    .sort({ totalKmWithClub: -1 })
    .limit(limit)
    .select(PUBLIC_CARD_FIELDS)
    .lean();
}

/** Members whose dob month+day match today (year-independent). */
export async function getTodaysBirthdays() {
  await connectToDatabase();
  const today = new Date();
  return Member.find({
    status: "active",
    $expr: {
      $and: [
        { $eq: [{ $month: "$dob" }, today.getMonth() + 1] },
        { $eq: [{ $dayOfMonth: "$dob" }, today.getDate()] },
      ],
    },
  })
    .select("memberId fullName photoUrl")
    .lean();
}

export async function listMembersPublic({
  page = 1,
  pageSize = 12,
  search = "",
  excludeId,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  excludeId?: string;
}) {
  await connectToDatabase();
  const filter: Record<string, unknown> = { status: "active" };
  if (excludeId) filter._id = { $ne: excludeId };
  if (search.trim()) filter.fullName = { $regex: escapeRegex(search.trim()), $options: "i" };

  const [items, total] = await Promise.all([
    Member.find(filter)
      .sort({ totalKmWithClub: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select(PUBLIC_CARD_FIELDS)
      .lean(),
    Member.countDocuments(filter),
  ]);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getMemberProfileById(id: string) {
  await connectToDatabase();
  return Member.findOne({ _id: id, status: "active" }).select(PROFILE_FIELDS).lean();
}

export async function getMemberAdminView(id: string) {
  await connectToDatabase();
  return Member.findById(id).select(ADMIN_FIELDS).lean();
}

export async function listMembersAdmin({
  page = 1,
  pageSize = 15,
  search = "",
  excludeId,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  excludeId?: string;
}) {
  await connectToDatabase();
  const filter: Record<string, unknown> = {};
  if (excludeId) filter._id = { $ne: excludeId };
  if (search.trim()) {
    const term = escapeRegex(search.trim());
    filter.$or = [{ fullName: { $regex: term, $options: "i" } }, { memberId: { $regex: term, $options: "i" } }];
  }

  const [items, total] = await Promise.all([
    Member.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select("memberId fullName email status role photoUrl createdAt")
      .lean(),
    Member.countDocuments(filter),
  ]);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function findMemberByEmailWithPassword(email: string) {
  await connectToDatabase();
  return Member.findOne({ email: email.toLowerCase() }).select("+passwordHash");
}

export type PublicMemberStatus = MemberStatus;
