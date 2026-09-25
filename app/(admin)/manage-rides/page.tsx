import type { Metadata } from "next";
import { Suspense } from "react";
import { listRides } from "@/lib/queries/rides";
import { RideBannerImage } from "@/components/rides/RideBannerImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { LinkButton } from "@/components/ui/Button";
import { RowMenu, RowMenuLink } from "@/components/admin/RowMenu";
import { RideStatusActions } from "@/components/admin/RideStatusActions";
import { DebouncedSearch } from "@/components/admin/DebouncedSearch";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Admin – Manage All Club Rides | PT Brotherhood Club",
  description:
    "Admin dashboard to plan new rides, edit ride details, manage enrolled riders, and mark Punjabi Throttlers Brotherhood rides complete.",
  path: "/manage-rides",
  noIndex: true,
});

export default async function ManageRidesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const search = sp.search ?? "";
  const result = await listRides({ page, pageSize: 10, search });

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(p));
    return `/manage-rides?${params.toString()}`;
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-semibold text-pt-cream">Rides</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <DebouncedSearch placeholder="Search by ride name…" />
          </Suspense>
          <LinkButton href="/manage-rides/new">Plan New Ride</LinkButton>
        </div>
      </div>

      <div className="space-y-3">
        {result.items.map((ride) => (
          <div
            key={String(ride._id)}
            className="flex flex-wrap items-center gap-3 sm:gap-4 rounded-xl border border-pt-border bg-pt-black-card p-4"
          >
            <div className="relative h-16 w-24 rounded-lg overflow-hidden shrink-0 bg-pt-black-soft">
              <RideBannerImage banner={ride.banner} alt={ride.title} className="object-cover" />
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
          <p className="text-center text-pt-muted py-16">
            {search ? "No rides match your search." : "No rides yet — plan the first one."}
          </p>
        )}
      </div>

      <Pagination page={result.page} totalPages={result.totalPages} buildHref={buildHref} />
    </section>
  );
}
