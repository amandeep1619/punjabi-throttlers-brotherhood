import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { listMembersAdmin } from "@/lib/queries/members";
import { getSession } from "@/lib/auth";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { RowMenu, RowMenuLink } from "@/components/admin/RowMenu";
import { RowMenuAction } from "@/components/admin/RowMenuAction";
import { DebouncedSearch } from "@/components/admin/DebouncedSearch";

export const metadata: Metadata = { title: "Manage Members" };

export default async function ManageMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const search = sp.search ?? "";
  const session = await getSession();

  const result = await listMembersAdmin({ page, search, excludeId: session!.userId });

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(p));
    return `/manage-members?${params.toString()}`;
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-semibold text-pt-cream">Members</h1>
        <Suspense fallback={null}>
          <DebouncedSearch placeholder="Search by name or ID…" />
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
                  <Link href={`/members/${m._id}`} className="text-pt-cream hover:text-pt-gold font-medium">
                    {m.fullName}
                  </Link>
                  <p className="text-xs text-pt-muted">{m.memberId}</p>
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
