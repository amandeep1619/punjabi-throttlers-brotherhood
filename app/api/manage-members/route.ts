import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listMembersAdmin } from "@/lib/queries/members";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const search = searchParams.get("search") ?? "";
  const result = await listMembersAdmin({ page, search, excludeId: session.userId });
  return NextResponse.json(result);
}
