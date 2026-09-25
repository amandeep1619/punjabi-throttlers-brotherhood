import { NextRequest, NextResponse } from "next/server";
import { joinSchema } from "@/lib/validation/member";
import { connectToDatabase } from "@/lib/db";
import { Member } from "@/models/Member";
import { hashPassword } from "@/lib/auth";
import { getNextMemberId } from "@/lib/counters";
import { saveFile, UploadError } from "@/lib/storage";
import { clientIp, isRateLimited } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  if (isRateLimited(`join:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  const formData = await request.formData();
  const raw = Object.fromEntries(formData.entries());

  const parsed = joinSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid form data" }, { status: 400 });
  }
  const data = parsed.data;

  await connectToDatabase();

  const existing = await Member.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  // Generated before the upload (not after) so the photo, if any, can live
  // under this member's own memberId-keyed S3 folder.
  const memberId = await getNextMemberId();

  let photoUrl: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      photoUrl = await saveFile(photo, { kind: "member-profile", memberId });
    } catch (err) {
      if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
      throw err;
    }
  }

  const passwordHash = await hashPassword(data.password);

  const member = await Member.create({
    memberId,
    fullName: data.fullName,
    email: data.email.toLowerCase(),
    passwordHash,
    status: "pending",
    photoUrl,
    dob: data.dob,
    gender: data.gender,
    bloodGroup: data.bloodGroup,
    primaryMobile: data.primaryMobile,
    country: data.country,
    emergencyContact: {
      fullName: data.emergencyFullName,
      relationship: data.emergencyRelationship,
      phone: data.emergencyPhone,
    },
    motorcycle: {
      make: data.make,
      model: data.model,
      year: data.year,
      licensePlate: data.licensePlate,
    },
    ridingExperienceYears: data.ridingExperienceYears,
    inAnotherRidingGroup: data.inAnotherRidingGroup,
    totalKmWithClub: 0,
  });

  return NextResponse.json({ ok: true, memberId: member.memberId }, { status: 201 });
}
