import type { Metadata } from "next";
import { listMembersPublic } from "@/lib/queries/members";
import { getSession } from "@/lib/auth";
import { toPlain } from "@/lib/serialize";
import { MemberCard, type MemberCardData } from "@/components/members/MemberCard";
import { Pagination } from "@/components/ui/Pagination";
import { SectionHeading } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Members",
  description: "Meet every member of the Punjabi Throttlers Brotherhood.",
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const search = sp.search ?? "";
  const session = await getSession();

  const result = await listMembersPublic({ page, search, excludeId: session?.userId });

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(p));
    return `/members?${params.toString()}`;
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
      <SectionHeading eyebrow="Our Members" title="The Throttlers" />

      <form method="get" className="mt-10 max-w-md mx-auto">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by name…"
          className="w-full rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2.5 text-sm text-pt-cream focus:outline-none focus:border-pt-gold"
        />
      </form>

      {result.items.length === 0 ? (
        <p className="text-center text-pt-muted py-16">No members found.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {result.items.map((member) => (
            <MemberCard key={String(member._id)} member={toPlain<MemberCardData>(member)} />
          ))}
        </div>
      )}

      <Pagination page={result.page} totalPages={result.totalPages} buildHref={buildHref} />
    </section>
  );
}
