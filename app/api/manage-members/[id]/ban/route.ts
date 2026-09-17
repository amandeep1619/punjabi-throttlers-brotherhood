import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Member } from "@/models/Member";

// Reversible toggle: banned -> active, anything else -> banned.
export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === session.userId) {
    return NextResponse.json({ error: "You cannot ban your own account" }, { status: 400 });
  }

  await connectToDatabase();
  const target = await Member.findById(id).select("memberId status");
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  target.status = target.status === "banned" ? "active" : "banned";
  await target.save();

  return NextResponse.json({ ok: true, member: { memberId: target.memberId, status: target.status } });
}
