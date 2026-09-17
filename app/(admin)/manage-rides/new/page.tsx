import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import RideForm from "@/components/admin/RideForm";

export const metadata: Metadata = { title: "Plan New Ride" };

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
