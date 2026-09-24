import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Ride } from "@/models/Ride";
import { saveFile, UploadError } from "@/lib/storage";
import { galleryExternalSchema } from "@/lib/validation/ride";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await connectToDatabase();
  const ride = await Ride.findById(id);
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  const formData = await request.formData();
  const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length > 20) {
    return NextResponse.json({ error: "Select at most 20 photos at a time." }, { status: 400 });
  }

  if (files.length > 0) {
    // Uploads are always photos — saveFile itself now rejects anything else,
    // video only ever comes in as an external link (below).
    let urls: string[];
    try {
      urls = await Promise.all(files.map((file) => saveFile(file, "gallery")));
    } catch (err) {
      if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
      throw err;
    }
    ride.gallery.push(...urls.map((url) => ({ url, source: "upload" as const, type: "photo" as const })));
  } else {
    const parsed = galleryExternalSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Provide a file or a URL" }, { status: 400 });
    }
    ride.gallery.push({ url: parsed.data.url, source: "external", type: parsed.data.type });
  }

  await ride.save();
  return NextResponse.json({ ok: true, gallery: ride.gallery }, { status: 201 });
}
