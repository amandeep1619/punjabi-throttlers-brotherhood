import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Member } from "@/models/Member";

// Reversible toggle, same shape as the ban toggle — member <-> admin.
export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === session.userId) {
    return NextResponse.json({ error: "You cannot change your own admin role" }, { status: 400 });
  }

  await connectToDatabase();
  const target = await Member.findById(id).select("memberId role");
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  target.role = target.role === "admin" ? "member" : "admin";
  await target.save();

  return NextResponse.json({ ok: true, member: { memberId: target.memberId, role: target.role } });
}
