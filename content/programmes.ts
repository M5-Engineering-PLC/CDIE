// Lucid: Programmes > IvE > MDI, Design Challenge, Catalyst grant, Masterclasses.
// Copy: PROGRAMMES.
// Lucid moved Events and Masterclasses out of Design Studio and into Programmes.
// Programmes owns every event record; Home and Media render views of them.

import type { CalendarEvent, Cohort, Faq, LearningStage, Opportunity } from "./types";

export const programmesLanding = {
  headline: "Learn by working on problems that matter.",
  standfirst:
    "Our programmes connect learning with the innovation cycle inventors need to impact real lives on the ground. Start by understanding a need, develop ideas with others and use design and prototyping to explore what could work.",
  shortcuts: [
    { label: "Explore Invention Education", href: "/programmes/invention-education", live: true },
    { label: "Explore MDI", href: "/programmes/mdi", live: true },
  ],
} as const;

export const learningStages: LearningStage[] = [
  {
    id: "understand",
    title: "Understand the need.",
    body: "Explore the experiences of users and the setting in which a solution must work.",
  },
  {
    id: "develop",
    title: "Develop a direction.",
    body: "Compare ideas, discuss trade-offs and decide what is worth testing.",
  },
  {
    id: "build",
    title: "Build and learn.",
    body: "Make prototypes, gather feedback and use what you discover to improve the design.",
  },
  {
    id: "explain",
    title: "Explain your thinking.",
    body: "Share the need, the evidence and the choices behind your work.",
  },
];

export const opportunities: Opportunity[] = [
  {
    id: "invention-education",
    title: "Invention Education",
    kind: "Learning model",
    summary:
      "Understand the approach behind learning through real problems: listening closely, questioning assumptions and developing ideas through designing, making and trying again.",
    status: "enquire",
    href: "/programmes/invention-education",
    topic: "invention-education",
    pending: [],
  },
  {
    id: "mdi",
    title: "Medical Device Innovation",
    kind: "M.Sc. pathway",
    summary:
      "The graduate track: engineering, clinical needs-finding and the wider decisions involved in developing a medical device.",
    status: "enquire",
    href: "/programmes/mdi",
    topic: "admissions",
    pending: ["Next intake and application window"],
  },
  {
    id: "design-challenge",
    title: "Design Challenge",
    kind: "Challenge",
    summary:
      "A real challenge. A chance to make something useful. Work with others to explore a practical response to a defined problem.",
    status: "enquire",
    href: "/programmes/design-challenge",
    topic: "design-challenge",
    pending: [
      "Current challenge brief",
      "Who can enter and team requirements",
      "Timeline, submission requirements, judging criteria, prizes and support",
    ],
  },
  {
    id: "catalyst-grants",
    title: "Catalyst grants",
    kind: "Funding",
    summary:
      "Give an early idea room to develop. Catalyst grants support early prototyping through the Invention Education programme.",
    status: "enquire",
    href: "/programmes/catalyst-grants",
    topic: "catalyst-grants",
    pending: [
      "Current call and eligibility",
      "Award amount",
      "Assessment criteria and application deadline",
    ],
  },
  {
    id: "training",
    title: "Masterclasses and training",
    kind: "Short format",
    summary:
      "Make time to learn a practical skill. Focused sessions in design, making and medical device innovation.",
    status: "enquire",
    href: "/programmes/training",
    topic: "training",
    pending: [
      "Session titles and learning outcomes",
      "Level, prerequisites and trainer",
      "Format, schedule, venue, cost and sign-up route",
    ],
  },
];

/*
  Copy, PROGRAMMES > Programme events: "Upcoming events: [TBD]".
  Lucid wants the next three to five, each with date, venue and a live contact.
  Nothing is confirmed, so the list is empty and the empty state carries the
  wording from the Actual Copy tab. No event is invented to fill the band.
*/
export const events: CalendarEvent[] = [];

export const eventsCopy = {
  headline: "Meet, learn and exchange ideas.",
  standfirst:
    "Find conversations, workshops and programme activities that bring students, educators and industry together.",
  empty: "No upcoming events are listed at the moment. Contact us to ask what is planned.",
} as const;

export const programmeFaqs: Faq[] = [
  {
    id: "online",
    question: "Can I study online or at weekends?",
    answer:
      "The programme is described as full-time and in person, with clinical and industry engagement forming part of the learning experience.",
  },
  {
    id: "idea",
    question: "Do I need to arrive with a medical device idea?",
    answer:
      "The programme teaches needs-finding and concept development. If you already have an idea, ask the team how it could fit within the programme’s project requirements.",
  },
  {
    id: "studio",
    question: "Will I use the design studio?",
    answer:
      "Studio-based prototyping supports the MDI learning experience. The team will explain access arrangements and equipment guidance.",
  },
  {
    id: "industry",
    question: "Does the programme include industry experience?",
    answer:
      "The source programme description includes a mandatory internship and opportunities to meet industry professionals. Confirm current placement arrangements with the programme team.",
  },
  {
    id: "apply",
    question: "When can I apply?",
    answer: "Contact the team for current admissions information.",
  },
];

// ---------------------------------------------------------------- child pages

