import { getMemberBadges } from "@/lib/queries/badges";
import { toPlain } from "@/lib/serialize";
import { Card } from "@/components/ui/Card";
import { BadgeGrid } from "@/components/badges/BadgeGrid";

type EarnedBadge = {
  _id: string;
  awardedAt: string;
  badge: { name: string; description: string; icon: string } | null;
};

export default async function MemberBadges({ memberId }: { memberId: string }) {
  const raw = await getMemberBadges(memberId);
  const earned = toPlain<EarnedBadge[]>(raw).filter((e) => e.badge);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-pt-cream">Badges</h3>
        <span className="text-xs text-pt-muted">{earned.length} earned</span>
      </div>

      {earned.length === 0 ? (
        <p className="text-sm text-pt-muted">No badges earned yet — get out there and ride.</p>
      ) : (
        <BadgeGrid earned={earned} />
      )}
    </Card>
  );
}
