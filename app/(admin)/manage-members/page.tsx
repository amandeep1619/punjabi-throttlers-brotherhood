import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { listMembersAdmin } from "@/lib/queries/members";
import { getSession } from "@/lib/auth";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SmartImage } from "@/components/ui/SmartImage";
import { Pagination } from "@/components/ui/Pagination";
import { RowMenu, RowMenuLink } from "@/components/admin/RowMenu";
import { RowMenuAction } from "@/components/admin/RowMenuAction";
import { DebouncedSearch } from "@/components/admin/DebouncedSearch";
import { MemberActivityFilter } from "@/components/admin/MemberActivityFilter";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Admin – Manage All Club Members | PT Brotherhood Club",
  description:
    "Admin dashboard to review pending applications, approve or ban members, and manage every Punjabi Throttlers Brotherhood rider profile.",
  path: "/manage-members",
  noIndex: true,
});

const INACTIVE_PRESET_MONTHS: Record<string, number> = { "3m": 3, "6m": 6, "9m": 9 };

/** Resolves the ?inactive=/&from=/&to= query params into a [from, to] date range for the "hasn't joined a ride" filter — undefined means "show everyone" (the default). */
function resolveInactiveRange(inactive?: string, from?: string, to?: string): { noRideFrom?: Date; noRideTo?: Date } {
  if (inactive && inactive in INACTIVE_PRESET_MONTHS) {
    const noRideFrom = new Date();
    noRideFrom.setMonth(noRideFrom.getMonth() - INACTIVE_PRESET_MONTHS[inactive]);
    return { noRideFrom };
  }
  if (inactive === "custom" && from && to) {
    return { noRideFrom: new Date(from), noRideTo: new Date(to) };
  }
  return {};
}

export default async function ManageMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; inactive?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const search = sp.search ?? "";
  const session = await getSession();
  const { noRideFrom, noRideTo } = resolveInactiveRange(sp.inactive, sp.from, sp.to);

  const result = await listMembersAdmin({ page, search, excludeId: session!.userId, noRideFrom, noRideTo });

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sp.inactive) params.set("inactive", sp.inactive);
    if (sp.from) params.set("from", sp.from);
    if (sp.to) params.set("to", sp.to);
    params.set("page", String(p));
    return `/manage-members?${params.toString()}`;
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-pt-cream">Members</h1>
        <Suspense fallback={null}>
          <DebouncedSearch placeholder="Search by name or ID…" />
        </Suspense>
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <MemberActivityFilter />
        </Suspense>
      </div>

      <div className="overflow-x-auto rounded-xl border border-pt-border">
        <table className="w-full text-sm">
          <thead className="bg-pt-black-soft text-pt-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium w-12"></th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((m) => (
              <tr key={String(m._id)} className="border-t border-pt-border/60 hover:bg-pt-black-soft/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-pt-black-soft flex items-center justify-center text-xs font-semibold text-pt-gold">
                      {m.photoUrl ? (
                        <SmartImage src={m.photoUrl} alt={m.fullName} fill className="object-cover" />
                      ) : (
                        m.fullName.charAt(0)
                      )}
                    </div>
                    <div>
                      <Link href={`/members/${m._id}`} className="text-pt-cream hover:text-pt-gold font-medium">
                        {m.fullName}
                      </Link>
                      <p className="text-xs text-pt-muted">{m.memberId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-pt-muted">{m.email}</td>
                <td className="px-4 py-3 text-pt-muted capitalize">{m.role}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.status} />
                </td>
                <td className="px-4 py-3">
                  <RowMenu>
                    <RowMenuLink href={`/members/${m._id}`}>View details</RowMenuLink>
                    {m.status === "pending" && (
                      <RowMenuAction
                        url={`/api/manage-members/${m._id}/approve`}
                        label="Approve"
                        successMessage="Member approved"
                      />
                    )}
                    <RowMenuAction
                      url={`/api/manage-members/${m._id}/ban`}
                      label={m.status === "banned" ? "Unban user" : "Ban user"}
                      danger={m.status !== "banned"}
                      confirmMessage={`${m.status === "banned" ? "Unban" : "Ban"} ${m.fullName}?`}
                      successMessage={m.status === "banned" ? "Member unbanned" : "Member banned"}
                    />
                    <RowMenuAction
                      url={`/api/manage-members/${m._id}/role`}
                      label={m.role === "admin" ? "Remove admin" : "Make admin"}
                      danger={m.role === "admin"}
                      confirmMessage={
                        m.role === "admin" ? `Remove admin access from ${m.fullName}?` : `Make ${m.fullName} an admin?`
                      }
                      successMessage={m.role === "admin" ? "Admin access removed" : `${m.fullName} is now an admin`}
                    />
                  </RowMenu>
                </td>
              </tr>
            ))}
            {result.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-pt-muted">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} totalPages={result.totalPages} buildHref={buildHref} />
    </section>
  );
}
