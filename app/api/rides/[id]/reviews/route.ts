import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRideRaw } from "@/lib/queries/rides";
import { getReviewEligibility, upsertReview } from "@/lib/queries/reviews";
import { reviewSchema } from "@/lib/validation/review";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ride = await getRideRaw(id);
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  const eligibility = getReviewEligibility(ride, session.userId);
  if (!eligibility.eligible) {
    return NextResponse.json({ error: eligibility.reason }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid review" }, { status: 400 });
  }

  const review = await upsertReview(id, session.userId, parsed.data.rating, parsed.data.text);
  return NextResponse.json({ ok: true, review });
}
