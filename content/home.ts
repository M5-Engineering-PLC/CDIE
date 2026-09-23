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
  "cut down on placeholder text". Every summary on this page is trimmed to the
  sentence that earns its place. The photographs are genuine CDIE images
  already in public/images; their alt text describes what is visible and claims
  nothing about who is in the frame or when it was taken.

  Change request 2026-09-21, second pass: "remove CDIE photo, keep the initials
  and three images for innovate convene, create". The photograph that opened
  What CDIE is goes; the C.D.I.E lettering stands there again and the three
  words keep their pictures. "remove meet cdie button" closes defineCdie.action,
  and "remove in the studio sub title" closes servicesCopy.standfirst. Neither
  key is left declared and unread: a field nothing renders is a field the next
  writer will put words into.
*/

import type { Card } from "./types";

export const programmeHeroSlides = [
  {
    id: "ive",
    eyebrow: "Invention Education",
    title: "Good ideas begin with better questions.",
    summary: "Learn the medical innovation cycle, leading innovators through a proven process of advancing medical technologies.",
    image: "/images/hero-workshop-2.jpg",
    alt: "Students in navy lab coats standing together in front of the CDIE entrance",
    action: { label: "Discover Invention Education", href: "/programmes/invention-education" },
  },
  {
    id: "mdi",
    eyebrow: "Medical Device Innovation",
    title: "Build the skills behind better medical devices.",
    summary: "Take your interest in healthcare further with an M.Sc. in Biomedical Engineering focused on medical device innovation.",
    image: "/images/hero-workshop-1.jpg",
    alt: "Students in lab coats and safety glasses marking and cutting a workpiece",
    action: { label: "Explore the MDI programme", href: "/programmes/mdi" },
  },
  {
    id: "studio",
    eyebrow: "Design Studio",
    title: "See where ideas take shape.",
    summary: "Explore the spaces, tools and workbenches that support design and prototyping at CDIE.",
    image: "/images/cdie-summer-program-laser-cutting.jpg",
    alt: "Students gathered around a laser cutter watching a job run",
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
  triad: [
    {
      id: "innovate",
      title: "Innovate",
      body: "Explore healthcare needs with curiosity and careful thinking.",
      image: "/images/story-2.jpg",
      alt: "Student team presenting a catheter monitoring prototype",
    },
    {
      id: "convene",
      title: "Convene",
      body: "Bring students, healthcare professionals and industry perspectives into the conversation.",
      image: "/images/story-11.jpg",
      alt: "Participants of a MedTech Connect convening standing in front of event banners",
    },
    {
      id: "create",
      title: "Create",
      body: "Use design and prototyping to make ideas tangible.",
      image: "/images/cdie-summer-program-cnc-class-original.jpg",
      alt: "Participants holding up a sign they made in the workshop",
    },
  ],
} as const;

export const servicesCopy = {
  eyebrow: "In the studio",
  headline: "What you can use, and what it is for.",
} as const;

export const latestCopy = {
  eyebrow: "Our latest",
  // Actual Copy, HOME > Latest from CDIE.
  headline: "Meet the people, projects and conversations shaping life at the centre.",
} as const;

export const latestHighlights = [
  {
    id: "programme-projects",
    eyebrow: "Programme work",
    title: "Ideas presented, questioned and improved.",
    summary: "Learning activities and project presentations across CDIE programmes.",
    image: "/images/cdie-design-challenge-pitch.jpg",
    alt: "Design challenge team presenting a slide to an audience",
    href: "/media",
    action: "Explore recent work",
  },
  {
    id: "cohort-moments",
    eyebrow: "From our programmes",
    title: "Learning happens around the workbench.",
    summary: "The people and practical sessions behind medical device innovation.",
    image: "/images/cdie-mdi-cohort-2-orientation-01.jpg",
    alt: "Incoming MDI Cohort 2 students and staff in a group photo",
    href: "/programmes",
    action: "Explore programmes",
  },
  {
    id: "community",
    eyebrow: "From our community",
    title: "A closer look at life at CDIE.",
    summary: "Stories and updates from the centre and its collaborators.",
    image: "/images/cdie-summer-program-3d-printing-training-original.jpg",
    alt: "Participants at laptops during a 3D printing training session",
    href: "/media",
    action: "Browse media",
  },
] as const;

/*
  Final pass 2026-09-23: "Gallery should be placed immediately after the hero.
  The images will be in cards arranged as a circular slider". Every frame is a
  CDIE photograph already on the site; each caption is the event or programme
  the picture is filed under elsewhere, never a new claim.
*/
export const galleryCopy = {
  eyebrow: "Gallery",
  headline: "Life at the centre.",
} as const;

export const galleryPhotos = [
  // 2026-09-23: the ten frames and their order are the ones CDIE supplied for the gallery.
  { id: "g-metalwork", src: "/images/service-metalworking-1.jpeg", alt: "Student in a welding helmet grinding metal as sparks fly", caption: "Metalworking" },
  { id: "g-coworking", src: "/images/service-coworking-1.jpg", alt: "Students seated at desks in a bright seminar room while a speaker presents", caption: "Co-working space" },
  { id: "g-woodwork", src: "/images/cdie-woodwork-mitre-saw.jpg", alt: "Student cutting timber on a mitre saw", caption: "Woodworking" },
  { id: "g-wibek", src: "/images/cdie-wibek-2026-conference-07.jpg", alt: "Women holding a gift bag and a microphone on stage beside event banners", caption: "WIBEK 2026 Conference" },
  { id: "g-cnc", src: "/images/cdie-summer-program-cnc-class-04.jpg", alt: "Participant in gloves setting up a CNC machine", caption: "CDIE Summer Program 2026" },
  { id: "g-stakeholders", src: "/images/cdie-stakeholder-engagement-golden-tulip.jpg", alt: "Stakeholder engagement guests in a group photo between Invention Education banners", caption: "Stakeholder engagement" },
  { id: "g-faculty", src: "/images/cdie-meet-the-faculty-kenneth-iloka.jpg", alt: "Faculty member showing a resin 3D printer to visiting guests", caption: "Meet the faculty" },
  { id: "g-prototyping-lab", src: "/images/cdie-mdi-woodworking-prototyping-lab.jpg", alt: "Students in safety goggles and overalls gathered around a mitre saw", caption: "MDI prototyping lab" },
  { id: "g-cohort-2", src: "/images/cdie-mdi-cohort-2-orientation-01.jpg", alt: "Incoming MDI Cohort 2 students and staff in a group photo", caption: "MDI Cohort 2 orientation" },
  { id: "g-celebration", src: "/images/cdie-mdi-cohort-1-semester-one-celebration-group.jpg", alt: "MSc cohort and guests at an evening celebration", caption: "MDI Cohort 1 semester one celebration" },
] as const;
