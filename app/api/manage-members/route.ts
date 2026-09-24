import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listMembersAdmin } from "@/lib/queries/members";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? undefined;
  const pageSizeParam = searchParams.get("pageSize");
  // The admin table excludes the viewing admin's own row (nothing to ban/approve
  // on yourself); a member-picker (e.g. ride creation) needs the admin findable
  // too, so it opts in with includeSelf=true.
  const includeSelf = searchParams.get("includeSelf") === "true";
  const result = await listMembersAdmin({
    page,
    search,
    status,
    excludeId: includeSelf ? undefined : session.userId,
    ...(pageSizeParam ? { pageSize: Number(pageSizeParam) } : {}),
  });
  return NextResponse.json(result);
}
