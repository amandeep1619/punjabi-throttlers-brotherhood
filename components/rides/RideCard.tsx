import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FeaturedBadge } from "@/components/ui/FeaturedBadge";
import { SmartImage } from "@/components/ui/SmartImage";
import { LinkButton } from "@/components/ui/Button";
import { CalendarIcon, RoadIcon } from "@/components/ui/icons";

export type RideCardData = {
  _id: string;
  title: string;
  description: string;
  banner: { url: string; source: string };
  distanceKm: number;
  startDate: string | Date;
  status: "upcoming" | "completed" | "cancelled";
  tags: string[];
  featured?: boolean;
};

export function RideCard({ ride, size = "md" }: { ride: RideCardData; size?: "md" | "lg" }) {
  const dateLabel = new Date(ride.startDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="overflow-hidden group flex flex-col h-full transition-all duration-300 hover:border-pt-gold/50 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)]">
      <div className={`relative ${size === "lg" ? "h-80" : "h-52"} bg-pt-black-soft overflow-hidden`}>
        <SmartImage
          src={ride.banner.url}
          alt={ride.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Layered scrim: keeps badges legible up top and the title legible down low,
            regardless of how busy the underlying photo is. */}
        <div className="absolute inset-0 bg-linear-to-b from-black/55 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-pt-black via-pt-black/50 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <StatusBadge status={ride.status} />
          {ride.featured && <FeaturedBadge />}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          {ride.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {ride.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full border border-pt-gold/30 text-pt-gold/90 bg-pt-black/40 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug text-balance drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            {ride.title}
          </h3>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4 grow">
        <p className="text-sm text-pt-muted line-clamp-2 grow">{ride.description}</p>

        <div className="flex items-center gap-4 text-xs text-pt-muted border-t border-pt-border/70 pt-4">
          <span className="flex items-center gap-1.5">
            <CalendarIcon />
            {dateLabel}
          </span>
          <span className="flex items-center gap-1.5 text-pt-gold font-medium">
            <RoadIcon />
            {ride.distanceKm} km
          </span>
        </div>

        <div className="pt-1">
          {ride.status === "upcoming" ? (
            <LinkButton href={`/rides/${ride._id}`} size="sm" className="w-full">
              Enroll / View Details
            </LinkButton>
          ) : (
            <LinkButton href={`/rides/${ride._id}`} variant="outline" size="sm" className="w-full">
              View Details
            </LinkButton>
          )}
        </div>
      </div>
    </Card>
  );
}
