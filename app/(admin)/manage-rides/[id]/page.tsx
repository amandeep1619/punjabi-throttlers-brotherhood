import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getRideRaw } from "@/lib/queries/rides";
import { toPlain } from "@/lib/serialize";
import { Card } from "@/components/ui/Card";
import RideForm, { type RideFormDefaults } from "@/components/admin/RideForm";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { DeleteRideButton } from "@/components/admin/DeleteRideButton";
import { pageMetadata, fitTitle, fitDescription } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const ride = await getRideRaw(id);
  return pageMetadata({
    title: ride
      ? fitTitle(`Admin – Edit ${ride.title}`, "| PT Brotherhood", "Ride Details")
      : "Admin – Edit Ride | PT Brotherhood Club",
    description: ride
      ? fitDescription(
          `Admin form to edit "${ride.title}" — update the route, distance, dates, status, tags, banner, and gallery for this ride.`,
          "Punjabi Throttlers Brotherhood."
        )
      : "This ride couldn't be found in the admin dashboard — it may have been removed or the link is incorrect.",
    path: `/manage-rides/${id}`,
    noIndex: true,
  });
}

type RideRaw = {
  _id: string;
  title: string;
  description: string;
  distanceKm: number;
  startDate: string;
  endDate?: string;
  status: string;
  tags: string[];
  featured: boolean;
  maxSlots?: number;
  budget?: number;
  banner: { url: string; source: string };
  gallery: { _id: string; url: string; type: "photo" | "video"; source: "upload" | "external" }[];
};

function toDateInput(value?: string) {
  return value ? value.slice(0, 10) : "";
}

export default async function EditRidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const raw = await getRideRaw(id);
  if (!raw) notFound();
  const ride = toPlain<RideRaw>(raw);

  const defaults: RideFormDefaults = {
    title: ride.title,
    description: ride.description,
    distanceKm: ride.distanceKm,
    startDate: toDateInput(ride.startDate),
    endDate: toDateInput(ride.endDate),
    status: ride.status,
    tags: ride.tags.join(", "),
    featured: ride.featured,
    maxSlots: ride.maxSlots ?? "",
    budget: ride.budget ?? "",
    bannerUrl: ride.banner.source === "external" ? ride.banner.url : "",
  };

  return (
    <section className="max-w-3xl space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-pt-cream">{ride.title}</h1>
        <div className="flex gap-3">
          <Link href={`/manage-rides/${id}/members`} className="text-sm text-pt-gold hover:underline self-center">
            Manage riders →
          </Link>
          <DeleteRideButton rideId={id} />
        </div>
      </div>

      <Card className="p-6 sm:p-8">
        <RideForm rideId={id} defaults={defaults} />
      </Card>

      <div>
        <h2 className="text-xl font-semibold text-pt-cream mb-4">Gallery</h2>
        <Card className="p-6">
          <GalleryManager rideId={id} initialItems={ride.gallery} />
        </Card>
      </div>
    </section>
  );
}
