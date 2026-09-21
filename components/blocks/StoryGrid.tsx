// Change request 2026-09-13, section 6.2. Was "Our cohorts", now success stories.
/*
  A card per graduate: portrait, name, cohort, what they say about the
  programme, and links to their own accounts.

  Two rules carried from content/site.ts, which withholds CDIE's own social
  accounts until each URL is confirmed. The same applies per person, and harder,
  because these are private individuals:

  - An icon renders only where a confirmed href exists. No dead icons.
  - A quote is a real person's words. It is never published without written
    consent, which is why the sample records carry no working links at all.
*/

import Image from "next/image";

export type StoryCardItem = {
  id: string;
  name: string;
  cohort: string;
  quote: string;
  image: string;
  alt: string;
  socials: { platform: "linkedin" | "instagram" | "x"; href?: string }[];
};

const GLYPH: Record<"linkedin" | "instagram" | "x", string> = {
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  instagram:
    "M12 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06zM12 5.838A6.162 6.162 0 1 0 12 18.162 6.162 6.162 0 0 0 12 5.838zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.846-10.405a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z",
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
};

const LABEL: Record<"linkedin" | "instagram" | "x", string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  x: "X",
};

export function StoryGrid({ items }: { items: StoryCardItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="grid gap-px bg-line md:grid-cols-2 lg:grid-cols-3">
      {items.map((story) => (
        <li key={story.id} className="flex flex-col bg-raise">
          <div className="relative aspect-[5/6] overflow-hidden">
            <Image
              src={story.image}
              alt={story.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-6">
            <blockquote className="border-l-2 border-brand-lift pl-4 text-body leading-relaxed text-ink-2">
              {story.quote}
            </blockquote>
            <div className="mt-auto pt-3">
              <p className="text-lead text-ink">{story.name}</p>
              <p className="text-fine text-ink-3">{story.cohort}</p>
            </div>
            {story.socials.some((account) => account.href) ? (
              <ul className="flex gap-2 pt-1">
                {story.socials
                  .filter((account) => account.href)
                  .map((account) => (
                    <li key={account.platform}>
                      <a
                        href={account.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${story.name} on ${LABEL[account.platform]}`}
                        className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-3 transition-colors hover:border-brand hover:text-brand"
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                          <path d={GLYPH[account.platform]} />
                        </svg>
                      </a>
                    </li>
                  ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
