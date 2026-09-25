import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Member } from "@/models/Member";
import { saveFile, deleteFile, UploadError } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "No photo provided" }, { status: 400 });
  }

  await connectToDatabase();
  const member = await Member.findById(session.userId).select("photoUrl memberId");
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  let newUrl: string;
  try {
    newUrl = await saveFile(photo, { kind: "member-profile", memberId: member.memberId });
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }

  const oldUrl = member.photoUrl;
  member.photoUrl = newUrl;
  await member.save();
  if (oldUrl) await deleteFile(oldUrl);

  return NextResponse.json({ ok: true, photoUrl: newUrl });
}
