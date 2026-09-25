// DNS cutover runbook, step 16: addresses the WordPress site published, taken
// from its sitemaps on 25 September 2026, sent to the page that now holds
// the same material so old links from search, LinkedIn and email still land.
import type { NextConfig } from "next";

type Redirect = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>[number];

const to = (destination: string, sources: string[]): Redirect[] =>
  sources.map((source) => ({ source, destination, permanent: true }));

export const legacyRedirects: Redirect[] = [
  ...to("/about", ["/about-us", "/our-team"]),
  ...to("/contact", ["/contacts", "/engage-with-ive", "/get-involved", "/faq", "/faq-2"]),
  ...to("/programmes", ["/apply", "/our-services", "/services"]),
  ...to("/programmes/invention-education", ["/invention-education-program"]),
  ...to("/programmes/mdi", [
    "/mdi",
    "/2025/05/20/expression-of-interest-medical-device-innovation-masters-program",
  ]),
  ...to("/programmes/catalyst-grants", [
    "/2025/05/16/catalyst-grant-call-for-proposals",
    "/2025/05/16/catalyst-grant-event",
  ]),
  ...to("/programmes/design-challenge", [
    "/2025/05/16/invention-education-design-challenge-2025",
    "/2026/04/21/design-challenge-2026",
  ]),
  ...to("/programmes/summer-programme", ["/2025/07/15/summer-program-ive-summer-program-kicks-off"]),
  ...to("/media#newsletters", [
    "/2026/05/01/:slug(ive-newsletter-.*)",
    "/blog/newsletter",
    "/category/newsletter",
  ]),
  // Every other post, archive and listing page.
  ...to("/media", [
    "/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug",
    "/blog/:path*",
    "/blog-grid-view",
    "/blog-large-image",
    "/blog-left-image",
    "/category/:path*",
    "/events",
    "/newsletter-events",
    "/student-blogs",
  ]),
  // Demonstration pages the WordPress theme shipped with.
  ...to("/", ["/homepage-:n", "/elements", "/research-style-:n"]),
  // Newsletter PDFs linked from old emails; the same files live in public/newsletters.
  {
    source: "/wp-content/uploads/:year/:month/:file(IvE-Newsletter[^/]*\\.pdf)",
    destination: "/newsletters/:file",
    permanent: true,
  },
];
