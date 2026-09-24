// Crawl rules. The dashboard and the API are not website surfaces.
import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
