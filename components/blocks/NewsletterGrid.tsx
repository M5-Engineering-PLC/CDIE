// Change request 2026-09-13, section 5.2. Copy: MEDIA > Newsletter.
/*
  A card per issue: cover image, issue number, title, short description.

  The issue number is a separate field rather than part of the title because it
  is what people refer to an issue by, and it needs to stay readable when the
  titles vary in length.

  An issue renders without a link until a confirmed URL exists. The audit found
  the live newsletter posts are a bare PDF link with no summary, so the
  descriptions here have to be written rather than migrated.
*/

/*
  Change request 2026-09-21, section 1: a phone shows half the band. A stack of
  cards is the single biggest thing on a long page, so below the md breakpoint
  the list scroll-snaps sideways and the reader sees one card and the edge of
  the next. Above it, the grid it has always been. No JavaScript either side:
  the browser supplies the swipe, the inertia and the keyboard.
*/

import Image from "next/image";

import { AutoRail } from "@/components/sections/AutoRail";

export type NewsletterCardItem = {
  id: string;
  issue: string;
  title: string;
  summary: string;
  image: string;
  alt: string;
  href?: string;
};

export function NewsletterGrid({ items }: { items: NewsletterCardItem[] }) {
  if (items.length === 0) return null;

  return (
    <AutoRail className="rail -mx-gutter auto-cols-[82%] gap-4 px-gutter md:mx-0 md:grid-flow-row md:auto-cols-auto md:grid-cols-2 md:gap-px md:overflow-visible md:bg-line md:px-0 lg:grid-cols-3">
      {items.map((issue) => (
        <li key={issue.id} className="card-hit group flex flex-col border border-line bg-raise md:border-0">
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={issue.image}
              alt={issue.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-6">
            <p className="kicker">{issue.issue}</p>
            <h3 className="display text-sub leading-snug">{issue.title}</h3>
            <p className="text-body leading-relaxed text-ink-2">{issue.summary}</p>
            <div className="mt-auto pt-4">
              {issue.href ? (
                <a
                  href={issue.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="stretch font-medium text-brand no-underline transition-colors group-hover:text-brand-live"
                >
                  Read this issue →<span className="sr-only"> (PDF, opens in a new tab)</span>
                </a>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </AutoRail>
  );
}
