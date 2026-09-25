import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { SmoothScroll } from "@/components/chrome/SmoothScroll";
import { site } from "@/content/site";
import { defaultDescription, pageMetadata, siteTitle, siteUrl } from "@/lib/seo";

import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

/*
  Favicons follow the app/ file conventions: favicon.ico, icon0.svg, icon1.png,
  apple-icon.png and manifest.json in this folder are linked by Next itself.
  Titles read "Page | CDIE"; lib/seo.ts builds each page's description, canonical
  link and share card.
*/
const homeShare = pageMetadata({ description: defaultDescription, path: "/" });

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteTitle,
    template: `%s | ${site.name}`,
  },
  description: defaultDescription,
  applicationName: site.name,
  keywords: [
    "CDIE",
    "Centre for Design, Innovation & Engineering",
    "Kenyatta University",
    "medical device innovation",
    "invention education",
    "design studio",
    "prototyping",
    "Kenya",
  ],
  authors: [{ name: `${site.name}, ${site.institution}` }],
  appleWebApp: { title: site.name },
  formatDetection: { telephone: false },
  // The share card any route without its own falls back to.
  openGraph: homeShare.openGraph,
  twitter: homeShare.twitter,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /* The site chrome (nav, footer, skip link) lives in app/(site)/layout.tsx so
     the admin dashboard can carry its own bar instead of the page links. */
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
