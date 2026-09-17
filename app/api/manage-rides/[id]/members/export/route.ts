import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Ride } from "@/models/Ride";

const ROSTER_FIELDS = "memberId fullName bloodGroup location motorcycle primaryMobile emergencyContact";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await connectToDatabase();
  const ride = await Ride.findById(id).populate("enrolledMembers", ROSTER_FIELDS).lean();
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  const startDate = new Date(ride.startDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const blocks = (ride.enrolledMembers as unknown as Array<{
    fullName: string;
    memberId: string;
    bloodGroup: string;
    location?: string;
    motorcycle: { licensePlate: string; make: string; model: string };
    primaryMobile: string;
    emergencyContact: { phone: string };
  }>).map(
    (m) =>
      `Name (PT No.): ${m.fullName} (${m.memberId})\n` +
      `Blood group: ${m.bloodGroup}\n` +
      `City: ${m.location ?? "-"}\n` +
      `Bike no: ${m.motorcycle.licensePlate}\n` +
      `Bike Model: ${m.motorcycle.make} ${m.motorcycle.model}\n` +
      `Personal Mobile no: ${m.primaryMobile}\n` +
      `Emergency Mobile no: ${m.emergencyContact.phone}`
  );

  const text = `${ride.title}\n${startDate}\n\n${blocks.join("\n\n")}\n`;

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${ride.title.replace(/[^a-z0-9]+/gi, "-")}-members.txt"`,
    },
  });
}
