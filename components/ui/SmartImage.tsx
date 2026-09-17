import Image from "next/image";

/**
 * Local /uploads or /brand paths go through next/image for optimization.
 * External links (arbitrary domains: Instagram, Drive, etc.) fall back to a
 * plain <img> — configuring images.remotePatterns for arbitrary user-supplied
 * domains isn't practical, and these are admin-pasted, not user-uploaded.
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
