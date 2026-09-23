import type { Metadata } from "next";
import { listRides } from "@/lib/queries/rides";
import { SmartImage } from "@/components/ui/SmartImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { LinkButton } from "@/components/ui/Button";
import { RowMenu, RowMenuLink } from "@/components/admin/RowMenu";
import { RideStatusActions } from "@/components/admin/RideStatusActions";

export const metadata: Metadata = { title: "Manage Rides" };

export default async function ManageRidesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const result = await listRides({ page, pageSize: 10 });

  const buildHref = (p: number) => `/manage-rides?page=${p}`;

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-pt-cream">Rides</h1>
        <LinkButton href="/manage-rides/new">Plan New Ride</LinkButton>
      </div>

      <div className="space-y-3">
        {result.items.map((ride) => (
          <div
            key={String(ride._id)}
            className="flex flex-wrap items-center gap-3 sm:gap-4 rounded-xl border border-pt-border bg-pt-black-card p-4"
          >
            <div className="relative h-16 w-24 rounded-lg overflow-hidden shrink-0 bg-pt-black-soft">
              <SmartImage src={ride.banner.url} alt={ride.title} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-pt-cream truncate">{ride.title}</p>
                <StatusBadge status={ride.status} />
              </div>
              <p className="text-xs text-pt-muted mt-1">
                {new Date(ride.startDate).toLocaleDateString("en-IN")} · {ride.distanceKm} km
              </p>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <RideStatusActions rideId={String(ride._id)} status={ride.status} />
              <RowMenu>
                <RowMenuLink href={`/manage-rides/${ride._id}`}>Edit ride</RowMenuLink>
                <RowMenuLink href={`/manage-rides/${ride._id}/members`}>Manage riders</RowMenuLink>
                <RowMenuLink href={`/rides/${ride._id}`}>View public page</RowMenuLink>
              </RowMenu>
            </div>
          </div>
        ))}
        {result.items.length === 0 && (
          <p className="text-center text-pt-muted py-16">No rides yet — plan the first one.</p>
        )}
      </div>

      <Pagination page={result.page} totalPages={result.totalPages} buildHref={buildHref} />
    </section>
  );
}
