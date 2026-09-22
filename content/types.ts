/*
  Content contract. Structure follows the Lucid CDIE Website Skeleton;
  every string is carried from the Actual Copy tab.

  Two rules hold this layer honest, and Gate 6 checks both:
  - No [TBD] marker and no editorial note reaches a public field.
  - A record whose facts are unconfirmed sets `pending`, and the page renders
    the enquiry wording instead of inventing a date, a fee or a figure.
*/

export type Destination = {
  label: string;
  href: string;
  /** false while the destination is not live; the UI shows an enquiry instead */
  live?: boolean;
};

export type Figure = {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
};

export type NavItem = {
  label: string;
  href: string;
};

export type CarouselSlide = {
  id: string;
  eyebrow: string;
  title: string;
  line: string;
  action: Destination;
};

export type Card = {
  id: string;
  eyebrow?: string;
  title: string;
  summary: string;
  action: Destination;
};

export type LearningStage = {
  id: string;
  title: string;
  body: string;
};

export type OpportunityStatus = "open" | "soon" | "enquire";

export type Opportunity = {
  id: string;
  title: string;
  kind: string;
  /*
    Change request 2026-09-21, second pass, Programmes: "change the carousel
    titles to Invention education, MSc MDI, Design challenges, Catalyst grants,
    Training and masterclasses". The five names are the client's own, given in
    the change request, and they are what the carousel's tab strip reads. They
    are held apart from `title`, which is the programme's name on its own page
    and in the Actual Copy tab, and from `kind`, which says what sort of thing
    it is. Nothing else may use this field.
  */
  carouselTitle: string;
  summary: string;
  status: OpportunityStatus;
  href: string;
  /** facts the programme owner has not confirmed; never rendered as claims */
  pending: string[];
  /** the enquiry topic this programme prefills on the contact form */
  topic: string;
  /** review of 11 September: a picture of the programme, not an icon. The card
      renders without one until CDIE supplies the photograph. */
  image?: Figure;
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  venue?: string;
  contact?: string;
  registration?: Destination;
};

/*
  Change request 2026-09-21, second pass, Programmes: "require manual input and
  confirmation for all faqs".

  An answer is a published claim about fees, access, eligibility or a process.
  The audit that opened this project found exactly that kind of claim on the
  live site with nothing behind it, so an answer now carries its own
  provenance and cannot be written without one:

  - `answer` is typed by hand from the source. Nothing generates it.
  - `confirmed` records who confirmed the wording and when. Until it is
    present, FaqList does not publish the answer: it renders the question with
    the enquiry wording instead, exactly as the claim-safety rule in AGENTS.md
    requires of a fact the source has not confirmed.

  The field is required, not optional, so the decision has to be made for every
  question anyone adds rather than defaulted past.
*/
export type FaqConfirmation = {
  /** who at CDIE confirmed this wording */
  by: string;
  /** ISO date of that confirmation */
  on: string;
  /** where the wording comes from: the Actual Copy heading, or the page */
  source: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  /** null until a person has confirmed the answer. Never defaulted. */
  confirmed: FaqConfirmation | null;
};

export type SpaceId = "studio" | "atc";

export type CapabilityId =
  | "design"
  | "electronics"
  | "three-d-printing"
  | "co-working"
  | "textiles"
  | "metalworking"
  | "woodworking"
  | "laser-cutting";

/*
  Change request 2026-09-21, section 4: "for now just use generic placeholders
  for different components within any specific service".

  A station in the room stands for several things a reader cannot see at that
  scale: the design bench is workstations and the software on them, the
  electronics area is a power bench, a signals bench and a soldering bench.
  A StudioComponent is one of those, shown as a card when the tour focuses on
  its capability.

  Every name here is taken from that capability's own body copy in the source.
  Nothing names a product, a model or a version: those are exactly the facts
  the sources mark unconfirmed, and they stay in the capability's `pending`
  array until CDIE supplies them.

  `image` is deliberately optional and deliberately empty everywhere today.
  CDIE has not photographed the individual benches, and a general studio
  photograph captioned "power bench" would be the same fabrication the alt text
  rule exists to stop. Until the photographs are taken each component renders
  an empty, labelled frame; adding a src is the only change needed then.
*/
export type StudioComponent = {
  id: string;
  name: string;
  /** one line, drawn from the capability's source copy */
  note: string;
  /** the component's own photograph, once it exists */
  image?: string;
  /** what is visible in the frame, never what the picture stands for */
  alt?: string;
};

export type Capability = {
  id: CapabilityId;
  name: string;
  space: SpaceId;
  headline: string;
  body: string;
  /** service group id in the studio/atc model, or null where the position is unknown */
  modelGroup: "design" | "electronics" | "three-d-printing" | "co-working" | "woodworking" | "metalworking" | "laser-cutting" | null;
  pending: string[];
  enquiry: string;
  media: Figure[];
  /** the benches, stations and tools this capability covers. Placeholders for now. */
  components: StudioComponent[];
};

export type Space = {
  id: SpaceId;
  name: string;
  /** the name as it fits the narrow column of the capability list */
  shortName: string;
  summary: string;
  hasModel: boolean;
};

export type MediaKind = "newsletter" | "story" | "update";

export type MediaItem = {
  id: string;
  kind: MediaKind;
  title: string;
  summary: string;
  date?: string;
  /** the label an issue is referred to by, such as "Issue 6" */
  issue?: string;
  /** newsletters open the published issue in a new tab, with no intermediate click */
  external?: string;
  /*
    Decision R5, 2026-09-11: "cards such as newsletter 1 with an image, then
    link to pdf in a new tab when tapped". The cover is the card; tapping it
    opens the issue. A card without a cover still renders, as type alone.
  */
  cover?: Figure;
  body?: string[];
};

export type Person = {
  id: string;
  name: string;
  role: string;
  portrait?: Figure;
};

export type Cohort = {
  id: string;
  year: string;
  programme: string;
  intro: string;
  people: string[];
  projects: Card[];
};

/*
  Change request 2026-09-13, section 4.5. The curriculum published on
  cdie.co.ke lists every unit with its code and description. The build had
  summarised it into three sentences, which is the drift that item names.
*/
export type Course = {
  /** unit code, e.g. BME 810. Absent for the elective slots. */
  code?: string;
  title: string;
  body: string;
};

export type Semester = {
  id: string;
  name: string;
  courses: Course[];
};

export type EnquiryTopic = {
  id: string;
  label: string;
};
