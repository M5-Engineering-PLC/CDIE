// Lucid: Home. Copy: HOME.
// Fixed order: five-destination carousel, three cards, second carousel, footer.
// Nothing else. The three cards and the lower carousel already carry the jobs a
// studio teaser, a programme strip and a newsletter strip would duplicate.

import { CardGrid } from "@/components/blocks/Card";
import { Button } from "@/components/primitives/Button";
import { Carousel } from "@/components/sections/Carousel";
import { Section } from "@/components/sections/Section";
import { destinationSlides, featurePanels, homeHero, programmeCards } from "@/content/home";
import type { CarouselSlide } from "@/content/types";

function DestinationSlide({ slide }: { slide: CarouselSlide }) {
  return (
    <article className="flex min-h-[22rem] flex-col justify-end gap-4 border border-line bg-slate p-8 text-paper md:min-h-[26rem] md:p-12">
      <p className="font-mono text-fine uppercase tracking-[0.13em] text-paper/70">
        {slide.eyebrow}
      </p>
      <h3 className="display max-w-[16ch] text-head text-paper md:text-hero">{slide.title}</h3>
      <p className="max-w-[52ch] text-lead leading-relaxed text-paper/85">{slide.line}</p>
      <div className="mt-2">
        <Button
          href={slide.action.href}
          className="border-paper/30 bg-paper text-ink hover:border-paper hover:bg-surface"
        >
          {slide.action.label}
        </Button>
      </div>
    </article>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="shell py-12 md:py-16">
          <h1 className="display max-w-[20ch] text-head md:text-hero">{homeHero.headline}</h1>
          <p className="mt-5 max-w-[58ch] text-lead leading-relaxed text-ink-2">
            {homeHero.standfirst}
          </p>
          <div className="mt-7">
            <Button href={homeHero.primary.href}>{homeHero.primary.label}</Button>
          </div>

          <div className="mt-12">
            <Carousel
              label="site sections"
              slideLabels={destinationSlides.map((slide) => slide.eyebrow)}
              slides={destinationSlides.map((slide) => (
                <DestinationSlide key={slide.id} slide={slide} />
              ))}
            />
          </div>
        </div>
      </section>

      <Section
        eyebrow="Start here"
        title="Three ways in."
        standfirst="The learning model, the graduate pathway, and the room where the work happens."
      >
        <CardGrid cards={programmeCards} />
      </Section>

      <Section
        tone="surface"
        eyebrow="Latest from CDIE"
        title="Meet the people, projects and conversations shaping life at the centre."
      >
        <Carousel
          label="people, events and media"
          slideLabels={featurePanels.map((panel) => panel.eyebrow ?? panel.title)}
          slides={featurePanels.map((panel) => (
            <article
              key={panel.id}
              className="flex min-h-[15rem] flex-col gap-4 border border-line bg-raise p-8"
            >
              <p className="kicker">{panel.eyebrow}</p>
              <h3 className="display max-w-[22ch] text-title">{panel.title}</h3>
              <p className="max-w-[56ch] text-body leading-relaxed text-ink-2">{panel.summary}</p>
              <div className="mt-auto pt-2">
                <Button href={panel.action.href} tone="quiet">
                  {panel.action.label}
                </Button>
              </div>
            </article>
          ))}
        />
      </Section>
    </>
  );
}
