import type { Metadata } from "next";
import { getClubStats } from "@/lib/queries/stats";
import { getTodaysBirthdays } from "@/lib/queries/members";
import { getLatestRide } from "@/lib/queries/rides";
import { getTopMembers } from "@/lib/queries/members";
import { getSession } from "@/lib/auth";
import { toPlain } from "@/lib/serialize";
import Hero from "@/components/home/Hero";
import BirthdaySection from "@/components/home/BirthdaySection";
import LatestRideSection from "@/components/home/LatestRideSection";
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
  const [stats, birthdays, latestRide, topMembers] = await Promise.all([
    getClubStats(),
    getTodaysBirthdays(),
    getLatestRide(),
    getTopMembers(5, session?.userId),
  ]);

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
      <LatestRideSection ride={latestRide ? toPlain<RideCardData>(latestRide) : null} />
      <PartnersMarquee />
      <TopMembersSection members={toPlain<MemberCardData[]>(topMembers)} />
    </>
  );
}
