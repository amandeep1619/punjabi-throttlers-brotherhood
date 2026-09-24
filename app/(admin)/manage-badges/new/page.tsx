import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import BadgeForm from "@/components/admin/BadgeForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Admin – Create a New Achievement Badge | PT Brotherhood",
  description:
    "Admin form to create a new Punjabi Throttlers Brotherhood achievement badge — set its icon, criteria, distance threshold, and status.",
  path: "/manage-badges/new",
  noIndex: true,
});

export default function NewBadgePage() {
  return (
    <section className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-pt-cream mb-8">Create Badge</h1>
      <Card className="p-6 sm:p-8">
        <BadgeForm />
      </Card>
    </section>
  );
}
