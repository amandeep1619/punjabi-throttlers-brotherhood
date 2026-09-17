import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Member } from "@/models/Member";
import { changePasswordSchema } from "@/lib/validation/member";

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }

  await connectToDatabase();
  // id always comes from the session, never the client — same rule as the rest of /api/me.
  const member = await Member.findById(session.userId).select("+passwordHash");
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const validCurrent = await verifyPassword(parsed.data.currentPassword, member.passwordHash);
  if (!validCurrent) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  member.passwordHash = await hashPassword(parsed.data.newPassword);
  await member.save();

  return NextResponse.json({ ok: true });
}
