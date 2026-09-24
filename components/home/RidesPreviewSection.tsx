import { SectionHeading } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { RideCard, type RideCardData } from "@/components/rides/RideCard";

export function RidesPreviewSection({
  eyebrow,
  title,
  rides,
  enrolledRideIds,
  expandSingle = false,
}: {
  eyebrow: string;
  title: string;
  rides: RideCardData[];
  enrolledRideIds: Set<string>;
  /** When there's exactly one ride, let its card take the full row instead of
   * sitting narrow in a 3-column grid — opt-in per section (only makes sense
   * for "Upcoming", not "Previous", where a lone card among a grid layout
   * reads as intentional rather than sparse). */
  expandSingle?: boolean;
}) {
  if (rides.length === 0) return null;
  const single = expandSingle && rides.length === 1;

  return (
    <section className="py-16 sm:py-20 border-t border-pt-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className={single ? "mt-10 max-w-2xl mx-auto" : "mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {rides.map((ride) => (
            <RideCard key={ride._id} ride={ride} isEnrolled={enrolledRideIds.has(ride._id)} size={single ? "lg" : "md"} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <LinkButton href="/rides" variant="outline" size="lg">
            Explore More Rides
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
