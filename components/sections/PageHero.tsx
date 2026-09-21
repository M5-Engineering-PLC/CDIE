// Section. The opening of every page except Home. Copy supplies the headline.

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type Crumb = { label: string; href: string };

export type PageHeroProps = {
  eyebrow: string;
  headline: string;
  standfirst?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
  /*
    Change request 2026-09-13, section 5.1. Optional so every existing hero is
    unchanged; when supplied the hero becomes two columns and the text keeps its
    measure instead of stretching to meet the picture.
  */
  image?: { src: string; alt: string };
};

export function PageHero({
  eyebrow,
  headline,
  standfirst,
  crumbs,
  children,
  image,
}: PageHeroProps) {
  return (
    <section className="border-b border-line bg-surface">
      <div
        className={`shell band-y ${
          image ? "grid items-center gap-10 md:grid-cols-[1.05fr_.95fr] md:gap-14" : ""
        }`}
      >
        <div>
        {crumbs && crumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-4 md:mb-6">
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
        <h1 className="display mt-3 max-w-[18ch] text-title md:mt-4 md:text-hero">{headline}</h1>
        {standfirst ? (
          <p className="trim-mobile mt-4 max-w-[58ch] text-lead leading-relaxed text-ink-2 md:mt-6">
            {standfirst}
          </p>
        ) : null}
        {children ? <div className="mt-5 flex flex-wrap gap-3 md:mt-8">{children}</div> : null}
        </div>

        {image ? (
          <div className="relative aspect-[4/3] overflow-hidden border border-line md:aspect-[5/4]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              priority
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
