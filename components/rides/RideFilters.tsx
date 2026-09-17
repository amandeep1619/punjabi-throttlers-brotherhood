const STATUS_OPTIONS = ["", "upcoming", "completed", "cancelled"];
const COMMON_TAGS = ["", "one-day", "night-stay", "weekend", "long-ride"];

// Native <form method="get"> — the browser builds the query string on submit,
// Server Components read it via searchParams. No client JS needed for filtering.
export function RideFilters({
  search,
  status,
  year,
  tag,
}: {
  search: string;
  status: string;
  year: string;
  tag: string;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <form method="get" className="grid sm:grid-cols-4 gap-3 mb-10">
      <input
        type="text"
        name="search"
        defaultValue={search}
        placeholder="Search ride name…"
        className="rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2.5 text-sm text-pt-cream focus:outline-none focus:border-pt-gold sm:col-span-2"
      />
      <select
        name="status"
        defaultValue={status}
        className="rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2.5 text-sm text-pt-cream focus:outline-none focus:border-pt-gold"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s ? s[0].toUpperCase() + s.slice(1) : "All Statuses"}
          </option>
        ))}
      </select>
      <select
        name="year"
        defaultValue={year}
        className="rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2.5 text-sm text-pt-cream focus:outline-none focus:border-pt-gold"
      >
        <option value="">All Years</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <select
        name="tag"
        defaultValue={tag}
        className="rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2.5 text-sm text-pt-cream focus:outline-none focus:border-pt-gold sm:col-span-4"
      >
        {COMMON_TAGS.map((t) => (
          <option key={t} value={t}>
            {t ? t.replace("-", " ") : "All Ride Types"}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="sm:col-span-4 rounded-lg bg-pt-gold text-pt-black font-medium py-2.5 text-sm hover:brightness-110"
      >
        Apply Filters
      </button>
    </form>
  );
}
