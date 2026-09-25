// Every public route under app/(site). Add a line here when a page is added.
import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

const routes = [
  "/",
  "/programmes",
  "/programmes/mdi",
  "/programmes/invention-education",
  "/programmes/design-challenge",
  "/programmes/catalyst-grants",
  "/programmes/training",
  "/programmes/summer-programme",
  "/design-studio",
  "/media",
  "/about",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: path === "/media" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.split("/").length > 2 ? 0.6 : 0.8,
  }));
}
