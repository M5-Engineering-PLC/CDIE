/*
  The admin area. Nothing under /admin is part of the public website: it is not
  in the Lucid IA, it carries no copy from the Actual Copy tab, and no header,
  footer or nav on the viewer site links to it. It is reached by typing the URL.

  Treat it as internal tooling that happens to be served by the same app.
*/

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CDIE admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line px-6 py-3">
        <Link href="/admin" className="font-mono text-fine uppercase tracking-widest text-ink">
          CDIE admin
        </Link>
        <p className="text-fine text-ink-3">
          Internal tooling. Not part of the viewer site, and not linked from it.
        </p>
      </header>
      {children}
    </div>
  );
}
