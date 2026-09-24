import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMemberProfileById, getMemberAdminView } from "@/lib/queries/members";
import { jsonLdScript } from "@/lib/jsonLd";
import { getSession } from "@/lib/auth";
import { toPlain } from "@/lib/serialize";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SmartImage } from "@/components/ui/SmartImage";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import MemberBadges from "@/components/badges/MemberBadges";
import { pageMetadata, fitTitle, fitDescription } from "@/lib/seo";

type ProfileFields = {
  memberId: string;
  fullName: string;
  photoUrl?: string;
  totalKmWithClub: number;
  location?: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  country: string;
  motorcycle: { make: string; model: string; year: number; licensePlate: string };
  ridingExperienceYears: number;
  createdAt: string;
  email?: string;
  status?: string;
  role?: string;
  primaryMobile?: string;
  secondaryMobile?: string;
  permanentAddress?: string;
  emergencyContact?: { fullName: string; relationship: string; phone: string };
  inAnotherRidingGroup?: boolean;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const member = await getMemberProfileById(id);
  if (!member) {
    return pageMetadata({
      title: "Member Not Found | Punjabi Throttlers Brotherhood",
      description: "This member profile couldn't be found — it may have been removed or the link is incorrect.",
      path: `/members/${id}`,
      noIndex: true,
    });
  }
  return pageMetadata({
    title: fitTitle(member.fullName, `(${member.memberId}) | PT Brotherhood`, "– Rider Profile"),
    description: fitDescription(
      `${member.fullName} (${member.memberId}) is a Punjabi Throttlers Brotherhood rider.`,
      "View their kilometres ridden, motorcycle, and club achievement badges here."
    ),
    path: `/members/${id}`,
    // Requires login — not actually crawlable, so it shouldn't be indexed.
    noIndex: true,
  });
}

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  const raw = isAdmin ? await getMemberAdminView(id) : await getMemberProfileById(id);
  if (!raw) notFound();
  const member = toPlain<ProfileFields>(raw);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: { "@type": "Person", name: member.fullName, identifier: member.memberId },
  };

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

      <Card className="p-8 flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left">
        <div className="relative h-32 w-32 rounded-full overflow-hidden ring-4 ring-pt-gold/40 bg-pt-black-soft shrink-0">
          {member.photoUrl ? (
            <SmartImage src={member.photoUrl} alt={member.fullName} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-4xl font-semibold text-pt-gold">
              {member.fullName.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
            <h1 className="text-2xl font-semibold text-pt-cream">{member.fullName}</h1>
            {member.status && <StatusBadge status={member.status} />}
          </div>
          <p className="text-pt-gold font-medium mt-1">{member.memberId}</p>
          {member.location && <p className="text-pt-muted text-sm mt-1">{member.location}</p>}

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-pt-muted text-xs uppercase">Total Km</p>
              <p className="text-pt-gold font-semibold mt-1">{member.totalKmWithClub.toLocaleString("en-IN")} km</p>
            </div>
            <div>
              <p className="text-pt-muted text-xs uppercase">Riding Experience</p>
              <p className="text-pt-cream mt-1">{member.ridingExperienceYears} yrs</p>
            </div>
            <div>
              <p className="text-pt-muted text-xs uppercase">Bike</p>
              <p className="text-pt-cream mt-1">
                {member.motorcycle.make} {member.motorcycle.model}
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="mt-6 flex flex-wrap gap-3">
              {member.status === "pending" && (
                <AdminActionButton
                  url={`/api/manage-members/${id}/approve`}
                  label="Approve"
                  successMessage="Member approved"
                />
              )}
              <AdminActionButton
                url={`/api/manage-members/${id}/ban`}
                label={member.status === "banned" ? "Unban" : "Ban"}
                variant="danger"
                confirmMessage={`Are you sure you want to ${member.status === "banned" ? "unban" : "ban"} ${member.fullName}?`}
                successMessage={member.status === "banned" ? "Member unbanned" : "Member banned"}
              />
            </div>
          )}
        </div>
      </Card>

      <div className="mt-8">
        <MemberBadges memberId={id} />
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-pt-cream mb-4">Motorcycle</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Make" value={member.motorcycle.make} />
            <Row label="Model" value={member.motorcycle.model} />
            <Row label="Year" value={String(member.motorcycle.year)} />
            <Row label="License Plate" value={member.motorcycle.licensePlate} />
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-pt-cream mb-4">Rider Details</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Gender" value={member.gender} />
            <Row label="Blood Group" value={member.bloodGroup} />
            <Row label="Country" value={member.country} />
            <Row label="Member Since" value={new Date(member.createdAt).getFullYear().toString()} />
          </dl>
        </Card>

        {isAdmin && (
          <>
            <Card className="p-6">
              <h2 className="font-semibold text-pt-cream mb-4">Contact (Admin only)</h2>
              <dl className="space-y-2 text-sm">
                <Row label="Email" value={member.email ?? "-"} />
                <Row label="Primary Mobile" value={member.primaryMobile ?? "-"} />
                <Row label="Secondary Mobile" value={member.secondaryMobile ?? "-"} />
                <Row label="Address" value={member.permanentAddress ?? "-"} />
              </dl>
            </Card>
            <Card className="p-6">
              <h2 className="font-semibold text-pt-cream mb-4">Emergency Contact (Admin only)</h2>
              <dl className="space-y-2 text-sm">
                <Row label="Name" value={member.emergencyContact?.fullName ?? "-"} />
                <Row label="Relationship" value={member.emergencyContact?.relationship ?? "-"} />
                <Row label="Phone" value={member.emergencyContact?.phone ?? "-"} />
              </dl>
            </Card>
          </>
        )}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-pt-muted">{label}</dt>
      <dd className="text-pt-cream">{value}</dd>
    </div>
  );
}
