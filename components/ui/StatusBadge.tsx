const DOT_COLOR: Record<string, string> = {
  upcoming: "bg-blue-400",
  completed: "bg-emerald-400",
  cancelled: "bg-red-400",
  active: "bg-emerald-400",
  pending: "bg-amber-400",
  banned: "bg-red-400",
};

const TEXT_COLOR: Record<string, string> = {
  upcoming: "text-blue-200",
  completed: "text-emerald-200",
  cancelled: "text-red-200",
  active: "text-emerald-200",
  pending: "text-amber-200",
  banned: "text-red-200",
};

// Solid backdrop (not translucent) so this stays legible sitting on top of a
// busy photo — a tinted-translucent chip picks up the image behind it and
// turns into visual noise instead of a clean label.
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-pt-black/85 backdrop-blur-sm border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${
        TEXT_COLOR[status] ?? "text-pt-muted"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLOR[status] ?? "bg-pt-muted"}`} />
      {status}
    </span>
  );
}
