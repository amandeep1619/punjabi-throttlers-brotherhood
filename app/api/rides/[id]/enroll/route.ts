import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { enrollMemberInRide } from "@/lib/queries/rides";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await enrollMemberInRide(id, session.userId);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 });
  return NextResponse.json({ ok: true, queued: result.queued });
}
