import Image from "next/image";

/**
 * Local /brand paths go through next/image for optimization. Everything else
 * — S3-hosted uploads (members/rides/gallery) and admin-pasted external links
 * (Instagram, Drive, etc.) — falls back to a plain <img>. Two reasons: S3
 * already serves those files cheaply/efficiently on its own, and configuring
 * images.remotePatterns for arbitrary user-supplied domains isn't practical,
 * so neither needs (or should pay for) next/image's on-request resizing —
 * real savings on a small Lightsail instance's CPU budget.
 */
export function SmartImage({
  src,
  alt,
  fill,
  className = "",
  sizes,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
}) {
  const isLocal = src.startsWith("/");
  if (isLocal) {
    return <Image src={src} alt={alt} fill={fill} className={className} sizes={sizes} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`${fill ? "absolute inset-0 h-full w-full" : ""} ${className}`} />;
}
