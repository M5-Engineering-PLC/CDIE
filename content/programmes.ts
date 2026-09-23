// Lucid: Programmes > IvE > MDI, Design Challenge, Catalyst grant, Masterclasses.
// Copy: PROGRAMMES.
// Lucid moved Events and Masterclasses out of Design Studio and into Programmes.
// Programmes owns every event record; Home and Media render views of them.

/*
  Change request 2026-09-21, section 3. Every opportunity photograph is a
  placeholder: nothing in public/images was taken of Catalyst grants, of a
  Design Challenge or of a masterclass. The alt text now describes only what is
  visible in the frame, never which programme the picture is standing in for,
  and the page renders each one through PlaceholderPhoto so a reader is told.

  The pairing also matches the home carousel now. The two pages had the same
  two workshop photographs attached to opposite programmes, which is the
  confusion the change request names.

  Change request 2026-09-21, second pass. Two things:

  - Every opportunity carries a carouselTitle. The five names are the client's
    own, given verbatim in the change request, and the landing carousel's tab
    strip reads them. Their capitalisation is the client's; where it differs
    from the Actual Copy tab's ("Invention education" against "Invention
    Education", "Design challenges" against "Design Challenge") that is logged
    as conflict C-07 in docs/BUILD_PLAN.md section 3.2 rather than quietly
    resolved here.
  - Every FAQ answer carries its confirmation. None has one yet, so none
    publishes: FaqList renders the enquiry wording under each question until a
    named person confirms the wording and the date is recorded.
*/

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
    carouselTitle: "Invention education",
    summary:
      "Understand the approach behind learning through real problems: listening closely, questioning assumptions and developing ideas through designing, making and trying again.",
    status: "enquire",
    href: "/programmes/invention-education",
    topic: "invention-education",
    pending: [],
    image: {
      src: "/images/cdie-summer-program-needs-filtering.jpg",
      alt: "Participants working through needs filtering at tables",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "mdi",
    title: "Medical Device Innovation",
    kind: "M.Sc. pathway",
    carouselTitle: "MSc MDI",
    summary:
      "The graduate track: engineering, clinical needs-finding and the wider decisions involved in developing a medical device.",
    status: "enquire",
    href: "/programmes/mdi",
    topic: "admissions",
    pending: ["Next intake and application window"],
    image: {
      src: "/images/cdie-mdi-cohort-1-semester-one-showcase.jpg",
      alt: "MDI student presenting at the end of semester showcase",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "design-challenge",
    title: "Design Challenge",
    kind: "Challenge",
    carouselTitle: "Design challenges",
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
    image: {
      src: "/images/cdie-ive-design-challenge.jpg",
      alt: "Design challenge teams presenting their prototype",
      width: 1600,
      height: 1000,
    },
  },
  {
    id: "catalyst-grants",
    title: "Catalyst grants",
    kind: "Funding",
    carouselTitle: "Catalyst grants",
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
    // Image matching sheet P4/P9: no photograph shows a Catalyst grant, so none is used.
  },
  {
    id: "training",
    title: "Masterclasses and training",
    kind: "Short format",
    carouselTitle: "Training and masterclasses",
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
    image: {
      src: "/images/cdie-summer-program-cnc-class-01.jpg",
      alt: "Participant operating a CNC machine",
      width: 1600,
      height: 1000,
    },
  },
];

