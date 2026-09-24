// Lucid: Contact > Contact Form, Map, FAQs.
// Copy: CONTACT.
// The map slot exists but stays empty until Lucid fork fk3, the address
// conflict, is answered. Build plan decision D1.

import type { Card, EnquiryTopic, Faq } from "./types";

export const contactIntro = {
  headline: "Let’s talk about your next step.",
  standfirst:
    "Have a question about a programme, a studio project or working with CDIE? Tell us a little about what you need so we can direct your enquiry.",
} as const;

/*
  Review of 11 September, item R11: the enquiry button on a programme page
  should arrive at the form with that programme already chosen, so a reader
  asking about catalyst grants does not have to reclassify their own question.
  Every programme therefore owns a topic. The four general topics stay for the
  people who arrive at Contact directly.

  tests/editorial-redesign.test.mjs asserts that every programme's topic exists
  in this list. Before this round catalyst grants pointed at a topic id that had
  never existed and the form silently fell back to a general enquiry.
*/
export const enquiryTopics: EnquiryTopic[] = [
  { id: "admissions", label: "Programmes and admissions" },
  { id: "invention-education", label: "Invention Education" },
  { id: "design-challenge", label: "Design Challenges" },
  { id: "catalyst-grants", label: "Catalyst grants" },
  { id: "training", label: "Masterclasses and training" },
  { id: "studio", label: "Studio access and project support" },
  { id: "events", label: "Events and training" },
  { id: "partnerships", label: "Partnerships" },
  { id: "general", label: "General enquiry" },
];

export const defaultTopicId = "general";

/*
  Kept for any page that wants to point someone at a prefilled enquiry. The
  Contact page itself no longer renders these: blueprint section 6, decision
  C-01, removed the separate enquiry-selection step in favour of the dropdown
  inside the form.
*/
export const topicCards: Card[] = [
  {
    id: "admissions",
    eyebrow: "Programme enquiry",
    title: "Ask about eligibility, intake or learning pathways.",
    summary: "For prospective students and anyone weighing up the MDI pathway.",
    action: { label: "Prefill programme topic", href: "/contact?topic=admissions", live: true },
  },
  {
    id: "studio",
    eyebrow: "Studio enquiry",
    title: "Describe your project and the support you need.",
    summary: "For project work, equipment questions and studio access.",
    action: { label: "Prefill studio topic", href: "/contact?topic=studio", live: true },
  },
  {
    id: "partnerships",
    eyebrow: "Partnership enquiry",
    title: "Tell the team how you would like to contribute.",
    summary: "For mentors, clinicians, industry partners and supporters.",
    action: { label: "Prefill partnerships topic", href: "/contact?topic=partnerships", live: true },
  },
];

export const form = {
  heading: "What would you like to ask?",
  fields: {
    name: "Your name",
    email: "Email address",
    reason: "Reason for contacting us",
    message: "Your message",
  },
  messagePrompt:
    "Tell us briefly what you need help with. For a project enquiry, include the idea and the support you are looking for.",
  submit: "Send enquiry",
  success:
    "Thank you. Your enquiry is on its way to the CDIE team, and they will reply to the address you gave.",
  error: "Your message could not be sent just now. Please try again, or email us at",
  /*
    Shown when the mail credential is not set on the deployment. It is not an
    apology for a bug: it is the honest state of a form that cannot deliver, and
    it hands the reader the address that does work. Decision C-01, 2026-09-11.
  */
  unavailable: "The form cannot send from this site yet. Please email the team at",
} as const;

export const visit = {
  headline: "Find us at Kenyatta University.",
  pending: ["the building, the floor, parking and step-free access"],
} as const;

/*
  FAQ vetting page, 23 September 2026: the questions and answers below are the
  reviewed set from that page, classified onto the page each belongs to. Each
  answer records that review as its confirmation, so FaqList publishes it
  rather than the enquiry wording. Where a fact is still open the answer says
  so plainly, instead of stating something no source supports.
*/
export const contactFaqs: Faq[] = [
  {
    id: "reach",
    question: "How do I get in touch with CDIE?",
    answer:
      "Email ive@ku.ac.ke or call +254 759 158 430. The team is available Monday to Friday, 8 am to 5 pm. You can also use the contact form and choose the topic that fits your enquiry.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
];
