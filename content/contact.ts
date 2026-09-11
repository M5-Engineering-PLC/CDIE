// Lucid: Contact > Contact Form, Map, FAQs.
// Copy: CONTACT.
// The map slot exists but stays empty until Lucid fork fk3, the address
// conflict, is answered. Build plan decision D1.

import type { Card, EnquiryTopic } from "./types";

export const contactIntro = {
  headline: "Let’s talk about your next step.",
  standfirst:
    "Have a question about a programme, a studio project or working with CDIE? Tell us a little about what you need so we can direct your enquiry.",
} as const;

export const enquiryTopics: EnquiryTopic[] = [
  { id: "admissions", label: "Programmes and admissions" },
  { id: "studio", label: "Studio access and project support" },
  { id: "events", label: "Events and training" },
  { id: "partnerships", label: "Partnerships" },
  { id: "general", label: "General enquiry" },
];

export const defaultTopicId = "general";

/*
  Contact is a task page, so these are three static cards, not a carousel.
  Selecting one changes the form's reason. It does not send anything.
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
  success: "Thank you. Your enquiry has been sent to the CDIE team.",
  error: "Your message could not be sent. Please try again or email ive@ku.ac.ke.",
  /*
    Copy editorial note: use success and acknowledgement text only once sending
    is working. The recipient and automatic reply are not configured, so the
    form is disabled and the page leads with email and phone instead.
    Gate 6 enables this once a test enquiry reaches the intended mailbox.
  */
  enabled: false,
  disabledNote:
    "The enquiry form is not connected yet. Email or call the team and you will reach the same people.",
} as const;

export const visit = {
  headline: "Find us at Kenyatta University.",
  pending: [
    "Building and floor",
    "Map pin, campus entry directions, parking and accessibility information",
  ],
} as const;
