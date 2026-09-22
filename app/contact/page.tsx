// Lucid: Contact > Contact Form, Map, FAQs. Copy: CONTACT.
/*
  Blueprint section 6, decision C-01 of 2026-09-11: someone clicking Contact is
  trying to contact CDIE, so the form comes first and the phone and email sit
  below it. The separate enquiry-selection step is gone; the reason is a
  dropdown, prefilled from ?topic= so "Ask about MDI" opens the right category.

  The map slot stays empty until the address conflict, fork fk3, is answered.
*/

import type { Metadata } from "next";

import { Pending } from "@/components/primitives/Pending";
import { EnquiryForm } from "@/components/sections/EnquiryForm";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { contactIntro, defaultTopicId, enquiryTopics, form, visit } from "@/content/contact";
import { contact } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: contactIntro.standfirst,
};

export default async function ContactPage(props: PageProps<"/contact">) {
  const query = await props.searchParams;
  const requested = typeof query.topic === "string" ? query.topic : undefined;
  const topicId = enquiryTopics.some((topic) => topic.id === requested)
    ? (requested as string)
    : defaultTopicId;

  return (
    <>
      <PageHero
        image={{ src: "/images/service-design-1.jpg", alt: "Empty design workstations in the CDIE studio" }}
        eyebrow="Contact"
        headline={contactIntro.headline}
        standfirst={contactIntro.standfirst}
      />

      <Section eyebrow="Send a message" title={form.heading}>
        <EnquiryForm
          topics={[...enquiryTopics]}
          defaultTopic={topicId}
          labels={form.fields}
          messagePrompt={form.messagePrompt}
          submit={form.submit}
          success={form.success}
          error={form.error}
          unavailable={form.unavailable}
          email={contact.email}
        />
      </Section>

      <Section tone="surface" eyebrow="Other ways to reach us" title="Email and phone reach the same team.">
        <dl className="grid gap-px bg-line md:grid-cols-3">
          <div className="bg-raise p-6">
            <dt className="kicker">Email</dt>
            <dd className="mt-2 text-lead">
              <a href={`mailto:${contact.email}`} className="text-brand hover:text-brand-live">
                {contact.email}
              </a>
            </dd>
          </div>
          <div className="bg-raise p-6">
            <dt className="kicker">Phone</dt>
            <dd className="mt-2 text-lead">
              <a href={contact.phoneHref} className="text-brand hover:text-brand-live">
                {contact.phone}
              </a>
            </dd>
          </div>
          <div className="bg-raise p-6">
            <dt className="kicker">Team availability</dt>
            <dd className="mt-2 text-lead text-ink-2">{contact.availability}</dd>
          </div>
        </dl>
      </Section>

      <Section eyebrow="Visit us" title={visit.headline}>
        <p className="max-w-[54ch] text-lead leading-relaxed text-ink-2">{contact.campus}</p>
        <p className="mt-4 max-w-[54ch] text-lead leading-relaxed text-ink">
          {contact.beforeYouTravel}
        </p>
        <div className="mt-8 max-w-[54ch]">
          <Pending items={visit.pending} label="Ask us before you travel" />
        </div>
      </Section>
    </>
  );
}
