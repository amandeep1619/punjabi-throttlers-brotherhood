import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/join", "/login", "/policies"],
      // Everything else requires a session, so crawling it is pointless anyway.
      disallow: ["/rides", "/members", "/me", "/manage-members", "/manage-rides", "/manage-policies", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
