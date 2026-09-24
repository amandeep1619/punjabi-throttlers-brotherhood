import type { Metadata } from "next";
import { getPolicies } from "@/lib/queries/policies";
import { SectionHeading, Card } from "@/components/ui/Card";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Rules & Riding Policies | Punjabi Throttlers Brotherhood",
  description:
    "Read the riding gear, safety, and conduct policies every Punjabi Throttlers Brotherhood member agrees to follow on every group ride we organise.",
  path: "/policies",
});

export default async function PoliciesPage() {
  const sections = await getPolicies();

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
      <SectionHeading
        eyebrow="Guidelines"
        title="Rules of the Road"
        description="Every rider agrees to these guidelines before joining a ride with us."
      />

      <div className="mt-12 space-y-4">
        {sections
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((section, i) => (
            <Card key={section.heading} className="p-6 flex gap-4">
              <span className="text-pt-gold font-bold text-lg shrink-0 w-8">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-semibold text-pt-cream">{section.heading}</h3>
                <p className="mt-1.5 text-sm text-pt-muted whitespace-pre-line">{section.body}</p>
              </div>
            </Card>
          ))}
        {sections.length === 0 && <p className="text-pt-muted text-center">Guidelines coming soon.</p>}
      </div>
    </section>
  );
}
