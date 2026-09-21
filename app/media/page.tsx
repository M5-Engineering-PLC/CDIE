// Lucid: Media > Newsletters, LinkedIn, and the pointer to programme events.
// Copy: MEDIA. Newsletters open the published issue in a new tab.

import type { Metadata } from "next";

import { EventGantt, type GanttEvent } from "@/components/blocks/EventGantt";
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
import { events, eventsCopy } from "@/content/programmes";
import { SHOW_SAMPLE_CONTENT, sampleEvents, sampleNewsletters } from "@/content/samples";
import { getLinkedInFeed, isStale, linkedInCopy, RECENT_POSTS } from "@/lib/linkedin";

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

/*
  Change request 2026-09-21, section 5: the events calendar leads the page.

  Programmes still owns every event record; this is a second view of the same
  list, so the two cannot drift. The list is empty by policy — content/
  programmes.ts refuses to invent an event, and no confirmed record has been
  supplied — so what ships today is the empty state. Sample bars render behind
  SHOW_SAMPLE_CONTENT purely so the band can be reviewed, flagged as sample
  above, exactly as the events band on Programmes already does.

  See docs/BUILD_PLAN.md section 3.2 for why the calendar could not be
  populated from the CDIE LinkedIn account in this pass.
*/
const calendarEvents: GanttEvent[] = events.map((event) => ({
  id: event.id,
  title: event.title,
  start: event.start,
  end: event.end,
  venue: event.venue,
}));

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
  const recent = feed.posts.slice(0, RECENT_POSTS);

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
        <Button href="#events">See what is on</Button>
        <Button href="#community" tone="outline">
          Follow our updates
        </Button>
      </PageHero>

      <Section
        id="events"
        eyebrow="Events"
        title={eventsCopy.headline}
        standfirst={eventsCopy.standfirst}
      >
        {calendarEvents.length === 0 && !SHOW_SAMPLE_CONTENT ? (
          <div className="border border-dashed border-line bg-surface p-6 md:p-8">
            <p className="max-w-[52ch] text-lead text-ink-2">{eventsCopy.empty}</p>
            <div className="mt-5">
              <Button href="/contact?topic=events" tone="outline">
                Ask what is planned
              </Button>
            </div>
          </div>
        ) : (
          <>
            {calendarEvents.length === 0 ? <SampleNotice what="events" /> : null}
            <EventGantt items={calendarEvents.length === 0 ? sampleEvents : calendarEvents} />
          </>
        )}
      </Section>

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
          posts={recent}
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

      {/*
        The calendar above is the view; registration and the full record live on
        Programmes, which owns them. This is the hand-off, not a second listing.
      */}
      <Section eyebrow="Taking part" title={eventsPointer.headline}>
        <p className="trim-mobile max-w-[58ch] text-lead leading-relaxed text-ink-2">{eventsPointer.body}</p>
        <div className="mt-6">
          <Button href={eventsPointer.action.href}>{eventsPointer.action.label}</Button>
        </div>
      </Section>
    </>
  );
}
