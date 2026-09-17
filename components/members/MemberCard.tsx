import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SmartImage } from "@/components/ui/SmartImage";

export type MemberCardData = {
  _id: string;
  memberId: string;
  fullName: string;
  photoUrl?: string;
  totalKmWithClub: number;
  location?: string;
};

export function MemberCard({ member }: { member: MemberCardData }) {
  return (
    <Link href={`/members/${member._id}`}>
      <Card className="p-5 text-center hover:border-pt-gold/50 transition-colors h-full flex flex-col items-center">
        <div className="relative h-24 w-24 rounded-full overflow-hidden ring-2 ring-pt-gold/50 bg-pt-black-soft mb-4">
          {member.photoUrl ? (
            <SmartImage src={member.photoUrl} alt={member.fullName} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-2xl font-semibold text-pt-gold">
              {member.fullName.charAt(0)}
            </div>
          )}
        </div>
        <p className="font-semibold text-pt-cream">{member.fullName}</p>
        <p className="text-xs text-pt-muted mt-1">{member.memberId}</p>
        {member.location && <p className="text-xs text-pt-muted mt-1">{member.location}</p>}
        <p className="mt-3 text-pt-gold font-bold">{member.totalKmWithClub.toLocaleString("en-IN")} km</p>
        <p className="text-[11px] text-pt-muted uppercase tracking-wide">with the club</p>
      </Card>
    </Link>
  );
}
