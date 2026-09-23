import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { SmoothScroll } from "@/components/chrome/SmoothScroll";
import { site } from "@/content/site";

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
