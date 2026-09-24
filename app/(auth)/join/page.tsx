import type { Metadata } from "next";
import JoinForm from "@/components/join/JoinForm";
import { SectionHeading } from "@/components/ui/Card";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Join the Brotherhood – Become a Member | PT Brotherhood",
  description:
    "Apply to join Punjabi Throttlers Brotherhood. Share your details and riding experience, and an admin will review your membership application.",
  path: "/join",
});

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
