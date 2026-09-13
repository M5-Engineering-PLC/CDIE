/*
  SAMPLE CONTENT - LAYOUT REVIEW ONLY. DELETE BEFORE LAUNCH.

  Change request 2026-09-13: "for items that depend on content addition, build
  the cards with simulated data, just to know the look."

  This file exists because AGENTS.md forbids inventing a date, a person, a
  cohort or a testimonial, and content/programmes.ts records the same rule for
  events. Nothing here is true. It is kept in one file, behind one flag, so the
  reviewer can see the layout and the whole thing can be removed with a single
  deletion rather than being hunted out of five components later.

  Rules that keep this safe:
  - Every consumer renders SampleNotice above sample data, so no reader can
    mistake it for a published fact.
  - SHOW_SAMPLE_CONTENT is the single switch. Set it to false to see the real
    empty states exactly as they ship.
  - Photographs are genuine CDIE images already in public/. Only the words,
    dates and attributions are invented.
  - No sample record carries a working external link. Socials point nowhere on
    purpose, so nothing false is published about a real person.

  Types are declared here rather than in content/types.ts so that deleting this
  file removes the whole concept in one step.
*/

export const SHOW_SAMPLE_CONTENT = true;

export type SampleEvent = {
  id: string;
  title: string;
  /** ISO date. Invented. */
  start: string;
  venue: string;
  summary: string;
  image: string;
  alt: string;
};

export type SampleStory = {
  id: string;
  name: string;
  cohort: string;
  /** Invented testimonial. Never publish without written consent. */
  quote: string;
  image: string;
  alt: string;
  socials: { platform: "linkedin" | "instagram" | "x"; href?: string }[];
};

export type SampleNewsletter = {
  id: string;
  issue: string;
  title: string;
  summary: string;
  image: string;
  alt: string;
  href?: string;
};

export const sampleEvents: SampleEvent[] = [
  {
    id: "sample-medtech-connect",
    title: "MedTech Connect: networking and IP workshop",
    start: "2026-10-08",
    venue: "Design Studio, Kenyatta University",
    summary:
      "An afternoon on protecting and commercialising a device idea, followed by open networking with clinicians and industry partners.",
    image: "/images/story-1.jpg",
    alt: "Participants at a CDIE networking session",
  },
  {
    id: "sample-design-challenge-brief",
    title: "Design Challenge 2027: brief release",
    start: "2026-11-12",
    venue: "Online and in the studio",
    summary:
      "The year's challenge brief is published and teams can register. Includes a walkthrough of judging criteria and the support available.",
    image: "/images/story-3.jpg",
    alt: "A team presenting project work",
  },
  {
    id: "sample-open-studio",
    title: "Open studio afternoon",
    start: "2026-12-03",
    venue: "Design Studio, Kenyatta University",
    summary:
      "Walk the workshop areas, meet the technicians and see what current projects are being built before the end of term.",
    image: "/images/service-metalworking-1.jpeg",
    alt: "Metalworking in the CDIE studio",
  },
];

export const sampleStories: SampleStory[] = [
  {
    id: "sample-story-1",
    name: "Amina Otieno",
    cohort: "MDI cohort 2024",
    quote:
      "I arrived with a clinical problem and no idea how to build anything. I left with a working prototype and the confidence to take it to a hospital and ask for feedback.",
    image: "/team/team-stacy-awinja.webp",
    alt: "Portrait placeholder",
    socials: [{ platform: "linkedin" }],
  },
  {
    id: "sample-story-2",
    name: "Brian Kimani",
    cohort: "MDI cohort 2024",
    quote:
      "The needs-finding weeks changed how I work. You stop designing for a problem you imagined and start designing for the one the ward actually has.",
    image: "/team/team-james-wambugu.webp",
    alt: "Portrait placeholder",
    socials: [{ platform: "linkedin" }, { platform: "x" }],
  },
  {
    id: "sample-story-3",
    name: "Grace Wanjiru",
    cohort: "Invention Education 2025",
    quote:
      "Having the workshop two floors from the clinic meant a design change took an afternoon, not a term. That changes what you are willing to try.",
    image: "/team/team-eubrea-mitchy.webp",
    alt: "Portrait placeholder",
    socials: [{ platform: "linkedin" }, { platform: "instagram" }],
  },
];

export const sampleNewsletters: SampleNewsletter[] = [
  {
    id: "sample-issue-6",
    issue: "Issue 6",
    title: "Prototypes, partnerships and a new cohort",
    summary:
      "Highlights from the summer programme, three device projects entering testing, and what the partnership with Rice360 is funding next.",
    image: "/images/hero-workshop-2.jpg",
    alt: "A CDIE cohort at the centre",
  },
  {
    id: "sample-issue-5",
    issue: "Issue 5",
    title: "Inside the Design Studio",
    summary:
      "A walk through the seven workshop areas, the equipment in each, and how students book time on the machines.",
    image: "/images/service-3dprinting-1.jpg",
    alt: "3D printing in the CDIE studio",
  },
  {
    id: "sample-issue-4",
    issue: "Issue 4",
    title: "From ward round to working device",
    summary:
      "How a clinical observation at Thika Level 5 Hospital became a prototype, and what the team learned taking it back for review.",
    image: "/images/hero-workshop-1.jpg",
    alt: "Students building a device in the workshop",
  },
];
