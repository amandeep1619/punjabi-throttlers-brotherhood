import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getBadge, updateBadge } from "@/lib/queries/badges";
import { saveFile, deleteFile, UploadError } from "@/lib/storage";

// Separate from the main PATCH route (which is a JSON body) since this one
// needs multipart/form-data for the file — keeps the existing text-field
// PATCH (used by the admin table's Activate/Deactivate toggle) untouched.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await getBadge(id);
  if (!existing) return NextResponse.json({ error: "Badge not found" }, { status: 404 });

  const formData = await request.formData();
  const imageFile = formData.get("imageFile");
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  let imageUrl: string;
  try {
    imageUrl = await saveFile(imageFile, { kind: "badge", badgeName: existing.name });
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }

  const badge = await updateBadge(id, { imageUrl });
  if (existing.imageUrl) await deleteFile(existing.imageUrl);

  return NextResponse.json({ ok: true, badge });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await getBadge(id);
  if (!existing) return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  if (!existing.imageUrl) return NextResponse.json({ ok: true, badge: existing });

  const badge = await updateBadge(id, { imageUrl: undefined });
  await deleteFile(existing.imageUrl);

  return NextResponse.json({ ok: true, badge });
}
