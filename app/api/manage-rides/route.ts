import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Ride } from "@/models/Ride";
import { rideFormSchema } from "@/lib/validation/ride";
import { saveFile, UploadError } from "@/lib/storage";
import { sendPushToAllActiveMembers } from "@/lib/push";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await request.formData();
  const raw = Object.fromEntries(formData.entries());
  // tags arrive as a comma-separated string from the admin form.
  const tags =
    typeof raw.tags === "string"
      ? raw.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

  const parsed = rideFormSchema.safeParse({ ...raw, tags });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid ride data" }, { status: 400 });
  }
  const data = parsed.data;

  const bannerFile = formData.get("bannerFile");
  let banner: { url: string; source: "upload" | "external" };
  if (bannerFile instanceof File && bannerFile.size > 0) {
    try {
      banner = { url: await saveFile(bannerFile, "rides"), source: "upload" };
    } catch (err) {
      if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
      throw err;
    }
  } else if (data.bannerUrl) {
    banner = { url: data.bannerUrl, source: "external" };
  } else {
    return NextResponse.json({ error: "Provide a banner image (upload or link)" }, { status: 400 });
  }

  // Admin picks whoever to pre-enroll (including themselves) via the
  // member-search UI — only format-checked here, not re-verified against the
  // DB, same trust level as the rest of this admin-only form.
  const enrolledMemberIds = [...new Set(formData.getAll("enrolledMemberIds").map(String))].filter((id) =>
    /^[0-9a-fA-F]{24}$/.test(id)
  );

  await connectToDatabase();
  const ride = await Ride.create({
    title: data.title,
    description: data.description,
    distanceKm: data.distanceKm,
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status,
    tags: data.tags,
    featured: data.featured,
    maxSlots: data.maxSlots,
    budget: data.budget,
    banner,
    enrolledMembers: enrolledMemberIds,
  });

  if (ride.status === "upcoming") {
    after(() =>
      sendPushToAllActiveMembers({
        title: "New Ride",
        body: `Checkout new Ride ${ride.title} scheduled by Admin`,
        url: `/rides/${ride._id}`,
      }).catch(() => {})
    );
  }

  return NextResponse.json({ ok: true, ride }, { status: 201 });
}
