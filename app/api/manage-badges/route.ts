import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getSession } from "@/lib/auth";
import { badgeSchema } from "@/lib/validation/badge";
import { createBadge, reevaluateBadge } from "@/lib/queries/badges";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = badgeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid badge data" }, { status: 400 });
  }

  let badge;
  try {
    badge = await createBadge(parsed.data);
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "A badge with this name already exists" }, { status: 409 });
    }
    throw err;
  }

  // Award it to anyone who already qualifies (e.g. a new "5 rides" badge for
  // members who already have 8) without holding up this response for it.
  const badgeId = String(badge._id);
  after(() => reevaluateBadge(badgeId));

  return NextResponse.json({ ok: true, badge }, { status: 201 });
}
