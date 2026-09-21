// Lucid: Media > Newsletters, LinkedIn, and the pointer to programme events.
// Copy: MEDIA. Newsletters open the published issue in a new tab.

import type { Metadata } from "next";

import { FaqList } from "@/components/blocks/FaqList";
import { NewsletterGrid, type NewsletterCardItem } from "@/components/blocks/NewsletterGrid";
import { SampleNotice } from "@/components/blocks/SampleNotice";
import { Button } from "@/components/primitives/Button";
import { LinkedInCarousel } from "@/components/sections/LinkedInCarousel";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import {
  eventsPointer,
  mediaItems,
  mediaFaqs,
  mediaLanding,
  newslettersCopy,
} from "@/content/media";
import { SHOW_SAMPLE_CONTENT, sampleNewsletters } from "@/content/samples";
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
  const newsletterCards: NewsletterCardItem[] = newsletters.map((item) => ({
    id: item.id,
    issue: item.date ?? "Issue",
    title: item.title,
    summary: item.summary,
    image: item.cover?.src ?? "/images/hero-workshop-2.jpg",
    alt: item.cover?.alt ?? item.title,
    href: item.external,
  }));
  const feed = await getLinkedInFeed();

  return (
    <>
      <PageHero
        eyebrow="Media"
        headline={mediaLanding.headline}
        standfirst={mediaLanding.standfirst}
        image={{
          src: "/images/hero-workshop-2.jpg",
          alt: "A CDIE cohort at the centre",
        }}
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
        {/*
          Change request 2026-09-13, section 5.2. mediaItems is empty by policy,
          so sample issues render behind a flag purely to review the card. The
          real path below runs unchanged the moment issues are published.
        */}
        {newsletters.length === 0 && !SHOW_SAMPLE_CONTENT ? (
          <div className="border border-dashed border-line bg-surface p-8">
            <p className="max-w-[52ch] text-lead text-ink-2">{newslettersCopy.empty}</p>
            <div className="mt-5">
              <Button href="/contact?topic=general" tone="outline">
                Ask for the latest issue
              </Button>
            </div>
          </div>
        ) : (
          <>
            {newsletters.length === 0 ? <SampleNotice what="newsletter issues" /> : null}
            <NewsletterGrid
              items={newsletters.length === 0 ? sampleNewsletters : newsletterCards}
            />
          </>
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

      {mediaFaqs.length > 0 ? (
        <Section eyebrow="Questions" title="Before you ask.">
          <FaqList items={[...mediaFaqs]} />
        </Section>
      ) : null}

      <Section eyebrow="Events" title={eventsPointer.headline}>
        <p className="max-w-[58ch] text-lead leading-relaxed text-ink-2">{eventsPointer.body}</p>
        <div className="mt-6">
          <Button href={eventsPointer.action.href}>{eventsPointer.action.label}</Button>
        </div>
      </Section>
    </>
  );
}
