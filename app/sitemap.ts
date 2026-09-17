import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  // Only truly public routes — /rides, /members etc. sit behind login and
  // would just redirect a crawler, so they don't belong in the sitemap.
  const staticRoutes = ["/", "/join", "/login", "/policies"];
  return staticRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
