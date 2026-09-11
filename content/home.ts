// Lucid: Home. Copy: HOME.
// Order is fixed: five-destination carousel, three cards, second carousel, footer.

import type { Card, CarouselSlide } from "./types";

export const homeHero = {
  headline: "A place to learn, design and build for better healthcare.",
  standfirst:
    "The Centre for Design, Innovation & Engineering brings hands-on learning and medical device prototyping together.",
  primary: { label: "Explore our programmes", href: "/programmes", live: true },
} as const;

/*
  Copy, HOME > Hero: "Carousel that shows the 5 pages available on the site as
  a preview." Lucid asks for minimal above the fold, one clear line and one
  action; each slide carries exactly that.
*/
export const destinationSlides: CarouselSlide[] = [
  {
    id: "programmes",
    eyebrow: "Programmes",
    title: "Learn by working on problems that matter.",
    line: "Understand the learning model, then find the opportunity that fits you.",
    action: { label: "Explore learning pathways", href: "/programmes", live: true },
  },
  {
    id: "design-studio",
    eyebrow: "Design Studio",
    title: "See where ideas take shape.",
    line: "Explore the spaces, tools and workbenches that support design and prototyping at CDIE.",
    action: { label: "Step inside the studio", href: "/design-studio", live: true },
  },
  {
    id: "media",
    eyebrow: "Media",
    title: "A closer look at life at CDIE.",
    line: "Updates from the studio, programme highlights and conversations with the people taking part.",
    action: { label: "Explore stories and newsletters", href: "/media", live: true },
  },
  {
    id: "about",
    eyebrow: "About Us",
    title: "Practical learning, with people at the centre.",
    line: "Who we are, why we are here and the people doing the work.",
    action: { label: "Meet CDIE", href: "/about", live: true },
  },
  {
    id: "contact",
    eyebrow: "Contact",
    title: "Let’s talk about your next step.",
    line: "Tell us a little about what you need so we can direct your enquiry.",
    action: { label: "Find the right contact", href: "/contact", live: true },
  },
];

/*
  The three static cards. Lucid: "Programme carousel: IvE and MDI as cards."
  The confirmed structure adds Design Studio and makes the row static.
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
    eyebrow: "A closer look at the studio",
    title: "See where ideas take shape.",
    summary:
      "Explore the spaces, tools and workbenches that support design and prototyping at CDIE.",
    action: { label: "Take the studio tour", href: "/design-studio", live: true },
  },
];

/*
  The lower carousel. Lucid: "Strip of latest media (events + newsletter), not
  PDF links." The confirmed structure adds the people panel.
  Each panel is a view of records owned elsewhere; none holds a date of its own.
*/
export const featurePanels: Card[] = [
  {
    id: "people",
    eyebrow: "Meet the People",
    title: "The people behind the work.",
    summary:
      "Meet the people supporting the learning and work at CDIE, and the cohorts taking their ideas forward.",
    action: { label: "Open About Us at People", href: "/about#people", live: true },
  },
  {
    id: "events",
    eyebrow: "Event Calendar",
    title: "Meet, learn and exchange ideas.",
    summary:
      "Conversations, workshops and programme activities that bring students, educators and industry together.",
    action: { label: "Open the event calendar", href: "/programmes#events", live: true },
  },
  {
    id: "media",
    eyebrow: "Media",
    title: "The stories behind the work.",
    summary:
      "Programme news, project highlights and reflections from the CDIE community.",
    action: { label: "Explore Media", href: "/media", live: true },
  },
];
