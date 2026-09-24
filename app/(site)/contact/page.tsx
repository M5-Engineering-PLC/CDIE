// Lucid: Contact > Contact Form, Map, FAQs. Copy: CONTACT.
/*
  Blueprint section 6, decision C-01 of 2026-09-11: someone clicking Contact is
  trying to contact CDIE, so the form comes first and the phone and email sit
  below it. The separate enquiry-selection step is gone; the reason is a
  dropdown, prefilled from ?topic= so "Ask about MDI" opens the right category.

  The map slot stays empty until the address conflict, fork fk3, is answered.
*/

import type { Metadata } from "next";

import { FaqList } from "@/components/blocks/FaqList";
import { EnquiryForm } from "@/components/sections/EnquiryForm";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { contactFaqs, contactIntro, defaultTopicId, enquiryTopics, form, visit } from "@/content/contact";
import { contact } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: contactIntro.standfirst,
  path: "/contact",
});

export default async function ContactPage(props: PageProps<"/contact">) {
  const query = await props.searchParams;
  const requested = typeof query.topic === "string" ? query.topic : undefined;
  const topicId = enquiryTopics.some((topic) => topic.id === requested)
    ? (requested as string)
    : defaultTopicId;

  return (
    <>
      <PageHero
        /* Enhancements 2026-09-22: "embed map on contact us page hero", then
           "use open streetmap". The marker is the Graduate School Building,
           Kenyatta University, the point the team's Google Maps listing gives. */
        map={{
          src: "https://www.openstreetmap.org/export/embed.html?bbox=36.9238%2C-1.1867%2C36.9318%2C-1.1808&layer=mapnik&marker=-1.183746%2C36.927809",
          title: "OpenStreetMap showing CDIE at the Graduate School Building, Kenyatta University",
          href: "https://www.openstreetmap.org/?mlat=-1.183746&mlon=36.927809#map=17/-1.183746/36.927809",
        }}
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

      <Section tone="surface" eyebrow="Other ways to reach us" title="Reach the team for any enquiries.">
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

      {/* FAQ vetting page, 23 September 2026: the question classified to Contact. */}
      <Section eyebrow="FAQs" title="Before you write.">
        <FaqList items={[...contactFaqs]} />
      </Section>

      <Section eyebrow="Visit us" title={visit.headline}>
        <p className="max-w-[54ch] text-lead leading-relaxed text-ink-2">{contact.campus}</p>
        <p className="mt-4 max-w-[54ch] text-lead leading-relaxed text-ink">
          {contact.beforeYouTravel}
        </p>
      </Section>
    </>
  );
}
