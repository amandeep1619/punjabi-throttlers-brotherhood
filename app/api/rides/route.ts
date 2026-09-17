import { NextRequest, NextResponse } from "next/server";
import { listRides } from "@/lib/queries/rides";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const yearParam = searchParams.get("year");
  const year = yearParam ? Number(yearParam) : undefined;

  const result = await listRides({ page, search, status, tag, year });
  return NextResponse.json(result);
}
