// Lucid: Programmes. Copy: PROGRAMMES.
// Programmes owns every event record. Home and Media render views of them.

import type { Metadata } from "next";

import { Chip } from "@/components/primitives/Kicker";
import { Button } from "@/components/primitives/Button";
import { EventGrid, type EventCardItem } from "@/components/blocks/EventGrid";
import { FaqList } from "@/components/blocks/FaqList";
import { PlaceholderPhoto } from "@/components/blocks/PlaceholderPhoto";
import { SampleNotice } from "@/components/blocks/SampleNotice";
import { ProgrammeHeroCarousel, type ProgrammeHeroSlide } from "@/components/sections/ProgrammeHeroCarousel";
import { Section } from "@/components/sections/Section";
import { SnakeRoute } from "@/components/sections/SnakeRoute";
import {
  events,
  eventsCopy,
  learningStages,
  opportunities,
  programmeFaqs,
  programmesLanding,
} from "@/content/programmes";
import { SHOW_SAMPLE_CONTENT, sampleEvents } from "@/content/samples";

/*
  Real events map into the card shape. The collection is empty today, so this
  is the path that runs the moment confirmed records arrive.
*/
const eventCards: EventCardItem[] = events.map((event) => ({
  id: event.id,
  title: event.title,
  start: event.start,
  venue: event.venue ?? "Venue to be confirmed",
  summary: event.registration?.label ?? "",
  image: "/images/story-1.jpg",
  alt: event.title,
}));

/*
  Change request 2026-09-13, section 4.1, revised: the carousel is the first
  section. The standing page hero was removed, so each slide's title is the
  page h1, as it already is on Home. Slides are built from the same
  opportunities the page lists below, so the two can never drift apart.

  Change request 2026-09-21, second pass: "change the carousel titles to
  Invention education, MSc MDI, Design challenges, Catalyst grants, Training
  and masterclasses". The tab strip reads a slide's eyebrow, so the eyebrow is
  now the opportunity's carouselTitle rather than its kind. The kind is not
  lost: it still labels the programme on its row below.
*/
const heroSlides: ProgrammeHeroSlide[] = opportunities
  .filter((opportunity) => opportunity.image)
  .map((opportunity) => ({
    id: opportunity.id,
    eyebrow: opportunity.carouselTitle,
    title: opportunity.title,
    summary: opportunity.summary,
    image: opportunity.image!.src,
    alt: opportunity.image!.alt,
    action: { label: `Explore ${opportunity.title}`, href: opportunity.href },
  }));

export const metadata: Metadata = {
  title: "Programmes",
  description: programmesLanding.standfirst,
};

export default function ProgrammesPage() {
  return (
    <>

      <ProgrammeHeroCarousel slides={heroSlides} />

      {/*
        Change request 2026-09-21, section 3: the four stages are stations on
        one route rather than four boxes side by side, so the order they run in
        is visible before a word is read.
      */}
      <Section
        eyebrow="How learning works"
        title="Understand the need, then build something you can test."
        standfirst="Four stages, in order. Each one is a habit you practise rather than a box you tick."
      >
        <SnakeRoute stages={learningStages} />
      </Section>

      <Section
        tone="surface"
        eyebrow="Opportunities"
        title="Find the one that fits where you are."
        standfirst="Each has its own page with what it asks of you and what to do next."
      >
        {/*
          Change request 2026-09-13, section 4.2. A three-up grid made five
          programmes read as one undifferentiated table. One row each, image
          beside the text, sides alternating: the picture gives each programme a
          face and the alternation stops the page becoming a rhythm of identical
          blocks. Photographs are placeholders until CDIE art-directs them.
        */}
        {/*
          Change request 2026-09-21, section 1. Five full-width rows made this
          the longest band on the site on a phone. It now scroll-snaps
          sideways there and keeps the alternating two-column rows from md.
        */}
        <ul className="rail -mx-gutter auto-cols-[85%] gap-4 px-gutter md:mx-0 md:flex md:flex-col md:gap-px md:overflow-visible md:bg-line md:px-0">
          {opportunities.map((opportunity, index) => (
            <li
              key={opportunity.id}
              className="grid items-stretch gap-px border border-line bg-line md:grid-cols-2 md:border-0"
            >
              {opportunity.image ? (
                <PlaceholderPhoto
                  src={opportunity.image.src}
                  alt={opportunity.image.alt}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`min-h-44 bg-raise md:min-h-64 ${
                    index % 2 === 1 ? "md:order-2" : ""
                  }`}
                />
              ) : null}
              <div className="flex flex-col gap-3 bg-raise p-6 md:p-10">
                <div className="flex items-center justify-between gap-3">
                  <p className="kicker">{opportunity.kind}</p>
                  <Chip status={opportunity.status} />
                </div>
                <h3 className="display text-title leading-snug">{opportunity.title}</h3>
                <p className="trim-mobile max-w-[52ch] text-body leading-relaxed text-ink-2">
                  {opportunity.summary}
                </p>
                <div className="mt-auto pt-4">
                  {/* Change request 2026-09-21, section 3: "instead of open ...,
                      just say read more/explore etc". */}
                  <Button href={opportunity.href} tone="quiet">
                    Read more
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="events"
        eyebrow="Events"
        title={eventsCopy.headline}
        standfirst={eventsCopy.standfirst}
      >
        {/*
          Change request 2026-09-13, section 4.3. The real list is empty by
          policy: content/programmes.ts refuses to invent an event. Sample cards
          render only so the band can be reviewed, and they are flagged as
          sample above. Turn SHOW_SAMPLE_CONTENT off to see what ships today.
        */}
        {events.length === 0 && !SHOW_SAMPLE_CONTENT ? (
          <div className="border border-dashed border-line bg-surface p-8">
            <p className="max-w-[52ch] text-lead text-ink-2">{eventsCopy.empty}</p>
            <div className="mt-5">
              <Button href="/contact?topic=events" tone="outline">
                Ask what is planned
              </Button>
            </div>
          </div>
        ) : (
          <>
            {events.length === 0 ? <SampleNotice what="events" /> : null}
            <EventGrid items={events.length === 0 ? sampleEvents : eventCards} />
            <div className="mt-8">
              <Button href="/contact?topic=events" tone="outline">
                Ask what is planned
              </Button>
            </div>
          </>
        )}
      </Section>

      {/*
        Change request 2026-09-21, second pass: "change questions secton to
        faqs, remove 'before you ask' subtitle". The band is FAQs and the
        questions stand on their own. "require manual input and confirmation
        for all faqs": FaqList publishes an answer only where content/types.ts
        records who confirmed it, so every question here currently carries the
        enquiry wording instead.
      */}
      <Section tone="surface" eyebrow="FAQs">
        <FaqList items={[...programmeFaqs]} enquiryHref="/contact?topic=admissions" />
        <div className="mt-8">
          <Button href="/contact?topic=admissions">Ask about the next intake</Button>
        </div>
      </Section>
    </>
  );
}
