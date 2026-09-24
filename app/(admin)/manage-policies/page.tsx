import type { Metadata } from "next";
import { getPolicies } from "@/lib/queries/policies";
import { toPlain } from "@/lib/serialize";
import { PolicyEditor } from "@/components/admin/PolicyEditor";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Admin – Edit Club Rules & Policies | PT Brotherhood",
  description:
    "Admin dashboard to add, edit, and reorder the riding gear, safety, and conduct policies published on the Punjabi Throttlers Brotherhood site.",
  path: "/manage-policies",
  noIndex: true,
});

export default async function ManagePoliciesPage() {
  const sections = await getPolicies();

  return (
    <section className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-pt-cream mb-8">Policies & Guidelines</h1>
      <PolicyEditor initialSections={toPlain(sections.slice().sort((a, b) => a.order - b.order))} />
    </section>
  );
}
