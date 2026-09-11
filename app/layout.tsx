import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Newsreader } from "next/font/google";

import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteNav } from "@/components/chrome/SiteNav";
import { SkipLink } from "@/components/chrome/SkipLink";
import { contact, nav, site, utilityLinks } from "@/content/site";

import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-newsreader",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.longName}`,
    template: `%s — ${site.name}`,
  },
  description:
    "The Centre for Design, Innovation & Engineering brings hands-on learning and medical device prototyping together at Kenyatta University.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${newsreader.variable} ${plexMono.variable}`}
    >
      <body>
        <SkipLink />
        <SiteNav
          items={[...nav]}
          name={site.name}
          longName={site.longName}
          institution={site.institution}
        />
        <main id="main">{children}</main>
        <SiteFooter
          items={[...nav]}
          utility={[...utilityLinks]}
          contact={contact}
          name={site.name}
          longName={site.longName}
          institution={site.institution}
        />
      </body>
    </html>
  );
}