/*
  Copy, PROGRAMMES > Programme events: "Upcoming events: [TBD]".
  Lucid wants the next three to five, each with date, venue and a live contact.
  Nothing is confirmed, so the list is empty and the empty state carries the
  wording from the Actual Copy tab. No event is invented to fill the band.
*/
/*
  Enhancements 2026-09-22: "populate events", from the CDIE LinkedIn feed
  sheet's events tab (Drive, CDIE website folder). Every record is an event CDIE
  posted about, with the post as its source. Dates the sheet marks "Est." are
  flagged `estimated` and shown as approximate. `image` is set only where a
  photograph from that event is in the repository.
*/
export const events: CalendarEvent[] = [
  { id: "ev01", title: "IvE Design Challenge 2025", kind: "Design challenge", start: "2025-09-22", end: "2025-09-26", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7376549585634127872/" },
  { id: "ev02", title: "MDI Info Session (Oct 2025)", kind: "Info session", start: "2025-10-06", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7380525086853804033/" },
  { id: "ev03", title: "Cocktails & Conversations – MDI Programme Launch", kind: "Networking event", start: "2025-10-21", link: "https://www.linkedin.com/feed/update/urn:li:activity:7386817397006958592/" },
  { id: "ev04", title: "RICE360 IvE Africa Network Design Competition", kind: "Design competition", start: "2025-11-18", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7396487414585888769/" },
  { id: "ev05", title: "MDI Cohort 1 Orientation", kind: "Orientation", start: "2026-01-09", link: "https://www.linkedin.com/feed/update/urn:li:activity:7415315474164432897/" },
  { id: "ev06", title: "Guest Lecture – Prof. Khama Rogo", kind: "Guest lecture", start: "2026-02-05", link: "https://www.linkedin.com/feed/update/urn:li:activity:7425211392028405761/" },
  { id: "ev07", title: "MDI Info Session (Feb 2026)", kind: "Info session", start: "2026-02-12", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7427284894814461952/" },
  { id: "ev08", title: "Guest Lecture – Innocent Abayo (IQVIA)", kind: "Guest lecture", start: "2026-02-13", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7428007547313393664/" },
  { id: "ev09", title: "The Professional Exchange", kind: "Networking event", start: "2026-02-20", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7430532441859203072/", image: "/images/events/cdie-professional-exchange.jpg" },
  { id: "ev10", title: "Lemelson Foundation Visit (Maggie Flanagan)", kind: "Partner visit", start: "2026-02-24", link: "https://www.linkedin.com/feed/update/urn:li:activity:7432431264818892800/", image: "/images/events/cdie-lemelson-foundation-visit.jpg" },
  { id: "ev11", title: "MDI Info Session (Mar 2026)", kind: "Info session", start: "2026-03-05", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7434654271339581441/" },
  { id: "ev12", title: "IvE Poster Presentation", kind: "Poster presentation", start: "2026-03-06", link: "https://www.linkedin.com/feed/update/urn:li:activity:7435972266875801600/", image: "/images/events/cdie-poster-presentation.jpg" },
  { id: "ev13", title: "Rice University Working Visit", kind: "Partner visit", start: "2026-03-16", end: "2026-03-20", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7442563452331663360/", image: "/images/events/cdie-rice-university-working-visit.jpg" },
  { id: "ev14", title: "IvE–Rice Strategic Planning", kind: "Strategic meeting", start: "2026-03-18", end: "2026-03-19", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7442872985285337088/", image: "/images/events/cdie-ive-rice-strategic-planning.jpg" },
  { id: "ev15", title: "Stakeholder Engagement Event – Golden Tulip", kind: "Stakeholder event", start: "2026-03-20", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7442971132695097344/", image: "/images/cdie-stakeholder-engagement-golden-tulip.jpg" },
  { id: "ev16", title: "Toastmasters Public Speaking Session", kind: "Workshop", start: "2026-03-20", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7449026073398292480/", image: "/images/events/cdie-professional-development-communication-class.jpg" },
  { id: "ev17", title: "IvE MDI Design Challenge: Assistive Care", kind: "Design challenge", start: "2026-03-23", end: "2026-03-27", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7443959708895375360/", image: "/images/cdie-design-challenge-awards.jpg" },
  { id: "ev18", title: "Guest Lecture – Elizabeth Odima (Invhestia)", kind: "Guest lecture", start: "2026-04-01", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7445372035683397632/" },
  { id: "ev19", title: "Guest Talk – Maryanne Muriuki", kind: "Guest lecture", start: "2026-04-10", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7448274838189690880/" },
  { id: "ev20", title: "Metalworking Session (MDI)", kind: "Workshop", start: "2026-04-13", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7449543196298158080/", image: "/images/events/cdie-mdi-metalworking-session.jpg" },
  { id: "ev21", title: "Speaker Spotlight – Sahar Jamal", kind: "Guest lecture", start: "2026-04-17", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7451170176475049984/" },
  { id: "ev22", title: "Advisory Board Meeting", kind: "Strategic meeting", start: "2026-04-17", link: "https://www.linkedin.com/feed/update/urn:li:activity:7451900711023296512/", image: "/images/cdie-advisory-board-meeting.jpg" },
  { id: "ev23", title: "MDI Info Session (Apr 2026)", kind: "Info session", start: "2026-04-21", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7452030836171849728/" },
  { id: "ev24", title: "Cocktails & Conversations – MSc Info Reception", kind: "Networking event", start: "2026-04-22", link: "https://www.linkedin.com/feed/update/urn:li:activity:7452393230714716161/" },
  { id: "ev25", title: "Semester One Completion Celebration", kind: "Milestone", start: "2026-05-08", link: "https://www.linkedin.com/feed/update/urn:li:activity:7459860199630331904/", image: "/images/events/cdie-mdi-cohort-1-semester-one-celebration-01.jpg" },
  { id: "ev26", title: "Hackcessible Challenge (AKU CIME)", kind: "External event", start: "2026-05-11", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7459950519139176448/" },
  { id: "ev27", title: "CDIE Summer Program 2026", kind: "Summer program", start: "2026-05-13", end: "2026-06-09", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7470557914076831745/", image: "/images/events/cdie-summer-program-2026-launch.jpg" },
  { id: "ev28", title: "MDI Cohort 1 End of Semester One Showcase", kind: "Showcase", start: "2026-05-18", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7462804321424834561/", image: "/images/cdie-mdi-cohort-1-semester-one-showcase.jpg" },
  { id: "ev29", title: "MDI Cohort 1 Clinical Immersion Findings", kind: "Milestone", start: "2026-06-10", link: "https://www.linkedin.com/feed/update/urn:li:activity:7470739121565528064/", image: "/images/events/cdie-mdi-cohort-1-clinical-immersion-findings.jpg" },
  { id: "ev30", title: "Moi University Visit", kind: "Partner visit", start: "2026-06-12", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7472188673988444160/", image: "/images/events/cdie-moi-university-visit.jpg" },
  { id: "ev31", title: "MDI Cohort 1 Third Design Review", kind: "Milestone", start: "2026-06-23", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7475533315639369731/", image: "/images/events/cdie-mdi-cohort-1-third-design-review-01.jpg" },
  { id: "ev32", title: "WIBEK 2026 Conference (Sponsor)", kind: "External event", start: "2026-06-27", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7477624524193161216/", image: "/images/cdie-wibek-2026-conference-01.jpg" },
  { id: "ev33", title: "Faculty Development Workshop – La Mada Hotel", kind: "Workshop", start: "2026-06-29", end: "2026-07-03", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7479812277597294592/", image: "/images/events/cdie-faculty-development-workshop-la-mada.jpg" },
  { id: "ev34", title: "Catalyst Grant Winners Presentations", kind: "Grant", start: "2026-07-08", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7482338803991638016/" },
  { id: "ev35", title: "International PPH Conference", kind: "External event", start: "2026-07-22", link: "https://www.linkedin.com/feed/update/urn:li:activity:7485732927729721344/", image: "/images/cdie-pph-conference-hackathon.jpg" },
  { id: "ev36", title: "MDI Cohort 1 Design Freeze", kind: "Milestone", start: "2026-08-18", link: "https://www.linkedin.com/feed/update/urn:li:activity:7495744070837780481/", image: "/images/events/cdie-mdi-cohort-1-design-freeze.jpg" },
  { id: "ev37", title: "Women in STEM – Transforming Healthcare", kind: "Panel / event", start: "2026-08-19", link: "https://www.linkedin.com/feed/update/urn:li:activity:7495028815115747328/" },
  { id: "ev38", title: "MDI Cohort 1 Regulatory Presentations", kind: "Milestone", start: "2026-08-20", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7498642968527052800/", image: "/images/cdie-bme-813-regulatory-strategies-presentations.jpg" },
  { id: "ev39", title: "EEE First-Years Orientation & Open Day", kind: "Orientation", start: "2026-08-28", estimated: true, link: "https://www.linkedin.com/feed/update/urn:li:activity:7500228454383230976/", image: "/images/cdie-eee-first-years-orientation-open-day-06.jpg" },
  { id: "ev40", title: "MDI Cohort 2 Orientation", kind: "Orientation", start: "2026-09-07", link: "https://www.linkedin.com/feed/update/urn:li:activity:7503034070562680832/", image: "/images/cdie-mdi-cohort-2-orientation-01.jpg" },
  { id: "ev41", title: "IvE Design Challenge: Maternal & Neonatal Care", kind: "Design challenge", start: "2026-09-14", end: "2026-09-18", link: "https://www.linkedin.com/feed/update/urn:li:activity:7508065548178710528/" },
  { id: "ev42", title: "Radio Interview – Stacy Awinja", kind: "Media", start: "2026-09-15", link: "https://www.linkedin.com/feed/update/urn:li:activity:7505491285416357888/" },
];

export const eventsCopy = {
  headline: "Meet, learn and exchange ideas.",
  standfirst:
    "Find conversations, workshops and programme activities that bring students, educators and industry together.",
  empty: "No upcoming events are listed at the moment. Contact us to ask what is planned.",
} as const;

/*
  FAQ vetting page, 23 September 2026: the questions and answers below are the
  reviewed set from that page, classified onto the page each belongs to. Each
  answer records that review as its confirmation, so FaqList publishes it
  rather than the enquiry wording. Where a fact is still open the answer says
  so plainly, instead of stating something no source supports.
*/
export const programmeFaqs: Faq[] = [
  {
    id: "online",
    question: "Can I study online or at weekends?",
    answer:
      "No. The M.Sc. runs full-time and in person at Kenyatta University over 18 months. Clinical immersion and industry engagement are part of the timetable, so attendance on site is expected.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "award",
    question: "What qualification do I get, and how long does it take?",
    answer:
      "You graduate with an M.Sc. in Biomedical Engineering — Medical Device Innovation. The programme runs for 18 months, full-time and in person at Kenyatta University.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "who",
    question: "Who is this programme for?",
    answer:
      "It is aimed at graduates with a strong science and mathematics foundation who want to apply those skills to healthcare challenges. Curiosity, teamwork and a willingness to learn through practical work matter as much as your technical background. Previous IvE cohorts have included both clinicians and engineers.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "entry",
    question: "What are the entry requirements?",
    answer:
      "Exact degree, grade and other entry requirements are still being confirmed. Email ive@ku.ac.ke and the admissions team will send you the approved criteria.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "idea",
    question: "Do I need to arrive with a medical device idea?",
    answer:
      "No. The programme teaches needs-finding and concept development, so you will learn how to identify a problem worth solving. If you already have an idea, ask the team how it could fit within the programme’s project requirements.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "curriculum",
    question: "What will I actually study?",
    answer:
      "The first stage builds foundations in clinical needs-finding, biomedical design, fabrication, entrepreneurship and communication. The second develops device design, regulatory strategy, quality systems, physiology, project management and quantitative methods. The final stage brings it together through advanced biomaterials, industry seminars and an M.Sc. project.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "studio",
    question: "Will I use the design studio?",
    answer:
      "Yes. Studio-based prototyping is part of the MDI learning experience, and the studio currently supports MDI-linked projects. Staff take you through induction and equipment guidance for each area before you use it.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "industry",
    question: "Does the programme include industry or clinical experience?",
    answer:
      "Yes. The programme description includes a mandatory internship, clinical immersion in hospitals and opportunities to meet healthcare and industry professionals. Confirm current placement arrangements with the programme team.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "apply",
    question: "When can I apply?",
    answer:
      "The next application window has not been announced yet. Email ive@ku.ac.ke to be told when applications open, or register your interest so the team can contact you.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "documents",
    question: "What do I need to submit with my application?",
    answer:
      "The existing process asks for a CV, a motivation letter, recommendation letters and undergraduate transcripts. Shortlisted applicants are then invited to interview. Ask the team for the final document checklist before you submit.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "fees",
    question: "What does it cost, and is funding available?",
    answer:
      "Tuition and scholarship details are being confirmed. Email ive@ku.ac.ke for current guidance on fees and any funding routes.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "grants",
    question: "Does CDIE offer grants or funding to innovators?",
    answer:
      "Yes. Through the Invention Education programme, CDIE runs catalytic grants that innovators can apply for to support early prototyping. There are several funding cycles each year — sign up for the newsletter so you hear when a call opens.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "challenge",
    question: "What is the Design Challenge, and can I take part?",
    answer:
      "The Design Challenge is a short, hands-on challenge where teams respond to a defined healthcare problem, build a prototype and present their thinking. Recent teams designed assistive devices to support caregivers. The brief, entry rules and next date are announced when a new round opens — ask the team to be notified.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "training",
    question: "Do you run short courses or masterclasses?",
    answer:
      "Yes. CDIE runs focused sessions in design, making and medical device innovation alongside the master’s programme. Upcoming sessions, prerequisites and sign-up details are published when scheduled — contact the team to ask what is planned.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
];

// ---------------------------------------------------------------- child pages

/*
  Change request 2026-09-13, section 4.5. Restored to the published wording at
  cdie.co.ke/invention-education-program/, which the build had paraphrased.

  One correction to the source: "empathetic investors" reads "empathetic
  inventors". The audit registers the original as a typo, and investors is not
  what the sentence is about.
*/
export const inventionEducation = {
  headline: "Good ideas begin with better questions.",
  standfirst:
    "Invention Education (IvE) is an innovative approach to learning that equips students with hands-on problem-solving skills, encouraging them to become empathetic inventors.",
  body: [
    "Unlike traditional passive learning methods, this model actively engages students in identifying real-world challenges, especially those without straightforward solutions, and developing their own creative solutions. Through designing, prototyping and critical thinking, students cultivate a mindset of exploration and resilience.",
    "In Kenya, Invention Education is being integrated into the national innovation ecosystem to strengthen pathways for young innovators. Universities play a crucial role in this transformation by fostering talent and facilitating idea generation to address local and global challenges. Kenyatta University’s first graduate IvE programme is the M.Sc. in Biomedical Engineering – Medical Device Innovation (MDI).",
    "In the MDI programme, students are presented with opportunities that simulate professional practice, from team-based design projects to mock interviews to working alongside medical health professionals. Students take classes in early-stage device innovation and develop professional networks through interaction with industry, learning the standards of medical device development.",
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
  /*
    Change request 2026-09-13, section 4.5. The published Requirements block on
    cdie.co.ke/mdi/ states the entry criteria outright, so the pending entry
    that stood here is closed. Wording follows the source.
  */
  who: {
    headline: "Who should consider applying?",
    body: "We are looking for candidates who meet the following criteria.",
    criteria: [
      "B.Sc. in Biomedical Engineering, or another engineering and technology related field including mechanical, electrical, mechatronics, chemical, computer science or physics, with at least an upper second class division.",
      "B.Sc. in a health or applied science related field with at least an upper second class division.",
      "Lower second class graduates in the above areas will be considered with an additional two years of relevant work experience.",
    ],
    experience:
      "Ideal candidates have experience in industry, preferably in design, development or roles involving medical technology and healthcare innovation. We look for a demonstrated interest in healthcare, shown through coursework, lab work, work experience or volunteering.",
    pending: [],
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

/*
  Change request 2026-09-13, section 6.2: "Our cohorts" describes an internal
  grouping; a visitor deciding whether to apply is asking what happened to
  people who did. The band is now framed by outcome.
*/
export const mdiCohortsCopy = {
  headline: "Success stories",
  standfirst: "Meet the people taking their ideas forward.",
  body: "Where graduates of the programme have taken their work, in their own words.",
  empty: "Graduate stories are published once each person has confirmed their words and given consent. Ask the team about a particular cohort or project.",
} as const;

export function getOpportunity(id: string): Opportunity | undefined {
  return opportunities.find((item) => item.id === id);
}
