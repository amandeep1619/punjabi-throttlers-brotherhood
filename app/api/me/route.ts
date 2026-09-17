import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Member } from "@/models/Member";
import { meUpdateSchema } from "@/lib/validation/member";

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = meUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const { make, model, year, licensePlate, ...rest } = parsed.data;

  await connectToDatabase();

  const update: Record<string, unknown> = { ...rest };
  if (make !== undefined) update["motorcycle.make"] = make;
  if (model !== undefined) update["motorcycle.model"] = model;
  if (year !== undefined) update["motorcycle.year"] = year;
  if (licensePlate !== undefined) update["motorcycle.licensePlate"] = licensePlate;

  // id always comes from the session, never trusted from the client/URL.
  const member = await Member.findByIdAndUpdate(session.userId, { $set: update }, { returnDocument: "after" }).select(
    "memberId fullName primaryMobile secondaryMobile location permanentAddress motorcycle"
  );

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  return NextResponse.json({ ok: true, member });
}
