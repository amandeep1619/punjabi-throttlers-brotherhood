import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import RideForm from "@/components/admin/RideForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Admin – Plan a New Group Ride | PT Brotherhood Club",
  description:
    "Admin form to plan a new Punjabi Throttlers Brotherhood group ride — set the route, distance, dates, banner image, and rider slots.",
  path: "/manage-rides/new",
  noIndex: true,
});

export default function NewRidePage() {
  return (
    <section className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-pt-cream mb-8">Plan New Ride</h1>
      <Card className="p-6 sm:p-8">
        <RideForm />
      </Card>
    </section>
  );
}
