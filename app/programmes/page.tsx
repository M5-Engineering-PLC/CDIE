// Lucid: Programmes. Copy: PROGRAMMES.
// Programmes owns every event record. Home and Media render views of them.

import type { Metadata } from "next";

import { Chip } from "@/components/primitives/Kicker";
import { Button } from "@/components/primitives/Button";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import {
  events,
  eventsCopy,
  learningStages,
  opportunities,
  programmeFaqs,
  programmesLanding,
} from "@/content/programmes";

export const metadata: Metadata = {
  title: "Programmes",
  description: programmesLanding.standfirst,
};

export default function ProgrammesPage() {
  return (
    <>
      <PageHero
        eyebrow="Programmes"
        headline={programmesLanding.headline}
        standfirst={programmesLanding.standfirst}
      >
        {programmesLanding.shortcuts.map((shortcut, index) => (
          <Button
            key={shortcut.href}
            href={shortcut.href}
            tone={index === 0 ? "solid" : "outline"}
          >
            {shortcut.label}
          </Button>
        ))}
      </PageHero>

      <Section
        eyebrow="How learning works"
        title="Understand the need, then build something you can test."
        standfirst="Four stages, in order. Each one is a habit you practise rather than a box you tick."
      >
        <ol className="grid gap-px bg-line md:grid-cols-2 lg:grid-cols-4">
          {learningStages.map((stage, index) => (
            <li key={stage.id} className="flex flex-col gap-3 bg-surface p-6">
              <span className="font-mono text-fine text-brand-live">
                Stage {index + 1} of {learningStages.length}
              </span>
              <h3 className="display text-sub leading-snug">{stage.title}</h3>
              <p className="text-body leading-relaxed text-ink-2">{stage.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        tone="surface"
        eyebrow="Opportunities"
        title="Find the one that fits where you are."
        standfirst="Each has its own page with what it asks of you and what to do next."
      >
        <ul className="grid gap-px bg-line md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opportunity) => (
            <li key={opportunity.id} className="flex flex-col gap-3 bg-raise p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="kicker">{opportunity.kind}</p>
                <Chip status={opportunity.status} />
              </div>
              <h3 className="display text-sub leading-snug">{opportunity.title}</h3>
              <p className="text-body leading-relaxed text-ink-2">{opportunity.summary}</p>
              <div className="mt-auto pt-2">
                <Button href={opportunity.href} tone="quiet">
                  Open {opportunity.title}
                </Button>
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
        {events.length === 0 ? (
          <div className="border border-dashed border-line bg-surface p-8">
            <p className="max-w-[52ch] text-lead text-ink-2">{eventsCopy.empty}</p>
            <div className="mt-5">
              <Button href="/contact?topic=events" tone="outline">
                Ask what is planned
              </Button>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-px bg-line">
            {events.map((event) => (
              <li
                key={event.id}
                className="grid gap-2 bg-surface p-5 md:grid-cols-[12rem_1fr] md:items-baseline"
              >
                <p className="font-mono text-fine tabular-nums text-ink-2">
                  {event.start}
                  {event.end ? ` – ${event.end}` : ""}
                </p>
                <div>
                  <h3 className="text-lead text-ink">{event.title}</h3>
                  {event.venue ? <p className="text-body text-ink-2">{event.venue}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section tone="surface" eyebrow="Questions" title="Before you enquire.">
        <dl className="flex flex-col gap-px bg-line">
          {programmeFaqs.map((faq) => (
            <div key={faq.id} className="bg-raise p-6">
              <dt className="text-lead text-ink">{faq.question}</dt>
              <dd className="mt-2 max-w-[64ch] text-body leading-relaxed text-ink-2">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-8">
          <Button href="/contact?topic=admissions">Ask about the next intake</Button>
        </div>
      </Section>
    </>
  );
}
