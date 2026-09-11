// Lucid: About Us > Explainer, Profiles Team, Profiles Cohorts.
// Copy: ABOUT US.
// Lucid: a profile needs picture, name and designation. Nothing else required.
// Person and cohort selections expand within this page; no child routes.

import type { Card, Cohort, Person } from "./types";

export const aboutIntro = {
  headline: "Practical learning, with people at the centre.",
  standfirst:
    "The Centre for Design, Innovation & Engineering at Kenyatta University supports the design, engineering and prototyping of medical devices.",
  body: [
    "As part of Invention Education, we bring together hands-on learning, research and collaboration around healthcare needs. Our studio supports students in the Medical Device Innovation master’s programme as they develop ideas into prototypes.",
  ],
} as const;

export const purpose = {
  headline: "Why we are here",
  body: "A useful design starts with understanding the people and setting it is meant for. We help students connect that understanding with the practical work of making: asking questions, exploring options, building prototypes and learning through feedback.",
  triad: [
    {
      id: "innovate",
      title: "Innovate",
      body: "Explore healthcare needs with curiosity and careful thinking.",
    },
    {
      id: "convene",
      title: "Convene",
      body: "Bring students, healthcare professionals and industry perspectives into the conversation.",
    },
    {
      id: "create",
      title: "Create",
      body: "Use design and prototyping to make ideas tangible.",
    },
  ],
} as const;

export const workYouCanSee = {
  headline: "Work you can see",
  body: "Explore the design challenges, learning activities and project presentations documented across the CDIE site.",
  actions: [
    { label: "Explore our programmes", href: "/programmes", live: true },
    { label: "Browse our media", href: "/media", live: true },
  ],
} as const;

/*
  Copy, ABOUT US > Our team: use a real photograph, verified name and current
  designation for each person. The current roster and preferred spellings are
  unverified, and the editorial note forbids carrying over theme-demo profiles.

  The live site's two fabricated profiles, Samantha Wood and Dan Wilkinson, are
  deliberately absent and must never be ported. Build plan section 9.

  The grid ships empty until the roster is verified. An incomplete entry is
  omitted from publication rather than shown as a placeholder.
*/
export const people: Person[] = [];

export const peopleCopy = {
  headline: "Our team",
  standfirst: "Meet the people supporting the learning and work at CDIE.",
  empty: "The current team roster is being verified before publication.",
} as const;

export const cohorts: Cohort[] = [];

export const cohortsCopy = {
  headline: "Our cohorts",
  standfirst: "Meet the people taking their ideas forward.",
  body: "Discover current and past cohorts, the projects they explored and the paths they have taken since.",
  empty: "Cohort records are being verified before publication.",
} as const;

export const collaborate = {
  headline: "Share your experience. Help someone take the next step.",
  body: [
    "There are several ways to contribute: mentor a student, share an industry perspective, suggest a project or discuss support through equipment, materials or funding.",
    "If you are a clinician, educator, industry professional or potential partner, we would like to hear what you have in mind.",
  ],
  action: {
    label: "Talk to us about collaborating",
    href: "/contact?topic=partnerships",
    live: true,
  },
} as const;

export const projectCards: Card[] = [];
