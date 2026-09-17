import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Ride } from "@/models/Ride";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, memberId } = await params;
  await connectToDatabase();
  const ride = await Ride.findById(id);
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  if (ride.status === "completed") {
    return NextResponse.json(
      { error: "Cannot remove members from a completed ride (km already awarded)" },
      { status: 400 }
    );
  }

  ride.enrolledMembers = ride.enrolledMembers.filter((m) => m.toString() !== memberId);
  await ride.save();

  return NextResponse.json({ ok: true });
}
