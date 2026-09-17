import { NextResponse } from "next/server";
import { getRideById } from "@/lib/queries/rides";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ride = await getRideById(id);
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  return NextResponse.json({ ride });
}
