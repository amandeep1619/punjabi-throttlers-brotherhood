import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Ride } from "@/models/Ride";
import { deleteFile } from "@/lib/storage";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, itemId } = await params;
  await connectToDatabase();
  const ride = await Ride.findById(id);
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  const item = ride.gallery.id(itemId);
  if (!item) return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });

  const url = item.url;
  const source = item.source;
  ride.gallery.pull(itemId);
  await ride.save();
  if (source === "upload") await deleteFile(url);

  return NextResponse.json({ ok: true });
}
