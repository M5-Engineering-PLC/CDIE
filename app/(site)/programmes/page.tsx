// Lucid: Programmes. Copy: PROGRAMMES.
// Programmes owns every event record. Home and Media render views of them.

import type { Metadata } from "next";

import { Chip } from "@/components/primitives/Kicker";
import { Button } from "@/components/primitives/Button";
import { EventGrid, type EventCardItem } from "@/components/blocks/EventGrid";
import { FaqList } from "@/components/blocks/FaqList";
import { PlaceholderPhoto } from "@/components/blocks/PlaceholderPhoto";
import { AutoRail } from "@/components/sections/AutoRail";
import { ProgrammeHeroCarousel, type ProgrammeHeroSlide } from "@/components/sections/ProgrammeHeroCarousel";
import { Section } from "@/components/sections/Section";
import { StageScroll, type ScrollStage } from "@/components/sections/StageScroll";
import {
  events,
  eventsCopy,
  learningStages,
  opportunities,
  programmeFaqs,
  programmesLanding,
} from "@/content/programmes";

/*
  Enhancements 2026-09-22: "on programmes just have the most recent 3 events".
  Only events with their own photograph qualify, so no card has an empty frame;
  the full list is the Media calendar.
*/
const eventCards: EventCardItem[] = events
  .filter((event) => event.image)
  .sort((a, b) => Date.parse(b.end ?? b.start) - Date.parse(a.end ?? a.start))
  .slice(0, 3)
  .map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    venue: event.kind ?? "",
    summary: "",
    image: event.image as string,
    alt: event.title,
    href: event.link,
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
/* Image matching sheet 2026-09-22, Programs P1-P5: the carousel has its own
   photographs. Catalyst grants has none yet, so it has no slide. */
const heroImages: Record<string, { src: string; alt: string }> = {
  "invention-education": { src: "/images/cdie-summer-program-clinical-immersion-group.jpg", alt: "Summer program participants in scrubs outside a hospital" },
  mdi: { src: "/images/cdie-mdi-cohort-1-semester-one-celebration-group.jpg", alt: "MSc cohort and guests at an evening celebration" },
  "design-challenge": { src: "/images/cdie-design-challenge-awards.jpg", alt: "Design challenge winners receiving their award" },
  training: { src: "/images/cdie-metalwork-welding.jpg", alt: "Trainee welding a frame while others watch" },
};

const heroSlides: ProgrammeHeroSlide[] = opportunities
  .filter((opportunity) => heroImages[opportunity.id])
  .map((opportunity) => ({
    id: opportunity.id,
    eyebrow: opportunity.carouselTitle,
    title: opportunity.title,
    summary: opportunity.summary,
    image: heroImages[opportunity.id].src,
    alt: heroImages[opportunity.id].alt,
    action: { label: `Explore ${opportunity.title}`, href: opportunity.href },
  }));

/* Final pass 2026-09-23: each stage carries a CDIE photograph of that stage
   being practised, all of them already captioned elsewhere on the site. */
const stageImages: Record<string, { src: string; alt: string }> = {
  understand: { src: "/images/cdie-summer-program-needs-filtering.jpg", alt: "Participants working through needs filtering at tables" },
  develop: { src: "/images/cdie-design-challenge-pitch.jpg", alt: "Design challenge team presenting a slide to an audience" },
  build: { src: "/images/cdie-summer-program-cnc-class-01.jpg", alt: "Participant operating a CNC machine" },
  explain: { src: "/images/cdie-mdi-cohort-1-semester-one-showcase.jpg", alt: "MDI student presenting at the end of semester showcase" },
};

const scrollStages: ScrollStage[] = learningStages.map((stage) => ({ ...stage, image: stageImages[stage.id] }));

/* Final pass 2026-09-23: "use only 5 relevant FAQs on each page". The full
   vetted list stays in content/programmes.ts; this page asks the five that
   cover every programme on it rather than the MSc alone. */
const PAGE_FAQS = ["apply", "fees", "grants", "challenge", "training"];
const pageFaqs = PAGE_FAQS.flatMap((id) => programmeFaqs.filter((faq) => faq.id === id));

export const metadata: Metadata = {
  title: "Programmes",
  description: programmesLanding.standfirst,
};

export default function ProgrammesPage() {
  return (
    <>

      <ProgrammeHeroCarousel slides={heroSlides} />

      {/*
        Final pass 2026-09-23: the four stages pin and play one at a time as the
        reader scrolls, then the page carries on. It replaces the snake route,
        which showed the order but not the movement between stages.
      */}
      <StageScroll
        eyebrow="How learning works"
        title="Understand the need, then build something you can test."
        standfirst="Four stages, in order. Each one is a habit you practise rather than a box you tick."
        stages={scrollStages}
      />

      <Section
        tone="surface"
        eyebrow="Opportunities"
        title="Find the one that fits where you are."
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
        <AutoRail className="rail -mx-gutter auto-cols-[85%] gap-4 px-gutter md:mx-0 md:flex md:flex-col md:gap-px md:overflow-visible md:bg-line md:px-0">
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
                <p className="max-w-[52ch] text-body leading-relaxed text-ink-2">
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
        </AutoRail>
      </Section>

      <Section
        id="events"
        eyebrow="Events"
        title={eventsCopy.headline}
        standfirst={eventsCopy.standfirst}
      >
                {eventCards.length === 0 ? (
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
            <EventGrid items={eventCards} />
            <div className="mt-8">
              <Button href="/media#events" tone="outline">
                See the full events calendar
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
        <FaqList items={pageFaqs} enquiryHref="/contact?topic=admissions" />
        <div className="mt-8">
          <Button href="/contact?topic=admissions">Ask about the next intake</Button>
        </div>
      </Section>
    </>
  );
}
