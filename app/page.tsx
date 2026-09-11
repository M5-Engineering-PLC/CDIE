// Lucid: Home. Copy: HOME.
/*
  Decision R1, 2026-09-11: a short hero, the three programmes, what CDIE is, the
  studio capabilities, then the latest posts. The old five-destination carousel
  is gone; it restated the navigation bar and both reviewers said so.

  The latest section renders only when there is something in it. No partners
  strip exists, because no source names a partner.
*/

import type { Metadata } from "next";

import { Card } from "@/components/blocks/Card";
import { Button } from "@/components/primitives/Button";
import { CardRail } from "@/components/sections/CardRail";
import { LinkedInCarousel } from "@/components/sections/LinkedInCarousel";
import { Section } from "@/components/sections/Section";
import { defineCdie, homeHero, latestCopy, programmeCards, servicesCopy } from "@/content/home";
import { capabilities } from "@/content/studio";
import type { Card as CardRecord } from "@/content/types";
import { getLinkedInFeed, isStale, linkedInCopy } from "@/lib/linkedin";

export const metadata: Metadata = {
  description: homeHero.standfirst,
};

// Keeps the latest section in step with the Media page's read of the same feed.
export const revalidate = 600;

const serviceCards: CardRecord[] = capabilities.map((capability) => ({
  id: capability.id,
  eyebrow: capability.name,
  title: capability.headline,
  summary: capability.body,
  action: {
    label: `Open ${capability.name}`,
    href: `/design-studio?service=${capability.id}`,
    live: true,
  },
}));

export default async function HomePage() {
  const feed = await getLinkedInFeed();
  const hasLatest = feed.posts.length > 0 && !isStale(feed.lastSyncedAt);

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="shell py-12 md:py-16">
          <h1 className="display max-w-[18ch] text-head md:text-hero">{homeHero.headline}</h1>
          <p className="mt-5 max-w-[54ch] text-lead leading-relaxed text-ink-2">
            {homeHero.standfirst}
          </p>
          <div className="mt-7">
            <Button href={homeHero.primary.href}>{homeHero.primary.label}</Button>
          </div>
        </div>
      </section>

      <Section eyebrow="Start here" title="Three ways in.">
        <CardRail label="programmes">
          {programmeCards.map((card) => (
            <li key={card.id} className="flex">
              <Card card={card} />
            </li>
          ))}
        </CardRail>
      </Section>

      <Section tone="surface" eyebrow={defineCdie.eyebrow} title={defineCdie.headline}>
        <p className="max-w-[62ch] text-lead leading-relaxed text-ink-2">{defineCdie.body}</p>

        <ul className="mt-10 grid gap-px bg-line md:grid-cols-3">
          {defineCdie.triad.map((item) => (
            <li key={item.id} className="flex flex-col gap-2 bg-raise p-6">
              <h3 className="display text-sub text-brand">{item.title}</h3>
              <p className="text-body leading-relaxed text-ink-2">{item.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Button href={defineCdie.action.href} tone="outline">
            {defineCdie.action.label}
          </Button>
        </div>
      </Section>

      <Section
        eyebrow={servicesCopy.eyebrow}
        title={servicesCopy.headline}
        standfirst={servicesCopy.standfirst}
      >
        <CardRail label="studio capabilities" columns={4}>
          {serviceCards.map((card) => (
            <li key={card.id} className="flex">
              <Card card={card} tone="surface" />
            </li>
          ))}
        </CardRail>
      </Section>

      {hasLatest ? (
        <Section tone="surface" eyebrow={latestCopy.eyebrow} title={latestCopy.headline}>
          <LinkedInCarousel
            posts={feed.posts}
            stale={false}
            fallback={linkedInCopy.fallback}
            pageUrl={linkedInCopy.pageUrl}
            privacy={linkedInCopy.privacy}
          />
        </Section>
      ) : null}
    </>
  );
}
