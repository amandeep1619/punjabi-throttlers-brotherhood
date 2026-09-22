import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import BadgeForm from "@/components/admin/BadgeForm";

export const metadata: Metadata = { title: "Create Badge" };

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
