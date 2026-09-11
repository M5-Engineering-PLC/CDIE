// Lucid: Contact > Contact Form, Map, FAQs. Copy: CONTACT.
// A task page: every main choice stays visible. The topic cards are static.
// The map slot stays empty until the address conflict, F-04, is answered.

import type { Metadata } from "next";

import { CardGrid } from "@/components/blocks/Card";
import { Pending } from "@/components/primitives/Pending";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import {
  contactIntro,
  defaultTopicId,
  enquiryTopics,
  form,
  topicCards,
  visit,
} from "@/content/contact";
import { contact } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: contactIntro.standfirst,
};

export default async function ContactPage(props: PageProps<"/contact">) {
  const query = await props.searchParams;
  const requested = typeof query.topic === "string" ? query.topic : undefined;
  const topicId = enquiryTopics.some((topic) => topic.id === requested)
    ? requested
    : defaultTopicId;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        headline={contactIntro.headline}
        standfirst={contactIntro.standfirst}
      />

      <Section eyebrow="Reach us" title="Email and phone reach the same team.">
        <dl className="grid gap-px bg-line md:grid-cols-3">
          <div className="bg-surface p-6">
            <dt className="kicker">Email</dt>
            <dd className="mt-2 text-lead">
              <a href={`mailto:${contact.email}`} className="text-brand">
                {contact.email}
              </a>
            </dd>
          </div>
          <div className="bg-surface p-6">
            <dt className="kicker">Phone</dt>
            <dd className="mt-2 text-lead">
              <a href={contact.phoneHref} className="text-brand">
                {contact.phone}
              </a>
            </dd>
          </div>
          <div className="bg-surface p-6">
            <dt className="kicker">Team availability</dt>
            <dd className="mt-2 text-lead text-ink-2">{contact.availability}</dd>
          </div>
        </dl>
      </Section>

      <Section tone="surface" eyebrow="Choose a reason" title="What would you like to ask?">
        <CardGrid cards={topicCards} tone="raise" />
      </Section>

      <Section eyebrow="Send a message" title={form.heading}>
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
          <form className="flex flex-col gap-5" aria-describedby="form-state">
            <fieldset disabled={!form.enabled} className="flex flex-col gap-5 border-0 p-0">
              <label className="flex flex-col gap-2">
                <span className="kicker">{form.fields.name}</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  className="rounded-edge border border-line bg-surface px-3 py-2.5 text-body disabled:opacity-60"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="kicker">{form.fields.email}</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="rounded-edge border border-line bg-surface px-3 py-2.5 text-body disabled:opacity-60"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="kicker">{form.fields.reason}</span>
                <select
                  name="reason"
                  defaultValue={topicId}
                  className="rounded-edge border border-line bg-surface px-3 py-2.5 text-body disabled:opacity-60"
                >
                  {enquiryTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="kicker">{form.fields.message}</span>
                <textarea
                  name="message"
                  rows={6}
                  placeholder={form.messagePrompt}
                  className="rounded-edge border border-line bg-surface px-3 py-2.5 text-body disabled:opacity-60"
                />
              </label>
              <button
                type="submit"
                className="self-start rounded-edge bg-brand px-4 py-2.5 text-body font-medium text-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                {form.submit}
              </button>
            </fieldset>
          </form>

          <aside id="form-state" className="flex flex-col gap-4">
            {!form.enabled ? (
              <p className="border-l-2 border-flag/60 bg-flag-wash/50 px-4 py-3 text-body text-ink-2">
                {form.disabledNote}
              </p>
            ) : null}
            <p className="text-fine text-ink-3">
              The form turns on once a test enquiry has reached the intended mailbox. Until
              then it would take a message and drop it, which is worse than saying so.
            </p>
          </aside>
        </div>
      </Section>

      <Section tone="surface" eyebrow="Visit us" title={visit.headline}>
        <p className="max-w-[54ch] text-lead leading-relaxed text-ink-2">{contact.campus}</p>
        <p className="mt-4 max-w-[54ch] text-lead leading-relaxed text-ink">
          {contact.beforeYouTravel}
        </p>
        <div className="mt-8 max-w-[54ch]">
          <Pending
            items={visit.pending}
            lead="The published sources disagree on the building, so nothing is shown until it is confirmed:"
          />
        </div>
      </Section>
    </>
  );
}
