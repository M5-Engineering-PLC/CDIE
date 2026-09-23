// The dashboard's one bar: the CDIE logo and the dashboard's own links. Internal tooling.

import Image from "next/image";
import Link from "next/link";

type BarLink = { href: string; label: string };

export function AdminBar({ logo, links = [], signOut }: {
  logo: { src: string; alt: string; width: number; height: number };
  links?: BarLink[];
  signOut?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
        <Link href="/admin" className="flex items-center gap-3">
          <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} className="h-9 w-auto" priority />
          <span className="font-mono text-fine uppercase tracking-widest text-ink-3">Dashboard</span>
        </Link>
        {links.length > 0 ? (
          <nav aria-label="Dashboard" className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-fine text-ink-2 transition-colors hover:text-brand">
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
        {signOut ? <div className="ml-auto">{signOut}</div> : null}
      </div>
    </header>
  );
}
