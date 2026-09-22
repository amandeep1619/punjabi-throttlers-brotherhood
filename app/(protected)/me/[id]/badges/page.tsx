import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ProfileSubNav from "@/components/layout/ProfileSubNav";
import MemberBadges from "@/components/badges/MemberBadges";

export const metadata: Metadata = { title: "My Badges" };

export default async function MyBadgesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (id !== session.userId) redirect(`/me/${session.userId}/badges`);

  return (
    <section className="mx-auto max-w-2xl px-4 sm:px-6 py-16 sm:py-20">
      <ProfileSubNav memberId={session.userId} />
      <h1 className="text-2xl font-semibold text-pt-cream mb-6">My Badges</h1>
      <MemberBadges memberId={session.userId} />
    </section>
  );
}
