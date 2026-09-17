import type { Metadata } from "next";
import JoinForm from "@/components/join/JoinForm";
import { SectionHeading } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Join the Brotherhood",
  description: "Apply to join Punjabi Throttlers Brotherhood — fill in your details and an admin will review your application.",
};

export default function JoinPage() {
  return (
    <section className="mx-auto max-w-3xl w-full">
      <SectionHeading eyebrow="Join Now" title="Become a Throttler" description="Tell us about yourself, your bike, and your riding experience." />
      <div className="mt-10">
        <JoinForm />
      </div>
    </section>
  );
}
