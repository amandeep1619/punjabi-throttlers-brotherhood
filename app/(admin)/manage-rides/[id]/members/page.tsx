import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Ride } from "@/models/Ride";
import { toPlain } from "@/lib/serialize";
import { RosterManager } from "@/components/admin/RosterManager";
import { pageMetadata, fitTitle, fitDescription } from "@/lib/seo";

type RosterMember = {
  _id: string;
  memberId: string;
  fullName: string;
  bloodGroup: string;
  location?: string;
  motorcycle: { licensePlate: string; make: string; model: string };
  primaryMobile: string;
};

const ROSTER_FIELDS = "memberId fullName bloodGroup location motorcycle primaryMobile";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  await connectToDatabase();
  const ride = await Ride.findById(id).select("title");
  return pageMetadata({
    title: ride
      ? fitTitle(`Admin – ${ride.title} Riders`, "| PT Brotherhood", "Roster")
      : "Admin – Manage Ride Riders | PT Brotherhood",
    description: ride
      ? fitDescription(
          `Admin roster for "${ride.title}" — view enrolled riders' blood group, city, and bike details.`,
          "Export the full roster as a text file here."
        )
      : "This ride's roster couldn't be found in the admin dashboard — it may have been removed or the link is incorrect.",
    path: `/manage-rides/${id}/members`,
    noIndex: true,
  });
}

export default async function ManageRideMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectToDatabase();
  const ride = await Ride.findById(id).populate("enrolledMembers", ROSTER_FIELDS).lean();
  if (!ride) notFound();

  const members = toPlain<RosterMember[]>(ride.enrolledMembers);

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-pt-cream">{ride.title}</h1>
          <p className="text-sm text-pt-muted">{members.length} riders enrolled</p>
        </div>
        <a
          href={`/api/manage-rides/${id}/members/export`}
          download
          className="inline-flex items-center gap-2 rounded-full border border-pt-gold/60 text-pt-gold px-5 py-2.5 text-sm hover:bg-pt-gold/10"
        >
          Export Roster (.txt)
        </a>
      </div>

      <RosterManager rideId={id} initialMembers={members} locked={ride.status === "completed"} />
    </section>
  );
}
