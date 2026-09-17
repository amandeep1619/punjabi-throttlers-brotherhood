import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMemberProfileById, getMemberAdminView } from "@/lib/queries/members";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const member = session.role === "admin" ? await getMemberAdminView(id) : await getMemberProfileById(id);
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  return NextResponse.json({ member });
}
