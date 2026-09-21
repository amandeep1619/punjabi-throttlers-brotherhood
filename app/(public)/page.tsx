import type { Metadata } from "next";
import { getClubStats } from "@/lib/queries/stats";
import { getTodaysBirthdays } from "@/lib/queries/members";
import { listUpcomingRides, listRecentCompletedRides, isRideEnrolled } from "@/lib/queries/rides";
import { getTopMembers } from "@/lib/queries/members";
import { getSession } from "@/lib/auth";
import { toPlain } from "@/lib/serialize";
import Hero from "@/components/home/Hero";
import BirthdaySection from "@/components/home/BirthdaySection";
import { RidesPreviewSection } from "@/components/home/RidesPreviewSection";
import PartnersMarquee from "@/components/home/PartnersMarquee";
import TopMembersSection from "@/components/home/TopMembersSection";
import type { RideCardData } from "@/components/rides/RideCard";
import type { MemberCardData } from "@/components/members/MemberCard";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Punjabi Throttlers Brotherhood — a brotherhood of riders united by the road. Group rides, real camaraderie, and a community of responsible riders.",
};

export default async function HomePage() {
  const session = await getSession();
  const [stats, birthdays, upcomingRides, completedRides, topMembers] = await Promise.all([
    getClubStats(),
    getTodaysBirthdays(),
    listUpcomingRides(5),
    listRecentCompletedRides(5),
    getTopMembers(5, session?.userId),
  ]);

  const enrolledUpcomingIds = new Set(
    upcomingRides.filter((r) => isRideEnrolled(r, session?.userId)).map((r) => String(r._id))
  );
  const enrolledCompletedIds = new Set(
    completedRides.filter((r) => isRideEnrolled(r, session?.userId)).map((r) => String(r._id))
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: "Punjabi Throttlers Brotherhood",
    description: "A brotherhood of riders united by the road.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/brand/logo.png`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero stats={stats} />
      <BirthdaySection birthdays={toPlain(birthdays)} />
      <RidesPreviewSection
        eyebrow="Upcoming Rides"
        title="Fresh off the highway"
        rides={toPlain<RideCardData[]>(upcomingRides)}
        enrolledRideIds={enrolledUpcomingIds}
      />
      <RidesPreviewSection
        eyebrow="Previous Rides"
        title="Memories from the road"
        rides={toPlain<RideCardData[]>(completedRides)}
        enrolledRideIds={enrolledCompletedIds}
      />
      <PartnersMarquee />
      <TopMembersSection members={toPlain<MemberCardData[]>(topMembers)} />
    </>
  );
}
