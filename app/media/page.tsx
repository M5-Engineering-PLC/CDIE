// Lucid: Media > Newsletters, LinkedIn, and the pointer to programme events.
// Copy: MEDIA. Newsletters open the published issue in a new tab.

import type { Metadata } from "next";

import { Button } from "@/components/primitives/Button";
import { LinkedInCarousel } from "@/components/sections/LinkedInCarousel";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { isStale, linkedInCopy, stubFeed } from "@/content/linkedin";
import {
  eventsPointer,
  mediaItems,
  mediaLanding,
  newslettersCopy,
} from "@/content/media";

export const metadata: Metadata = {
  title: "Media",
  description: mediaLanding.standfirst,
};

export default function MediaPage() {
  const newsletters = mediaItems.filter((item) => item.kind === "newsletter");
  const feed = stubFeed;

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
          <ul className="grid gap-px bg-line md:grid-cols-2 lg:grid-cols-3">
            {newsletters.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 bg-surface p-6">
                {item.date ? (
                  <p className="font-mono text-fine tabular-nums text-ink-3">{item.date}</p>
                ) : null}
                <h3 className="display text-sub leading-snug">{item.title}</h3>
                <p className="text-body leading-relaxed text-ink-2">{item.summary}</p>
                {item.external ? (
                  <div className="mt-auto pt-2">
                    <Button href={item.external} tone="quiet" external>
                      Read this issue
                    </Button>
                    <p className="mt-1 text-fine text-ink-3">{newslettersCopy.linkNote}</p>
                  </div>
                ) : null}
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
