import Link from "next/link";
import { ButtonHTMLAttributes, forwardRef } from "react";

const VARIANTS = {
  primary:
    "bg-linear-to-r from-pt-gold to-pt-gold-deep text-pt-black hover:brightness-110 shadow-[0_0_24px_-6px_rgba(221,163,101,0.6)]",
  outline: "border border-pt-gold/60 text-pt-gold hover:bg-pt-gold/10",
  ghost: "text-pt-cream hover:text-pt-gold",
  danger: "border border-red-500/50 text-red-300 hover:bg-red-500/10",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
} as const;

type Variant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(({ className = "", variant = "primary", size = "md", ...props }, ref) => (
  <button ref={ref} className={`${base} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...props} />
));
Button.displayName = "Button";

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}>
      {children}
    </Link>
  );
}
