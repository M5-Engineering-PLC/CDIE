// Section. The opening of every page except Home. Copy supplies the headline.

import Link from "next/link";
import type { ReactNode } from "react";

export type Crumb = { label: string; href: string };

export type PageHeroProps = {
  eyebrow: string;
  headline: string;
  standfirst?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
};

export function PageHero({
  eyebrow,
  headline,
  standfirst,
  crumbs,
  children,
}: PageHeroProps) {
  return (
    <section className="border-b border-line bg-surface">
      <div className="shell py-14 md:py-20">
        {crumbs && crumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-fine text-ink-3">
              {crumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  <Link href={crumb.href} className="text-ink-3 no-underline hover:text-ink-2">
                    {crumb.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <p className="kicker">{eyebrow}</p>
        <h1 className="display mt-4 max-w-[18ch] text-head md:text-hero">{headline}</h1>
        {standfirst ? (
          <p className="mt-6 max-w-[58ch] text-lead leading-relaxed text-ink-2">{standfirst}</p>
        ) : null}
        {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </section>
  );
}
