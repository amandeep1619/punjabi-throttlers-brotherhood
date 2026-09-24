import type { Metadata } from "next";
import { getClubStats } from "@/lib/queries/stats";
import { jsonLdScript } from "@/lib/jsonLd";
import { pageMetadata, canonicalUrl } from "@/lib/seo";
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

export const metadata: Metadata = pageMetadata({
  title: "Punjabi Throttlers Brotherhood – Motorcycle Riding Club",
  description:
    "Punjabi Throttlers Brotherhood is a community of responsible motorcycle riders. Explore upcoming group rides, meet members, and apply to join today.",
  path: "/",
});

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

  // @graph: the org itself, the site (for the main url), and its key sections
  // (join/members/rides/policies) as SiteNavigationElement entries — gives
  // Google a structured map of the site beyond just the homepage.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsOrganization",
        name: "Punjabi Throttlers Brotherhood",
        description: "A brotherhood of riders united by the road.",
        url: canonicalUrl("/"),
        logo: canonicalUrl("/brand/logo.png"),
      },
      {
        "@type": "WebSite",
        name: "Punjabi Throttlers Brotherhood",
        url: canonicalUrl("/"),
      },
      { "@type": "SiteNavigationElement", name: "Join", url: canonicalUrl("/join") },
      { "@type": "SiteNavigationElement", name: "Members", url: canonicalUrl("/members") },
      { "@type": "SiteNavigationElement", name: "Rides", url: canonicalUrl("/rides") },
      { "@type": "SiteNavigationElement", name: "Policies", url: canonicalUrl("/policies") },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <Hero stats={stats} />
      <BirthdaySection birthdays={toPlain(birthdays)} />
      <RidesPreviewSection
        eyebrow="Upcoming Rides"
        title="Fresh off the highway"
        rides={toPlain<RideCardData[]>(upcomingRides)}
        enrolledRideIds={enrolledUpcomingIds}
        expandSingle
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
