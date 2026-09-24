import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listMemberRides } from "@/lib/queries/rides";
import { toPlain } from "@/lib/serialize";
import ProfileSubNav from "@/components/layout/ProfileSubNav";
import { RideCard, type RideCardData } from "@/components/rides/RideCard";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return pageMetadata({
    title: "My Enrolled & Completed Rides | PT Brotherhood Club",
    description:
      "See every group ride you've enrolled in and completed with the Punjabi Throttlers Brotherhood, from weekend getaways to long highway runs.",
    path: `/me/${id}/rides`,
    noIndex: true,
  });
}

export default async function MyRidesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (id !== session.userId) redirect(`/me/${session.userId}/rides`);

  const rides = await listMemberRides(session.userId);
  const data = toPlain<RideCardData[]>(rides);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
      <ProfileSubNav memberId={session.userId} />
      <h1 className="text-2xl font-semibold text-pt-cream mb-6">My Rides</h1>

      {data.length === 0 ? (
        <p className="text-pt-muted">You haven&apos;t joined any rides yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((ride) => (
            <RideCard key={ride._id} ride={ride} isEnrolled />
          ))}
        </div>
      )}
    </section>
  );
}
