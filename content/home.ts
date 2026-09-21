// Lucid: Home. Copy: HOME.
/*
  Decision R1, 2026-09-11. The homepage no longer opens with a carousel
  previewing the five other pages. Two reviewers objected to it separately: the
  UX blueprint called it duplicate navigation, since the same labels sit in the
  navigation bar, and Mololu's comments replaced it with the programmes.

  Order now: the three programmes as a visual hero carousel, what CDIE is, the
  studio capabilities, the supplied partner marks, then recent activity.

  Decision R8: a carousel holds cards that link somewhere. It never holds the
  only copy of something a reader needs, so nothing here is unreachable to
  someone who ignores the controls.

  The partner marks arrived in the approved website source package on
  2026-09-11 and are rendered without adding unsupported partnership claims.

  Change request 2026-09-21, section 2: "photos on home page; what cdie is" and
  "cut down on placeholder text". What CDIE is now carries a photograph and one
  picture per word of the triad, and every summary on this page is trimmed to
  the sentence that earns its place. The photographs are genuine CDIE images
  already in public/images; their alt text describes what is visible and claims
  nothing about who is in the frame or when it was taken.
*/

import type { Card } from "./types";

export const programmeHeroSlides = [
  {
    id: "ive",
    eyebrow: "Invention Education",
    title: "Good ideas begin with better questions.",
    summary: "Learn the medical innovation cycle, leading innovators through a proven process of advancing medical technologies.",
    image: "/images/hero-workshop-1.jpg",
    alt: "People in workshop coats marking and cutting a wooden part at a bench",
    action: { label: "Discover Invention Education", href: "/programmes/invention-education" },
  },
  {
    id: "mdi",
    eyebrow: "Medical Device Innovation",
    title: "Build the skills behind better medical devices.",
    summary: "Take your interest in healthcare further with an M.Sc. in Biomedical Engineering focused on medical device innovation.",
    image: "/images/service-design-2.jpg",
    alt: "A person working on a laptop beside desktop workstations in the CDIE studio",
    action: { label: "Explore the MDI programme", href: "/programmes/mdi" },
  },
  {
    id: "studio",
    eyebrow: "Design Studio",
    title: "See where ideas take shape.",
    summary: "Explore the spaces, tools and workbenches that support design and prototyping at CDIE.",
    image: "/images/service-electronics-1.jpg",
    alt: "Two people soldering and testing a circuit at the CDIE electronics bench",
    action: { label: "Start the studio tour", href: "/design-studio" },
  },
] as const;

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
  image: {
    src: "/images/hero-workshop-1.jpg",
    alt: "People in workshop coats marking and cutting a wooden part at a bench",
  },
  triad: [
    {
      id: "innovate",
      title: "Innovate",
      body: "Explore healthcare needs with curiosity and careful thinking.",
      image: "/images/story-1.jpg",
      alt: "A team presenting a project on screen to a room at CDIE",
    },
    {
      id: "convene",
      title: "Convene",
      body: "Bring students, healthcare professionals and industry perspectives into the conversation.",
      image: "/images/story-3.jpg",
      alt: "A large group in CDIE coats gathered outside the centre's co-working space",
    },
    {
      id: "create",
      title: "Create",
      body: "Use design and prototyping to make ideas tangible.",
      image: "/images/service-3dprinting-1.jpg",
      alt: "A rack of 3D printers, filament and a wash-and-cure station in the CDIE studio",
    },
  ],
  action: { label: "Meet CDIE", href: "/about", live: true },
} as const;

export const servicesCopy = {
  eyebrow: "In the studio",
  headline: "What you can use, and what it is for.",
  standfirst: "Each one opens the studio at that service.",
} as const;

export const latestCopy = {
  eyebrow: "Our latest",
  headline: "What has been happening at the centre.",
} as const;

export const latestHighlights = [
  {
    id: "programme-projects",
    eyebrow: "Programme work",
    title: "Ideas presented, questioned and improved.",
    summary: "Learning activities and project presentations across CDIE programmes.",
    image: "/images/hero-workshop-1.jpg",
    alt: "People in workshop coats marking and cutting a wooden part at a bench",
    href: "/media",
    action: "Explore recent work",
  },
  {
    id: "cohort-moments",
    eyebrow: "From our programmes",
    title: "Learning happens around the workbench.",
    summary: "The people and practical sessions behind medical device innovation.",
    image: "/images/story-3.jpg",
    alt: "A large group in CDIE coats gathered outside the centre's co-working space",
    href: "/programmes",
    action: "Explore programmes",
  },
  {
    id: "community",
    eyebrow: "From our community",
    title: "A closer look at life at CDIE.",
    summary: "Stories and updates from the centre and its collaborators.",
    image: "/images/story-11.jpg",
    alt: "A group at a MedTech Connect event in front of a Policy Innovation wall",
    href: "/media",
    action: "Browse media",
  },
] as const;
