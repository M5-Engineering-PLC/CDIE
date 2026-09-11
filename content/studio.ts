// Lucid: Design Studio > Virtual Tour first, then the seven capability blocks.
// Copy: DESIGN STUDIO.
// Services are selections inside one page, not child routes. The selection is
// held in ?space= and ?service= so a shared link opens the same state.

import type { Capability, Faq, Space } from "./types";

export const studioIntro = {
  tourHeadline: "Step inside the CDIE studio.",
  tourStandfirst:
    "Explore the spaces where students sketch, build, discuss and refine their ideas.",
  headline: "From a sketch to something you can test.",
  body: "The CDIE design studio brings design tools, electronics and fabrication spaces together to support medical device prototyping. It gives students room to explore ideas in different materials and learn from what they make.",
} as const;

export const spaces: Space[] = [
  {
    id: "studio",
    name: "Design Studio",
    summary: "The main room: shared worktables, computers, printers and the electronics wall.",
    hasModel: true,
  },
  {
    id: "atc",
    name: "ATC",
    summary:
      "Metalworking, textiles and woodworking sit beyond this room. Photographs and service information until its layout is documented.",
    hasModel: false,
  },
];

/*
  modelGroup maps a capability onto a service group inside the studio model.
  Three capabilities carry null. Their positions are genuinely unknown, and the
  brief is explicit that they must not be placed by guesswork. The explorer
  highlights nothing for them and says so.
*/
export const capabilities: Capability[] = [
  {
    id: "design",
    name: "Design and CAD",
    space: "studio",
    headline: "Give your idea a form you can work with.",
    body: "Use sketching tools, computer-aided design software and workstations to explore a concept before fabrication. Develop and discuss your design with attention to how it will look, fit and function.",
    modelGroup: "design",
    pending: [
      "Software names and versions",
      "Workstation availability",
      "Design-support scope",
    ],
    enquiry: "Ask about design support",
    media: [],
  },
  {
    id: "electronics",
    name: "Electronics",
    space: "studio",
    headline: "Build a circuit. Understand how it behaves.",
    body: "Explore electronic systems using circuit-design software, microcontrollers and measurement equipment such as oscilloscopes. This area supports the practical work of building, observing and refining electronic prototypes.",
    modelGroup: "electronics",
    pending: [
      "Equipment models, available components and supported software",
      "Staff support, induction, access arrangements and any charges",
    ],
    enquiry: "Ask about electronics support",
    media: [],
  },
  {
    id: "three-d-printing",
    name: "3D printing",
    space: "studio",
    headline: "Hold the next version of your idea.",
    body: "Use FDM and SLA printing to move from a digital design to a physical model. A printed prototype can help you explore shape, fit and the changes needed for the next iteration.",
    modelGroup: "three-d-printing",
    pending: [
      "Machine models, build volumes, available materials, achievable tolerances and file requirements",
      "Turnaround, charges and booking eligibility",
    ],
    enquiry: "Ask about 3D printing",
    media: [],
  },
  {
    id: "co-working",
    name: "Co-working",
    space: "studio",
    headline: "Room to think together.",
    body: "Use the co-working and brainstorming space to discuss a problem, compare ideas and plan your team’s next step. It is designed to support the conversations that sit alongside practical work in the studio.",
    modelGroup: "co-working",
    pending: [
      "Desk capacity, opening hours, booking arrangements and included facilities",
    ],
    enquiry: "Ask about the workspace",
    media: [],
  },
  {
    id: "metalworking",
    name: "Metalworking",
    space: "atc",
    headline: "Make the parts your prototype needs.",
    body: "The metalworking area supports fabrication, machining and welding of metal components. Staff can guide learners in developing mechanical parts and using the space appropriately.",
    modelGroup: null,
    pending: [
      "Equipment list, supported materials and fabrication limits",
      "Safety induction, supervision, access rules and charges",
    ],
    enquiry: "Ask about metalworking",
    media: [],
  },
  {
    id: "textiles",
    name: "Textiles and upholstery",
    space: "atc",
    headline: "Design for the way a product meets the body.",
    body: "Explore fabric-based components, wearable concepts and upholstery with tools for sewing, cutting and working with textiles. This area brings material choice, fit and comfort into the prototyping process.",
    modelGroup: null,
    pending: ["Equipment and materials", "Access, staff support and charges"],
    enquiry: "Ask about textile prototyping",
    media: [],
  },
  {
    id: "woodworking",
    name: "Woodworking",
    space: "atc",
    headline: "Explore your idea in wood.",
    body: "The woodworking area provides space for developing wood-based designs and prototypes.",
    modelGroup: null,
    pending: [
      "Equipment, supported materials and example work",
      "Safety induction, supervision, access rules and charges",
    ],
    enquiry: "Ask about woodworking",
    media: [],
  },
];

/*
  Copy, DESIGN STUDIO > Access. The editorial note keeps this source-backed
  condition until CDIE confirms a broader policy: no open bookings, no
  commercial production. Decision D9.
*/
export const studioAccess = {
  headline: "Access",
  body: "The studio currently supports projects linked to the Medical Device Innovation master’s programme. If you have a project or a collaboration in mind, contact the team to discuss how it may fit.",
  action: { label: "Ask about studio access", href: "/contact?topic=studio", live: true },
} as const;

export const studioFaqs: Faq[] = [
  {
    id: "who",
    question: "Who can use the studio?",
    answer:
      "Current access supports MDI-linked projects. Ask the team about eligibility before planning a visit or equipment use.",
  },
  {
    id: "booking",
    question: "How do I book, and what does it cost?",
    answer:
      "Contact the team with your project, the area you need and your preferred timing, and they will explain the current arrangements.",
  },
  {
    id: "unfamiliar",
    question: "What if I have not used a tool before?",
    answer: "Ask the CDIE staff member on duty for guidance before using unfamiliar equipment.",
  },
  {
    id: "suggest",
    question: "Can I suggest a project for students?",
    answer:
      "Email ive@ku.ac.ke with a short description of the problem or project and your contact details.",
  },
  {
    id: "where",
    question: "Where is the studio?",
    answer:
      "CDIE is at Kenyatta University’s main campus. Please contact the team before travelling so we can confirm where to meet you.",
  },
];

export function getCapability(id: string): Capability | undefined {
  return capabilities.find((item) => item.id === id);
}

export const defaultCapabilityId = "electronics";
