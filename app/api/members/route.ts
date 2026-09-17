import { NextRequest, NextResponse } from "next/server";
import { listMembersPublic } from "@/lib/queries/members";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const search = searchParams.get("search") ?? "";
  const result = await listMembersPublic({ page, search });
  return NextResponse.json(result);
}
