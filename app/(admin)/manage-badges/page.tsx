import type { Metadata } from "next";
import { listBadges } from "@/lib/queries/badges";
import { LinkButton } from "@/components/ui/Button";
import { RowMenu, RowMenuLink } from "@/components/admin/RowMenu";
import { RowMenuAction } from "@/components/admin/RowMenuAction";

export const metadata: Metadata = { title: "Manage Badges" };

function criteriaLabel(badge: { criteriaType: string; tag?: string; threshold: number }): string {
  if (badge.criteriaType === "TOTAL_KM") return `${badge.threshold.toLocaleString("en-IN")} km covered`;
  return badge.tag ? `${badge.threshold} "${badge.tag}" rides` : `${badge.threshold} rides completed`;
}

export default async function ManageBadgesPage() {
  const badges = await listBadges();

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-pt-cream">Badges</h1>
          <p className="text-sm text-pt-muted mt-1">{badges.length} badges configured</p>
        </div>
        <LinkButton href="/manage-badges/new">Create Badge</LinkButton>
      </div>

      <div className="overflow-x-auto rounded-xl border border-pt-border">
        <table className="w-full text-sm">
          <thead className="bg-pt-black-soft text-pt-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Badge</th>
              <th className="px-4 py-3 font-medium">Criteria</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium w-12"></th>
            </tr>
          </thead>
          <tbody>
            {badges.map((badge) => (
              <tr key={String(badge._id)} className="border-t border-pt-border/60 hover:bg-pt-black-soft/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{badge.icon}</span>
                    <div>
                      <p className="text-pt-cream font-medium">{badge.name}</p>
                      <p className="text-xs text-pt-muted">{badge.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-pt-muted">{criteriaLabel(badge)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full bg-pt-black/85 border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      badge.active ? "text-emerald-200" : "text-pt-muted"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${badge.active ? "bg-emerald-400" : "bg-pt-muted"}`} />
                    {badge.active ? "active" : "inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <RowMenu>
                    <RowMenuLink href={`/manage-badges/${badge._id}`}>Edit badge</RowMenuLink>
                    <RowMenuAction
                      url={`/api/manage-badges/${badge._id}`}
                      body={{ active: !badge.active }}
                      label={badge.active ? "Deactivate" : "Activate"}
                      successMessage={badge.active ? "Badge deactivated" : "Badge activated"}
                    />
                    <RowMenuAction
                      url={`/api/manage-badges/${badge._id}`}
                      method="DELETE"
                      label="Delete badge"
                      danger
                      confirmMessage={`Delete "${badge.name}"? Members who already earned it will lose it.`}
                      successMessage="Badge deleted"
                    />
                  </RowMenu>
                </td>
              </tr>
            ))}
            {badges.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-pt-muted">
                  No badges yet — create the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
