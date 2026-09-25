import { SmartImage } from "@/components/ui/SmartImage";

const SIZE_CLASSES = {
  sm: "h-10 w-10 text-base",
  md: "h-14 w-14 text-2xl",
  lg: "h-20 w-20 text-4xl",
} as const;

/**
 * Real uploaded artwork when a badge has one; otherwise the letter-avatar
 * placeholder (first letter of the badge name, same visual language as the
 * member-photo fallback — ring circle, gold letter).
 */
export function BadgeAvatar({
  name,
  imageUrl,
  size = "md",
  className = "",
}: {
  name: string;
  imageUrl?: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  return (
    <div
      className={`${SIZE_CLASSES[size]} shrink-0 overflow-hidden rounded-full bg-pt-black-soft border border-pt-gold/40 flex items-center justify-center font-semibold text-pt-gold ${className}`}
    >
      {imageUrl ? (
        <SmartImage src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        name.trim().charAt(0).toUpperCase() || "?"
      )}
    </div>
  );
}
