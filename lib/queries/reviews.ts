import "server-only";
import { connectToDatabase } from "@/lib/db";
import { Review } from "@/models/Review";

const REVIEW_WAIT_MS = 24 * 60 * 60 * 1000; // 1 day after a ride is marked completed

export async function getRideReviews(rideId: string) {
  await connectToDatabase();
  return Review.find({ ride: rideId })
    .sort({ createdAt: -1 })
    .populate("member", "memberId fullName photoUrl")
    .lean();
}

export async function getMemberReviewForRide(rideId: string, memberId: string) {
  await connectToDatabase();
  return Review.findOne({ ride: rideId, member: memberId }).lean();
}

/**
 * Pure eligibility check — takes the ride's own status/enrolledMembers/
 * completedAt (already fetched by the caller) rather than re-querying, since
 * the ride detail page always has this in hand already.
 */
export function getReviewEligibility(
  ride: {
    status: string;
    completedAt?: Date | string | null;
    // Accepts either raw ObjectIds (getRideRaw) or populated Member docs
    // (getRideById) — extracting _id when populated is what the page's own
    // ride fetch actually returns, so this can't assume one shape.
    enrolledMembers: (string | { toString(): string } | { _id: { toString(): string } | string })[];
  },
  memberId?: string
): { eligible: boolean; reason: string } {
  if (!memberId) return { eligible: false, reason: "Log in to leave a review." };
  if (ride.status !== "completed") return { eligible: false, reason: "Reviews open once this ride is marked completed." };
  const wasEnrolled = ride.enrolledMembers.some((m) => {
    const id = typeof m === "object" && m !== null && "_id" in m ? m._id : m;
    return id.toString() === memberId;
  });
  if (!wasEnrolled) return { eligible: false, reason: "Only riders who joined this ride can review it." };
  if (!ride.completedAt) return { eligible: false, reason: "Reviews open once this ride is marked completed." };
  const unlockAt = new Date(ride.completedAt).getTime() + REVIEW_WAIT_MS;
  if (Date.now() < unlockAt) {
    return {
      eligible: false,
      reason: `Reviews open 24 hours after the ride is marked completed — check back ${new Date(unlockAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}.`,
    };
  }
  return { eligible: true, reason: "" };
}

export async function upsertReview(rideId: string, memberId: string, rating: number, text: string) {
  await connectToDatabase();
  return Review.findOneAndUpdate(
    { ride: rideId, member: memberId },
    { rating, text },
    { upsert: true, returnDocument: "after" }
  );
}
