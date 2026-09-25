import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBadge } from "@/lib/queries/badges";
import { toPlain } from "@/lib/serialize";
import { Card } from "@/components/ui/Card";
import BadgeForm, { type BadgeFormDefaults } from "@/components/admin/BadgeForm";
import { pageMetadata, fitTitle, fitDescription } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const badge = await getBadge(id);
  return pageMetadata({
    title: badge
      ? fitTitle(`Admin – Edit ${badge.name} Badge`, "| PT Brotherhood", "Achievement")
      : "Admin – Edit Badge | PT Brotherhood Club",
    description: badge
      ? fitDescription(
          `Admin form to edit the "${badge.name}" badge — ${badge.description}`,
          "Update its icon, criteria, and threshold here."
        )
      : "This achievement badge couldn't be found in the admin dashboard — it may have been removed or the link is incorrect.",
    path: `/manage-badges/${id}`,
    noIndex: true,
  });
}

export default async function EditBadgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const badge = await getBadge(id);
  if (!badge) notFound();

  const defaults = toPlain<BadgeFormDefaults>({
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    imageUrl: badge.imageUrl,
    criteriaType: badge.criteriaType,
    tag: badge.tag ?? "",
    threshold: badge.threshold,
    active: badge.active,
  });

  return (
    <section className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-pt-cream mb-8">Edit Badge</h1>
      <Card className="p-6 sm:p-8">
        <BadgeForm badgeId={id} defaults={defaults} />
      </Card>
    </section>
  );
}
