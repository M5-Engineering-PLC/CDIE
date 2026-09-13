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

import Image from "next/image";
import Link from "next/link";

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
    <ul className="grid gap-px bg-line md:grid-cols-2 lg:grid-cols-3">
      {items.map((issue) => (
        <li key={issue.id} className="card-hit group flex flex-col bg-raise">
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
                <Link
                  href={issue.href}
                  className="stretch font-medium text-brand no-underline"
                >
                  Read this issue →
                </Link>
              ) : (
                <span className="text-fine text-ink-3">Link to be confirmed</span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
