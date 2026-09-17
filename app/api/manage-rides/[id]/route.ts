import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Ride } from "@/models/Ride";
import { rideFormSchema } from "@/lib/validation/ride";
import { saveFile, deleteFile } from "@/lib/storage";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const formData = await request.formData();
  const raw = Object.fromEntries(formData.entries());
  const tags =
    typeof raw.tags === "string"
      ? raw.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : undefined;

  const parsed = rideFormSchema.partial().safeParse({ ...raw, ...(tags ? { tags } : {}) });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid ride data" }, { status: 400 });
  }
  const { bannerUrl, ...data } = parsed.data;

  await connectToDatabase();
  const ride = await Ride.findById(id);
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  Object.assign(ride, data);

  const bannerFile = formData.get("bannerFile");
  if (bannerFile instanceof File && bannerFile.size > 0) {
    const buffer = Buffer.from(await bannerFile.arrayBuffer());
    const oldBanner = ride.banner;
    ride.banner = { url: await saveFile(buffer, "rides", bannerFile.name), source: "upload" };
    if (oldBanner?.source === "upload") await deleteFile(oldBanner.url);
  } else if (bannerUrl) {
    const oldBanner = ride.banner;
    ride.banner = { url: bannerUrl, source: "external" };
    if (oldBanner?.source === "upload") await deleteFile(oldBanner.url);
  }

  await ride.save();
  return NextResponse.json({ ok: true, ride });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await connectToDatabase();
  const ride = await Ride.findByIdAndDelete(id);
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  if (ride.banner?.source === "upload") await deleteFile(ride.banner.url);
  await Promise.all(ride.gallery.filter((g) => g.source === "upload").map((g) => deleteFile(g.url)));

  return NextResponse.json({ ok: true });
}
