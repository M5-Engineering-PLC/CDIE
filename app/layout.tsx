import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteNav } from "@/components/chrome/SiteNav";
import { SmoothScroll } from "@/components/chrome/SmoothScroll";
import { SkipLink } from "@/components/chrome/SkipLink";
import { contact, nav, site, socialAccounts, utilityLinks } from "@/content/site";

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
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>
        <SmoothScroll />
        <SkipLink />
        <SiteNav
          items={[...nav]}
          utility={[...utilityLinks]}
          name={site.name}
          longName={site.longName}
          institution={site.institution}
          logo={site.logo}
        />
        <ViewTransition default="page"><main id="main">{children}</main></ViewTransition>
        {/*
          Change request 2026-09-21: Contact leaves the top bar but not the
          site. The footer keeps it, so the route every enquiry resolves to is
          still one click from any page.
        */}
        <SiteFooter
          items={[...nav]}
          utility={[...utilityLinks]}
          contact={contact}
          name={site.name}
          longName={site.longName}
          institution={site.institution}
          socialAccounts={[...socialAccounts]}
        />
      </body>
    </html>
  );
}
