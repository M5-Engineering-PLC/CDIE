// Page metadata: one builder so every route carries the same title format,
// canonical link, Open Graph card and Twitter card.
/*
  2026-09-24: titles read "Programmes | CDIE" (no em dash). Descriptions come
  from each page's standfirst in content/, so an edit to the copy updates the
  search snippet and the share card with it. Open Graph is not merged with the
  root layout's by Next, so every field a card needs is set here, per page.
*/

import type { Metadata } from "next";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    "https://cdie.co.ke",
);

export const siteName = "CDIE";
export const siteTitle = `${siteName} | Centre for Design, Innovation & Engineering`;
export const defaultDescription =
  "The Centre for Design, Innovation & Engineering brings hands-on learning and medical device prototyping together at Kenyatta University.";
const defaultImage = { src: "/hero-workshop-1.jpg", alt: "Makers at work in the CDIE workshop" };

/* Search results cut near 160 characters; end on a whole word instead. */
export function snippet(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.–-]+$/, "")}…`;
}

type PageMetaInput = {
  /** Page name alone; the layout template adds "| CDIE". Omit for Home. */
  title?: string;
  description: string;
  path: string;
  image?: { src: string; alt: string };
};

export function pageMetadata({ title, description, path, image = defaultImage }: PageMetaInput): Metadata {
  const fullTitle = title ? `${title} | ${siteName}` : siteTitle;
  const text = snippet(description);
  const images = [{ url: image.src, alt: image.alt }];
  return {
    ...(title ? { title } : {}),
    description: text,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_KE",
      siteName: `${siteName}, Kenyatta University`,
      url: path,
      title: fullTitle,
      description: text,
      images,
    },
    twitter: {
      card: "summary_large_image",
      site: "@EduInventKU",
      title: fullTitle,
      description: text,
      images,
    },
  };
}
