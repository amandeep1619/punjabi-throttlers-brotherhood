import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Ride } from "@/models/Ride";
import { Member } from "@/models/Member";

const ROSTER_FIELDS = "memberId fullName bloodGroup location motorcycle primaryMobile emergencyContact";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await connectToDatabase();
  const ride = await Ride.findById(id).populate("enrolledMembers", ROSTER_FIELDS).lean();
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  return NextResponse.json({ title: ride.title, startDate: ride.startDate, members: ride.enrolledMembers });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const memberId: string | undefined = body?.memberId;
  if (!memberId) return NextResponse.json({ error: "memberId is required" }, { status: 400 });

  await connectToDatabase();
  const [ride, member] = await Promise.all([
    Ride.findById(id),
    Member.findOne({ memberId }).select("_id"),
  ]);
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  if (!member) return NextResponse.json({ error: "No member with that ID" }, { status: 404 });

  if (!ride.enrolledMembers.some((m) => m.toString() === member.id)) {
    ride.enrolledMembers.push(member._id);
    await ride.save();
  }

  return NextResponse.json({ ok: true });
}
