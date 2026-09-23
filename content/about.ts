// Lucid: About Us > Explainer, Profiles Team, Profiles Cohorts.
// Copy: ABOUT US.
/*
  Change request 2026-09-21, second pass: "Add a hero image for the first
  section" and "remove cohort section". aboutIntro gains the photograph the
  hero renders; cohortsPointer is withdrawn, because the band that read it is
  gone and a content record nothing renders is a record the next writer will
  put words into.
*/
// Lucid: a profile needs picture, name and designation. Nothing else required.
// Person and cohort selections expand within this page; no child routes.

import type { Card, Faq, Person } from "./types";

export const aboutIntro = {
  headline: "Practical learning, with people at the centre.",
  standfirst:
    "The Centre for Design, Innovation & Engineering at Kenyatta University supports the design, engineering and prototyping of medical devices.",
  body: [
    "As part of Invention Education, we bring together hands-on learning, research and collaboration around healthcare needs. Our studio supports students in the Medical Device Innovation master’s programme as they develop ideas into prototypes.",
  ],
  /*
    A genuine CDIE photograph from the approved source package. The alt text
    describes what is in the frame and nothing else: not who the people are,
    not which programme they belong to and not when it was taken.
  */
  image: {
    src: "/images/cdie-summer-program-2026-launch-original.jpg",
    alt: "Summer program participants and staff in a group photo outside CDIE",
  },
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
  Copy, ABOUT US > Our team: a real photograph, verified name and current
  designation for each person.

  Roster provenance: the eight profiles were read from the live site during the
  audit and each name and role was confirmed by Munene on 2026-09-11. That
  confirmation is what let them be published; the concept file alone would not
  have been enough, since a concept file does not overrule the Actual Copy tab.

  Order follows the live site rather than an invented seniority ranking.

  The previous site's theme-demo profiles are deliberately absent and must never
  be ported. Gate 6 tests for their absence.

  An incomplete entry is omitted rather than shown as a placeholder. Two open
  items, neither of which blocks publication:
  - "Eubrea Mitchy Njeri" was read from the page, not from HR records. Confirm
    the spelling against HR before this goes to print anywhere.
  - Jacqueline Muitungu has a duplicate post on the live site, F-17. Reclaim the
    clean slug during migration.

  The photographs are environmental rather than cropped headshots, so the grid
  frames them at the plate's own ratio and crops as little as possible.
*/
const portrait = (slug: string, name: string, height = 712) => ({
  src: `/team/team-${slug}.webp`,
  alt: name,
  width: 600,
  height,
});

export const people: Person[] = [
  {
    id: "june-madete",
    name: "Dr. June Madete",
    role: "Director and Co-PI",
    portrait: portrait("june-madete", "Dr. June Madete"),
  },
  {
    id: "kenneth-iloka",
    name: "Dr. Kenneth Iloka",
    role: "Director Academia and Co-PI",
    portrait: portrait("kenneth-iloka", "Dr. Kenneth Iloka"),
  },
  {
    id: "maryanne-muriuki",
    name: "Maryanne Muriuki",
    role: "Director, External Engagements",
    portrait: portrait("maryanne-muriuki", "Maryanne Muriuki"),
  },
  {
    id: "caroline-nganga",
    name: "Caroline Ng’ang’a",
    role: "Executive Director",
    portrait: portrait("caroline-nganga", "Caroline Ng’ang’a"),
  },
  {
    id: "stacy-awinja",
    name: "Stacy Awinja",
    role: "Design Studio Manager",
    portrait: portrait("stacy-awinja", "Stacy Awinja"),
  },
  {
    id: "eubrea-mitchy-njeri",
    name: "Eubrea Mitchy Njeri",
    role: "Assistant Design Studio Manager",
    portrait: portrait("eubrea-mitchy", "Eubrea Mitchy Njeri"),
  },
  {
    id: "jacqueline-muitungu",
    name: "Jacqueline Muitungu",
    role: "Communications Lead",
    portrait: portrait("jacqueline-muitungu", "Jacqueline Muitungu"),
  },
  {
    id: "james-wambugu",
    name: "James Wambugu",
    role: "Assistant Administrator",
    portrait: portrait("james-wambugu", "James Wambugu", 600),
  },
  /*
    changes-v2, 2026-09-23: three colleagues added by name and role, with the
    portraits supplied the same day. Anthonius Waka's and Abigael Mwangi's
    photographs came at their own small size and are used as supplied rather
    than enlarged; Salome Njoroge's was cropped from a wider frame.
  */
  {
    id: "antonius-waka",
    name: "Anthonius Waka",
    role: "Catalyst Fellow",
    portrait: { src: "/team/team-antonius-waka.webp", alt: "Anthonius Waka", width: 263, height: 312 },
  },
  {
    id: "abigael-mwangi",
    name: "Abigael Mwangi",
    role: "Technical Assistant",
    portrait: { src: "/team/team-abigael-mwangi.webp", alt: "Abigael Mwangi", width: 255, height: 303 },
  },
  {
    id: "salome-njoroge",
    name: "Salome Njoroge",
    role: "Technical Assistant",
    portrait: portrait("salome-njoroge", "Salome Njoroge"),
  },
];

export const peopleCopy = {
  headline: "Our team",
  standfirst: "Meet the people supporting the learning and work at CDIE.",
  empty: "The current team roster is being verified before publication.",
} as const;

/*
  Cohorts used to live here. Decision R3, 2026-09-11 moved them onto the MDI
  page, where the blueprint argues they belong: a cohort is evidence of the
  programme, and it reads as evidence next to the curriculum rather than next to
  the staff. This overrules Lucid, which draws Profiles Cohorts under About Us.

  Change request 2026-09-21, second pass: "remove cohort section". The signpost
  band that pointed at the MDI page is gone from the page and its record with
  it. About Us stays institutional: what the centre is, why it is here, who
  runs it. See mdiCohorts in content/programmes.ts.
*/

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

/*
  FAQ vetting page, 23 September 2026: the questions and answers below are the
  reviewed set from that page, classified onto the page each belongs to. Each
  answer records that review as its confirmation, so FaqList publishes it
  rather than the enquiry wording. Where a fact is still open the answer says
  so plainly, instead of stating something no source supports.
*/
export const aboutFaqs: Faq[] = [
  {
    id: "ive",
    question: "What is the difference between CDIE and Invention Education?",
    answer:
      "Invention Education (IvE) is the approach and the wider programme — learning through real problems at Kenyatta University. CDIE is the centre where that work happens: the design, engineering and prototyping home for IvE, and the base for the Medical Device Innovation master’s programme.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "partner",
    question: "How can my organisation work with CDIE?",
    answer:
      "There are several ways to take part: speak to students as a guest, mentor an innovator, advise on the curriculum, suggest a project, or support the work through equipment, materials or funding. Tell us what you have in mind and we will find the right fit.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
];
