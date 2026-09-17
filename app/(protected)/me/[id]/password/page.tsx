import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import ProfileSubNav from "@/components/layout/ProfileSubNav";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";

export const metadata: Metadata = { title: "Change Password" };

export default async function ChangePasswordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (id !== session.userId) redirect(`/me/${session.userId}/password`);

  return (
    <section className="mx-auto max-w-2xl px-4 sm:px-6 py-16 sm:py-20">
      <ProfileSubNav memberId={session.userId} />
      <h1 className="text-2xl font-semibold text-pt-cream mb-6">Change Password</h1>
      <Card className="p-6 sm:p-8">
        <ChangePasswordForm />
      </Card>
    </section>
  );
}
