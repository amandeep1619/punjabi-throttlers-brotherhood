import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Ride } from "@/models/Ride";
import { completeRide } from "@/lib/queries/rides";
import { rideStatusOptions } from "@/lib/validation/ride";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!rideStatusOptions.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (status === "completed") {
    const result = await completeRide(id);
    return NextResponse.json(result);
  }

  await connectToDatabase();
  const ride = await Ride.findByIdAndUpdate(id, { status }, { returnDocument: "after" }).select("status");
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  return NextResponse.json({ ok: true, ride });
}
