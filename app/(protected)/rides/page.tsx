import type { Metadata } from "next";
import { listRides, getFeaturedRide, getNextUpcomingRide, isRideEnrolled } from "@/lib/queries/rides";
import { getSession } from "@/lib/auth";
import { toPlain } from "@/lib/serialize";
import { RideFilters } from "@/components/rides/RideFilters";
import { RideCard, type RideCardData } from "@/components/rides/RideCard";
import { Pagination } from "@/components/ui/Pagination";
import { SectionHeading } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Rides",
  description: "Browse every Punjabi Throttlers Brotherhood ride — upcoming, completed, and cancelled.",
};

export default async function RidesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; year?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const year = sp.year ?? "";
  const tag = sp.tag ?? "";

  const [session, featured, upcoming, result] = await Promise.all([
    getSession(),
    getFeaturedRide(),
    getNextUpcomingRide(),
    listRides({ page, search, status: status || undefined, tag: tag || undefined, year: year ? Number(year) : undefined }),
  ]);

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (year) params.set("year", year);
    if (tag) params.set("tag", tag);
    params.set("page", String(p));
    return `/rides?${params.toString()}`;
  };

  const showHighlights = page === 1 && !search && !status && !year && !tag;
  const sameRide = Boolean(featured && upcoming && String(featured._id) === String(upcoming._id));

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
      <SectionHeading eyebrow="Rides" title="Every ride, every mile" />

      {showHighlights && (featured || upcoming) && (
        <div className={`mt-10 grid gap-6 ${sameRide ? "sm:grid-cols-1 max-w-xl mx-auto" : "sm:grid-cols-2"}`}>
          {sameRide ? (
            <div>
              <p className="text-xs uppercase tracking-widest text-pt-gold mb-3">Featured &amp; Next Up</p>
              <RideCard ride={toPlain<RideCardData>(featured)} size="lg" isEnrolled={isRideEnrolled(featured, session?.userId)} />
            </div>
          ) : (
            <>
              {featured && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-pt-gold mb-3">Featured Ride</p>
                  <RideCard ride={toPlain<RideCardData>(featured)} size="lg" isEnrolled={isRideEnrolled(featured, session?.userId)} />
                </div>
              )}
              {upcoming && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-pt-gold mb-3">Next Upcoming Ride</p>
                  <RideCard ride={toPlain<RideCardData>(upcoming)} size="lg" isEnrolled={isRideEnrolled(upcoming, session?.userId)} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="mt-14">
        <RideFilters search={search} status={status} year={year} tag={tag} />

        {result.items.length === 0 ? (
          <p className="text-center text-pt-muted py-16">No rides match your filters.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.items.map((ride) => (
              <RideCard
                key={String(ride._id)}
                ride={toPlain<RideCardData>(ride)}
                isEnrolled={isRideEnrolled(ride, session?.userId)}
              />
            ))}
          </div>
        )}

        <Pagination page={result.page} totalPages={result.totalPages} buildHref={buildHref} />
      </div>
    </section>
  );
}
