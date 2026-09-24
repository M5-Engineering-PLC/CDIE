/*
  The admin area. Nothing under /admin is part of the public website: it is not
  in the Lucid IA, it carries no copy from the Actual Copy tab, and no header,
  footer or nav on the viewer site links to it. It is reached by typing the URL.

  Treat it as internal tooling that happens to be served by the same app.

  Final pass 2026-09-23: "remove the page links (Programmes, Design Studio
  etc.) and retain the Dashboard navbar and the CDIE logo". The site chrome
  lives in app/(site)/layout.tsx, so none of it reaches this tree; the bar here
  is the logo and, once signed in, the dashboard links.
*/

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-paper">{children}</div>;
}
