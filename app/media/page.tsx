// Lucid: Media > Newsletters, LinkedIn, and the pointer to programme events.
// Copy: MEDIA. Newsletters open the published issue in a new tab.

import type { Metadata } from "next";

import { EventGantt, type GanttEvent } from "@/components/blocks/EventGantt";
import { FaqList } from "@/components/blocks/FaqList";
import { NewsletterGrid, type NewsletterCardItem } from "@/components/blocks/NewsletterGrid";
import { Button } from "@/components/primitives/Button";
import { LinkedInCarousel } from "@/components/sections/LinkedInCarousel";
import { NewsletterSignup } from "@/components/sections/NewsletterSignup";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import {
  mediaItems,
  mediaFaqs,
  mediaLanding,
  newslettersCopy,
} from "@/content/media";
import { events, eventsCopy } from "@/content/programmes";
import { listItems } from "@/lib/admin/store";
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
  The events calendar leads the page. Programmes owns every event record; this
  is a second view of the same list, so the two cannot drift.
*/
const programmeEvents: GanttEvent[] = events.map((event) => ({
  id: event.id,
  title: event.title,
  start: event.start,
  end: event.end,
  kind: event.kind,
  estimated: event.estimated,
  link: event.link,
}));

const shiftMonths = (iso: string, months: number) => {
  const date = new Date(iso);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
};

export default async function MediaPage() {
  /* Enhancements 2026-09-22: one timeline holds programme events plus the
     events, upcoming activities and media items added in the admin dashboard. */
  const [added, activities, media, addedIssues] = await Promise.all([
    listItems("events"),
    listItems("activities"),
    listItems("media"),
    listItems("newsletters"),
  ]);
  const calendarEvents: GanttEvent[] = [
    ...programmeEvents,
    ...added.map((item) => ({ id: item.id, title: item.title, start: item.start, end: item.end, kind: "Event" })),
    ...activities.map((item) => ({ id: item.id, title: item.title, start: item.start, end: item.end, kind: "Activity" })),
    ...media.map((item) => ({ id: item.id, title: item.title, start: item.date || item.createdAt.slice(0, 10), kind: "Media", link: item.link })),
  ];
  const today = new Date().toISOString().slice(0, 10);

  const newsletters = mediaItems.filter((item) => item.kind === "newsletter");
  const newsletterCards: NewsletterCardItem[] = [
    ...addedIssues.map((item) => ({
      id: item.id,
      issue: item.issue,
      title: item.title,
      summary: item.summary,
      image: item.image,
      alt: `Cover of ${item.issue}`,
      href: item.pdf,
    })),
    ...newsletters.map((item) => ({
    id: item.id,
    issue: item.issue ?? item.date ?? "Issue",
    title: item.title,
    summary: item.summary,
    image: item.cover?.src ?? "/images/hero-workshop-2.jpg",
    alt: item.cover?.alt ?? item.title,
    href: item.external,
  })),
  ];
  const feed = await getLinkedInFeed();
  const recent = feed.posts.slice(0, RECENT_POSTS);

  return (
    <>
      <PageHero
        eyebrow="Media"
        headline={mediaLanding.headline}
        standfirst={mediaLanding.standfirst}
        image={{
          src: "/images/cdie-mdi-cohort-1-semester-one-celebration-speech.jpg",
          alt: "Speaker at a podium between Invention Education banners",
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
        {calendarEvents.length === 0 ? (
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
            <EventGantt items={calendarEvents} from={shiftMonths(today, -6)} to={shiftMonths(today, 3)} today={today} />
          </>
        )}
      </Section>

      <Section
        id="newsletters"
        eyebrow="Newsletters"
        title={newslettersCopy.headline}
        standfirst={newslettersCopy.standfirst}
      >
                <div className="mb-8">
          <NewsletterSignup />
        </div>
        {newsletterCards.length === 0 ? (
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
            <NewsletterGrid items={newsletterCards} />
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

    </>
  );
}
