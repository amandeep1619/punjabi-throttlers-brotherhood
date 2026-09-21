import { SmartImage } from "@/components/ui/SmartImage";
import { StarDisplay } from "@/components/ui/StarRating";
import { formatRelativeTime } from "@/lib/format";

type ReviewItem = {
  _id: string;
  rating: number;
  text: string;
  createdAt: string;
  member: { fullName: string; photoUrl?: string } | null;
};

export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-pt-muted">No reviews yet — be the first to share how the ride went.</p>;
  }

  return (
    <div className="space-y-5">
      {reviews.map((review) => (
        <div key={review._id} className="flex gap-3">
          <div className="relative h-10 w-10 rounded-full bg-pt-black-soft flex items-center justify-center text-sm font-semibold text-pt-gold overflow-hidden shrink-0">
            {review.member?.photoUrl ? (
              <SmartImage src={review.member.photoUrl} alt={review.member.fullName} fill className="object-cover" />
            ) : (
              (review.member?.fullName ?? "?").charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <p className="text-sm font-medium text-pt-cream">{review.member?.fullName ?? "Former member"}</p>
              <span className="text-xs text-pt-muted">{formatRelativeTime(review.createdAt)}</span>
            </div>
            <StarDisplay value={review.rating} size="sm" />
            <p className="text-sm text-pt-muted mt-1.5 whitespace-pre-line">{review.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
