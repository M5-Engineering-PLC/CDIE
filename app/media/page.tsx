// Lucid: Media > Newsletters, LinkedIn, and the pointer to programme events.
// Copy: MEDIA. Newsletters open the published issue in a new tab.

import type { Metadata } from "next";
import Image from "next/image";

import { Button } from "@/components/primitives/Button";
import { LinkedInCarousel } from "@/components/sections/LinkedInCarousel";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import {
  eventsPointer,
  mediaItems,
  mediaLanding,
  newslettersCopy,
} from "@/content/media";
import { getLinkedInFeed, isStale, linkedInCopy } from "@/lib/linkedin";

export const metadata: Metadata = {
  title: "Media",
  description: mediaLanding.standfirst,
};

/*
  The page stays static and refreshes on a timer. Without this the feed would be
  read once at build time and never again, so the section would look wired and
  silently stop updating.

  Next requires a literal here, so this cannot import CACHE_SECONDS. Keep the
  two in step: lib/linkedin/config.ts holds the other half.
*/
export const revalidate = 600;

export default async function MediaPage() {
  const newsletters = mediaItems.filter((item) => item.kind === "newsletter");
  const feed = await getLinkedInFeed();

  return (
    <>
      <PageHero
        eyebrow="Media"
        headline={mediaLanding.headline}
        standfirst={mediaLanding.standfirst}
      >
        <Button href="#newsletters">Browse newsletters</Button>
        <Button href="#community" tone="outline">
          Follow our updates
        </Button>
      </PageHero>

      <Section
        id="newsletters"
        eyebrow="Newsletters"
        title={newslettersCopy.headline}
        standfirst={newslettersCopy.standfirst}
      >
        {newsletters.length === 0 ? (
          <div className="border border-dashed border-line bg-surface p-8">
            <p className="max-w-[52ch] text-lead text-ink-2">{newslettersCopy.empty}</p>
            <div className="mt-5">
              <Button href="/contact?topic=general" tone="outline">
                Ask for the latest issue
              </Button>
            </div>
          </div>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {newsletters.map((item) => (
              <li key={item.id} className="card-hit flex flex-col border border-line bg-surface">
                {item.cover ? (
                  <Image
                    src={item.cover.src}
                    alt={item.cover.alt}
                    width={item.cover.width}
                    height={item.cover.height}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : null}
                <div className="flex flex-1 flex-col gap-3 p-6">
                  {item.date ? (
                    <p className="font-mono text-fine tabular-nums text-ink-3">{item.date}</p>
                  ) : null}
                  <h3 className="display text-sub leading-snug">{item.title}</h3>
                  <p className="text-body leading-relaxed text-ink-2">{item.summary}</p>
                  {item.external ? (
                    <p className="mt-auto pt-3 text-body font-medium text-brand">
                      <a
                        href={item.external}
                        target="_blank"
                        rel="noreferrer"
                        className="stretch no-underline"
                      >
                        Read this issue
                      </a>
                      <span aria-hidden="true"> ↗</span>
                      <span className="mt-1 block text-fine font-normal text-ink-3">
                        {newslettersCopy.linkNote}
                      </span>
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        id="community"
        tone="surface"
        eyebrow="From our community"
        title={linkedInCopy.headline}
        standfirst={linkedInCopy.standfirst}
      >
        <LinkedInCarousel
          posts={feed.posts}
          stale={isStale(feed.lastSyncedAt)}
          fallback={linkedInCopy.fallback}
          pageUrl={linkedInCopy.pageUrl}
          privacy={linkedInCopy.privacy}
        />
      </Section>

      <Section eyebrow="Events" title={eventsPointer.headline}>
        <p className="max-w-[58ch] text-lead leading-relaxed text-ink-2">{eventsPointer.body}</p>
        <div className="mt-6">
          <Button href={eventsPointer.action.href}>{eventsPointer.action.label}</Button>
        </div>
      </Section>
    </>
  );
}
