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

export const newslettersCopy = {
  headline: "The stories behind the work.",
  standfirst:
    "Read programme news, project highlights and reflections from the CDIE community in our newsletter archive.",
  linkNote: "Opens the published issue in a new tab.",
  empty:
    "The newsletter archive is not published here yet. Contact the team for the latest issue.",
} as const;

/*
  Copy, MEDIA > Newsletters: the issue-card description pattern requires a
  confirmed topic, a confirmed contributor and a confirmed activity. The audit
  found issues 4, 5 and 6 on the live site as bare PDF links with no summary.
  None of those summaries exist yet, so the archive ships empty with a useful
  message rather than fabricated cards. Populate at build step 4.
*/
export const mediaItems: MediaItem[] = [];

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

export const mediaFaqs: Faq[] = [];

export function getMediaItem(id: string): MediaItem | undefined {
  return mediaItems.find((item) => item.id === id);
}
