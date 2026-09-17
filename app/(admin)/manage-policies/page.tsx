import type { Metadata } from "next";
import { getPolicies } from "@/lib/queries/policies";
import { toPlain } from "@/lib/serialize";
import { PolicyEditor } from "@/components/admin/PolicyEditor";

export const metadata: Metadata = { title: "Manage Policies" };

export default async function ManagePoliciesPage() {
  const sections = await getPolicies();

  return (
    <section className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-pt-cream mb-8">Policies & Guidelines</h1>
      <PolicyEditor initialSections={toPlain(sections.slice().sort((a, b) => a.order - b.order))} />
    </section>
  );
}
