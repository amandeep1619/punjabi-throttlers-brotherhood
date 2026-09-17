import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10" aria-label="Pagination">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`px-3 py-2 rounded-lg text-sm border border-pt-border ${
          page === 1 ? "pointer-events-none opacity-30" : "text-pt-cream hover:border-pt-gold/60"
        }`}
      >
        Prev
      </Link>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="text-pt-muted px-1">…</span>}
          <Link
            href={buildHref(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm border ${
              p === page
                ? "bg-pt-gold text-pt-black border-pt-gold font-semibold"
                : "border-pt-border text-pt-cream hover:border-pt-gold/60"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`px-3 py-2 rounded-lg text-sm border border-pt-border ${
          page === totalPages ? "pointer-events-none opacity-30" : "text-pt-cream hover:border-pt-gold/60"
        }`}
      >
        Next
      </Link>
    </nav>
  );
}