export const inventionEducation = {
  headline: "Good ideas begin with better questions.",
  standfirst:
    "Invention Education (IvE) is an approach to learning through real problems. You learn to listen closely, question assumptions and develop ideas through designing, making and trying again.",
  body: [
    "At CDIE, IvE connects students with healthcare challenges and the people who understand them. The Medical Device Innovation master’s programme is its flagship graduate track.",
  ],
  takeaways:
    "A more deliberate approach to problem-solving, practical experience of prototyping and the confidence to work across disciplines.",
  action: { label: "Explore the MDI pathway", href: "/programmes/mdi", live: true },
  enquiry: {
    label: "Ask about Invention Education",
    href: "/contact?topic=invention-education",
    live: true,
  },
} as const;

export const mdi = {
  headline: "Build the skills behind better medical devices.",
  standfirst:
    "The M.Sc. in Biomedical Engineering – Medical Device Innovation combines engineering, clinical needs-finding and the wider decisions involved in developing a medical device.",
  body: [
    "You will work on design projects, learn from healthcare and industry professionals, and use the CDIE studio to turn ideas into prototypes. Alongside making, you will study business, quality systems and regulatory strategy.",
  ],
  /*
    Confirmed in the source, unverified since August. Decision D8 in the build
    plan holds these open with the programme owner; they publish as stated
    facts only after that confirmation.
  */
  structure: [
    { label: "Award", value: "M.Sc. in Biomedical Engineering – Medical Device Innovation" },
    { label: "Duration", value: "18 months" },
    { label: "Study mode", value: "Full-time, in person" },
    { label: "Location", value: "Kenyatta University" },
  ],
  structurePending: ["Next intake and application window"],
  learn: [
    {
      title: "Find meaningful problems.",
      body: "Use observation, interviews and clinical immersion to identify unmet needs.",
    },
    {
      title: "Design and prototype.",
      body: "Develop concepts, select materials and build models that help you assess your ideas.",
    },
    {
      title: "Understand the path beyond a prototype.",
      body: "Explore business planning, quality management and regulatory considerations.",
    },
    {
      title: "Work across disciplines.",
      body: "Learn with people who bring different technical backgrounds and perspectives.",
    },
    {
      title: "Communicate your work.",
      body: "Practise presenting ideas, explaining evidence and building professional relationships.",
    },
  ],
  curriculum: [
    "The first stage develops foundations in clinical needs-finding, biomedical design, fabrication, entrepreneurship and communication.",
    "The next stage builds your understanding of device design, regulatory strategy, quality systems, physiology, project management and quantitative methods.",
    "The final stage brings your learning together through advanced biomaterials, industry seminars and an M.Sc. project.",
  ],
  who: {
    headline: "Who should consider applying?",
    body: "The programme is aimed at graduates with a strong science and mathematics foundation who want to apply their skills to healthcare challenges. Curiosity, teamwork and a willingness to learn through practical work matter here.",
    pending: ["Exact degree, grade and other entry requirements"],
  },
  applications: {
    headline: "Take the next step with a clear picture of the programme.",
    body: "Ask the admissions team about the next intake, eligibility and the documents you will need before submitting your application.",
    process:
      "The existing application process asks for a CV, motivation letter, recommendation letters and undergraduate transcripts, followed by interviews for shortlisted applicants.",
    pending: ["Current application form, final document checklist and selection timetable"],
    action: { label: "Contact admissions", href: "/contact?topic=admissions", live: true },
  },
  fees: {
    headline: "Fees and funding",
    pending: [
      "Tuition and other programme costs",
      "Scholarship availability, eligibility and application process",
    ],
    guidance: "For guidance, contact ive@ku.ac.ke.",
  },
} as const;

export const designChallenge = {
  headline: "A real challenge. A chance to make something useful.",
  standfirst:
    "Bring your curiosity and work with others to explore a practical response to a defined problem. The design challenge is an opportunity to learn through making, explain your thinking and develop an idea through feedback.",
  past: "Explore previous challenge briefs and the work developed by participating teams.",
  action: { label: "Ask about the Design Challenge", href: "/contact?topic=design-challenge", live: true },
} as const;

export const catalystGrants = {
  headline: "Give an early idea room to develop.",
  standfirst:
    "Catalyst grants support early prototyping through the Invention Education programme. They help innovators explore whether an idea is worth developing further.",
  /*
    The Lucid map states a 500 dollar grant. The Actual Copy tab records that
    the source announcement lists different awards for different applicant
    groups, and instructs that no amount is published until the current call is
    confirmed. Decision D5. The copy authority wins on a published figure, so
    no number appears here.
  */
  action: { label: "Ask about Catalyst grants", href: "/contact?topic=catalyst-grants", live: true },
} as const;

export const training = {
  headline: "Make time to learn a practical skill.",
  standfirst:
    "Explore focused sessions in design, making and medical device innovation. Each listing makes it easy to understand what you will practise and whether the session is right for you.",
  action: { label: "Ask about masterclasses and training", href: "/contact?topic=training", live: true },
} as const;

/*
  Decision R3, 2026-09-11. Moved here from content/about.ts. A cohort is
  evidence of the programme, so it sits with the curriculum and the projects.

  Still empty: no cohort record has been verified. Work in progress is
  distinguished from completed work, and a destination or an outcome publishes
  only once it is confirmed.
*/
export const mdiCohorts: Cohort[] = [];

export const mdiCohortsCopy = {
  headline: "Our cohorts",
  standfirst: "Meet the people taking their ideas forward.",
  body: "Discover current and past cohorts, the projects they explored and the paths they have taken since.",
  empty: "Cohort profiles are published once each record is confirmed. Ask the team about a particular cohort or project.",
} as const;

export function getOpportunity(id: string): Opportunity | undefined {
  return opportunities.find((item) => item.id === id);
}
