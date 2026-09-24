import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getMemberAdminView } from "@/lib/queries/members";
import { toPlain } from "@/lib/serialize";
import { Card } from "@/components/ui/Card";
import MeEditForm from "@/components/profile/MeEditForm";
import PhotoUpload from "@/components/profile/PhotoUpload";
import ProfileSubNav from "@/components/layout/ProfileSubNav";
import { PushSubscribe } from "@/components/profile/PushSubscribe";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return pageMetadata({
    title: "Manage Your Rider Profile | PT Brotherhood Members",
    description:
      "Update your personal details, motorcycle information, and emergency contact on your Punjabi Throttlers Brotherhood member profile page.",
    path: `/me/${id}`,
    noIndex: true,
  });
}

type OwnProfile = {
  memberId: string;
  fullName: string;
  photoUrl?: string;
  primaryMobile: string;
  secondaryMobile?: string;
  location?: string;
  permanentAddress?: string;
  motorcycle: { make: string; model: string; year: number; licensePlate: string };
  emergencyContact: { fullName: string; relationship: string; phone: string };
};

export default async function MyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  // The URL id is cosmetic only — every read/write here is scoped to the
  // session's own userId, never the param, so editing /me/<someone-else> is impossible.
  if (id !== session.userId) redirect(`/me/${session.userId}`);

  const raw = await getMemberAdminView(session.userId);
  if (!raw) redirect("/login");
  const member = toPlain<OwnProfile>(raw);

  return (
    <section className="mx-auto max-w-2xl px-4 sm:px-6 py-16 sm:py-20">
      <ProfileSubNav memberId={session.userId} />
      <div className="flex items-center gap-6 mb-10">
        <PhotoUpload currentUrl={member.photoUrl} name={member.fullName} />
        <div>
          <h1 className="text-2xl font-semibold text-pt-cream">{member.fullName}</h1>
          <p className="text-pt-gold font-medium">{member.memberId}</p>
        </div>
      </div>

      <div className="mb-6">
        <PushSubscribe />
      </div>

      <Card className="p-6 sm:p-8">
        <MeEditForm
          defaults={{
            fullName: member.fullName,
            primaryMobile: member.primaryMobile,
            secondaryMobile: member.secondaryMobile ?? "",
            location: member.location ?? "",
            permanentAddress: member.permanentAddress ?? "",
            make: member.motorcycle.make,
            model: member.motorcycle.model,
            year: member.motorcycle.year,
            licensePlate: member.motorcycle.licensePlate,
            emergencyFullName: member.emergencyContact.fullName,
            emergencyRelationship: member.emergencyContact.relationship,
            emergencyPhone: member.emergencyContact.phone,
          }}
        />
      </Card>
    </section>
  );
}
