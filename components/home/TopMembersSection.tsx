import { SectionHeading } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { MemberCard, type MemberCardData } from "@/components/members/MemberCard";

export default function TopMembersSection({ members }: { members: MemberCardData[] }) {
  if (members.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 border-t border-pt-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Our Members" title="Meet Our Throttlers" />
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {members.map((member) => (
            <MemberCard key={member._id} member={member} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <LinkButton href="/members" variant="outline" size="lg">
            See More Members
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
