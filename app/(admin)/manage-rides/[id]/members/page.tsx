import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Ride } from "@/models/Ride";
import { toPlain } from "@/lib/serialize";
import { RosterManager } from "@/components/admin/RosterManager";

type RosterMember = {
  _id: string;
  memberId: string;
  fullName: string;
  bloodGroup: string;
  location?: string;
  motorcycle: { licensePlate: string; make: string; model: string };
  primaryMobile: string;
};

export const metadata: Metadata = { title: "Manage Ride Riders" };

const ROSTER_FIELDS = "memberId fullName bloodGroup location motorcycle primaryMobile";

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
