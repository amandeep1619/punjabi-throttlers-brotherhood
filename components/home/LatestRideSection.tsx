import { SectionHeading, Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FeaturedBadge } from "@/components/ui/FeaturedBadge";
import { SmartImage } from "@/components/ui/SmartImage";
import { CalendarIcon, RoadIcon } from "@/components/ui/icons";
import type { RideCardData } from "@/components/rides/RideCard";

export default function LatestRideSection({ ride }: { ride: RideCardData | null }) {
  if (!ride) return null;

  const dateLabel = new Date(ride.startDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <section className="py-16 sm:py-20 border-t border-pt-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Latest Ride" title="Fresh off the highway" />

        <Card className="mt-10 overflow-hidden grid md:grid-cols-2">
          <div className="order-2 md:order-1 p-8 sm:p-10 flex flex-col justify-center gap-5">
            <div className="flex items-center gap-2">
              <StatusBadge status={ride.status} />
              {ride.featured && <FeaturedBadge />}
            </div>

            {ride.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {ride.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full border border-pt-gold/30 text-pt-gold/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h3 className="text-2xl sm:text-3xl font-bold text-pt-cream text-balance">{ride.title}</h3>
            <p className="text-pt-muted">{ride.description}</p>

            <div className="flex items-center gap-5 text-sm text-pt-muted border-t border-pt-border/70 pt-5">
              <span className="flex items-center gap-1.5">
                <CalendarIcon />
                {dateLabel}
              </span>
              <span className="flex items-center gap-1.5 text-pt-gold font-medium">
                <RoadIcon />
                {ride.distanceKm} km
              </span>
            </div>

            <LinkButton href={`/rides/${ride._id}`} variant="outline" className="w-fit">
              View Details
            </LinkButton>
          </div>

          <div className="order-1 md:order-2 relative h-64 md:h-auto min-h-80">
            <SmartImage src={ride.banner.url} alt={ride.title} fill className="object-cover" />
          </div>
        </Card>

        <div className="mt-10 text-center">
          <LinkButton href="/rides" variant="outline" size="lg">
            Explore More Rides
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
