// Lucid: Home. Copy: HOME.
/*
  Decision R1, 2026-09-11. The homepage no longer opens with a carousel
  previewing the five other pages. Two reviewers objected to it separately: the
  UX blueprint called it duplicate navigation, since the same labels sit in the
  navigation bar, and Mololu's comments replaced it with the programmes.

  Order now: a short hero, the three programmes as a carousel of cards, what
  CDIE is, the studio capabilities as a second carousel, then the latest posts.

  Decision R8: a carousel holds cards that link somewhere. It never holds the
  only copy of something a reader needs, so nothing here is unreachable to
  someone who ignores the controls.

  There is no partners strip. Mololu's comments ask for one and no source names
  a single partner organisation, so it is not built until somebody supplies the
  list.
*/

import type { Card } from "./types";

export const homeHero = {
  headline: "A place to learn, design and build for better healthcare.",
  standfirst:
    "The Centre for Design, Innovation & Engineering brings hands-on learning and medical device prototyping together.",
  primary: { label: "Explore our programmes", href: "/programmes", live: true },
} as const;

/*
  Section one. Copy, HOME: the three ways in. Lucid draws IvE and MDI as
  programme cards; the confirmed structure adds the Design Studio alongside them.
*/
export const programmeCards: Card[] = [
  {
    id: "ive",
    eyebrow: "Invention Education",
    title: "Good ideas begin with better questions.",
    summary:
      "Learn the medical innovation cycle, leading innovators through a proven process of advancing medical technologies.",
    action: {
      label: "Discover Invention Education",
      href: "/programmes/invention-education",
      live: true,
    },
  },
  {
    id: "mdi",
    eyebrow: "Medical Device Innovation",
    title: "Build the skills behind better medical devices.",
    summary:
      "Take your interest in healthcare further with an M.Sc. in Biomedical Engineering focused on medical device innovation. Learn through clinical needs-finding, design projects and practical work in the studio.",
    action: { label: "Explore the MDI programme", href: "/programmes/mdi", live: true },
  },
  {
    id: "studio",
    eyebrow: "Design Studio",
    title: "See where ideas take shape.",
    summary:
      "Explore the spaces, tools and workbenches that support design and prototyping at CDIE.",
    action: { label: "Take the studio tour", href: "/design-studio", live: true },
  },
];

/*
  Section two. Mololu's comments: "define CDIE". The words are the Actual Copy
  tab's, carried from ABOUT US so the two pages cannot drift apart.
*/
export const defineCdie = {
  eyebrow: "What CDIE is",
  headline: "Practical learning, with people at the centre.",
  body: "The Centre for Design, Innovation & Engineering at Kenyatta University supports the design, engineering and prototyping of medical devices. As part of Invention Education, we bring together hands-on learning, research and collaboration around healthcare needs.",
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
  action: { label: "Meet CDIE", href: "/about", live: true },
} as const;

export const servicesCopy = {
  eyebrow: "In the studio",
  headline: "What you can use, and what it is for.",
  standfirst:
    "Each capability opens the studio at that service, with its own information and photographs.",
} as const;

export const latestCopy = {
  eyebrow: "Our latest",
  headline: "What has been happening at the centre.",
} as const;
