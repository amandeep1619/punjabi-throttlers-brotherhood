import { SmartImage } from "@/components/ui/SmartImage";

/**
 * Banner is optional on a ride now — this is the one place that decides what
 * renders in its place, so every card/hero/thumbnail shows the same
 * placeholder instead of each caller null-checking `ride.banner` itself.
 * Always absolutely-positioned (`fill`) — matches every current call site.
 */
export function RideBannerImage({
  banner,
  alt,
  className = "",
}: {
  banner?: { url: string; source: string };
  alt: string;
  className?: string;
}) {
  if (!banner?.url) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-pt-black-soft text-pt-muted">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="M21 15l-5-5-9 9" />
        </svg>
        <span className="text-[10px] uppercase tracking-wide">No banner</span>
      </div>
    );
  }
  return <SmartImage src={banner.url} alt={alt} fill className={className} />;
}
