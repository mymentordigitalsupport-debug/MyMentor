import type { MetadataRoute } from "next";
import { PUBLIC_SITE_URL } from "@/lib/public-site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/author/",
        "/course/",
        "/journey/",
        "/journal/",
        "/onboarding/",
        "/progress/",
        "/resources/",
        "/settings/",
        "/today/",
      ],
    },
    sitemap: `${PUBLIC_SITE_URL}/sitemap.xml`,
    host: PUBLIC_SITE_URL,
  };
}
