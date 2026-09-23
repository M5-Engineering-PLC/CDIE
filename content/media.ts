// Lucid: Media > Newsletters, Events Calendar, Upcoming Events, LinkedIn.
// Copy: MEDIA.
// Newsletters open the published issue directly in a new tab, no intermediate
// click. Programmes owns event dates and registration; Media links to them.

import type { Faq, MediaItem } from "./types";

export const mediaLanding = {
  headline: "A closer look at life at CDIE.",
  standfirst:
    "Explore updates from the studio, programme highlights and conversations with the people taking part.",
  actions: [
    { label: "Browse newsletters", href: "#newsletters", live: true },
    { label: "Follow our updates", href: "#community", live: true },
  ],
} as const;

/*
  Decision R5, 2026-09-11: newsletters stay inside Media rather than taking a
  page of their own, and each issue is a card carrying an image that opens the
  PDF in a new tab when tapped. The blueprint asked for a separate archive page;
  this keeps Lucid's placement and takes the blueprint's card treatment.
*/
export const newslettersCopy = {
  headline: "The stories behind the work.",
  standfirst:
    "Read programme news, project highlights and reflections from the CDIE community in our newsletter archive.",
  linkNote: "Opens the issue in a new tab.",
  empty:
    "The newsletter archive is not published here yet. Contact the team for the latest issue.",
} as const;

/*
  Enhancements 2026-09-22: "use the actual newsletters in the repo, open in
  separate new tab". The six published Invention Education issues live in
  public/newsletters with a cover image for each. Every summary below restates
  the opening of that issue's own front page, so nothing here goes beyond what
  the PDF itself says. Newest first.
*/
const coverSizes = [
  { width: 1800, height: 1200 },
  { width: 1120, height: 747 },
  { width: 1282, height: 855 },
  { width: 832, height: 555 },
  { width: 1196, height: 797 },
  { width: 1280, height: 853 },
] as const;

const issue = (n: number, file: string, title: string, summary: string): MediaItem => ({
  id: `ive-newsletter-${n}`,
  kind: "newsletter",
  issue: `Issue ${n}`,
  title,
  summary,
  external: `/newsletters/${file}`,
  cover: { src: `/newsletters/issue${n}-photo.webp`, alt: `Photo from the IvE newsletter, issue ${n}`, ...coverSizes[n - 1] },
});

export const mediaItems: MediaItem[] = [
  issue(6, "IvE-Newsletter-Issue-6-2026-compressed.pdf", "The inaugural MDI cohort arrives",
    "January 2026: the first cohort of the MSc Biomedical Engineering (Medical Device Innovation) programme opens its doors at Kenyatta University."),
  issue(5, "IvE-Newsletter-5.pdf", "First cohort selection underway",
    "Applications for the new MSc Biomedical Engineering (Medical Device Innovation) programme have closed and selection of the first cohort has begun."),
  issue(4, "IvE-Newsletter-issue-4.pdf", "Inside the MDI programme",
    "How the 18-month professional master's combines medicine, engineering and business, guided by real-world clinical needs."),
  issue(3, "IvE-Newsletter-Issue-3.pdf", "Learning with visiting faculty",
    "Visiting faculty from Rice University join the programme, drawing on practice from institutions including MIT."),
  issue(2, "IvE-Newsletter-Issue-2.pdf", "The MDI programme launches",
    "The Medical Device Innovation programme officially launches at Kenyatta University on 8 January 2025."),
  issue(1, "IvE-Newsletter-Issue-1.pdf", "Invention Education comes to KU",
    "Dr June Madete on how Kenyatta University is advancing healthcare innovation with Rice360 and funding from The Lemelson Foundation."),
];

export const communityCopy = {
  headline: "Follow the ideas, questions and work we share along the way.",
  /*
    The editorial note requires confirmed account URLs and working integrations
    before displaying feeds, and forbids claiming automatic cross-posting.
    Lucid's bidirectional control surface is an internal operations concern and
    is out of scope for release one.
  */
  note: "Official account links are added once each destination is confirmed.",
} as const;

export const eventsPointer = {
  headline: "Looking for an event?",
  body: "Find upcoming workshops, conversations and programme activities in our events calendar.",
  action: { label: "Explore programme events", href: "/programmes#events", live: true },
} as const;

/*
  FAQ vetting page, 23 September 2026: the questions and answers below are the
  reviewed set from that page, classified onto the page each belongs to. Each
  answer records that review as its confirmation, so FaqList publishes it
  rather than the enquiry wording. Where a fact is still open the answer says
  so plainly, instead of stating something no source supports.
*/
export const mediaFaqs: Faq[] = [
  {
    id: "news",
    question: "How do I keep up with what CDIE is doing?",
    answer:
      "Subscribe to the newsletter for programme news, project highlights and open funding calls. We also share updates on LinkedIn, Instagram and YouTube.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "events",
    question: "Where can I find upcoming events?",
    answer:
      "Upcoming workshops, conversations and programme activities are listed on the events page under Programmes. If nothing is listed, contact us to ask what is planned.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
];

export function getMediaItem(id: string): MediaItem | undefined {
  return mediaItems.find((item) => item.id === id);
}
