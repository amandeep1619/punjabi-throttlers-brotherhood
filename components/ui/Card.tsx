export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-pt-border bg-pt-black-card/80 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : "text-left"}`}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pt-gold mb-3">{eyebrow}</p>
      )}
      <h2 className="text-3xl sm:text-4xl font-semibold text-pt-cream text-balance">{title}</h2>
      {description && <p className="mt-3 text-pt-muted text-balance">{description}</p>}
    </div>
  );
}
