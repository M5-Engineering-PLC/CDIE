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
  summary: string;
  status: OpportunityStatus;
  href: string;
  /** facts the programme owner has not confirmed; never rendered as claims */
  pending: string[];
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

export type Faq = {
  id: string;
  question: string;
  answer: string;
};

export type SpaceId = "studio" | "atc";

export type CapabilityId =
  | "design"
  | "electronics"
  | "three-d-printing"
  | "co-working"
  | "metalworking"
  | "textiles"
  | "woodworking";

export type Capability = {
  id: CapabilityId;
  name: string;
  space: SpaceId;
  headline: string;
  body: string;
  /** service group id in the studio model, or null where the position is unknown */
  modelGroup: "design" | "electronics" | "three-d-printing" | "co-working" | null;
  pending: string[];
  enquiry: string;
  media: Figure[];
};

export type Space = {
  id: SpaceId;
  name: string;
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
  /** newsletters open the published issue in a new tab, with no intermediate click */
  external?: string;
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

export type EnquiryTopic = {
  id: string;
  label: string;
};
