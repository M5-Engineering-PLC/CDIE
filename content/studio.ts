// Lucid: Design Studio > Virtual Tour first, then the seven capability blocks.
// Copy: DESIGN STUDIO.
// Services are selections inside one page, not child routes. The selection is
// held in ?space= and ?service= so a shared link opens the same state.

import type { Capability, Faq, Space } from "./types";

/*
  Change request 2026-09-21, section 4: "for now just use generic placeholders
  for different components within any specific service".

  Each capability lists the things it actually covers, so the tour can show
  what sits behind one highlighted station. Every name below is lifted from
  that capability's own `body` in this file, which is the Actual Copy tab's
  wording; none is a product, a model, a count or a specification. Those stay
  in `pending` until CDIE confirms them.
*/

export const studioIntro = {
  tourHeadline: "Step inside the CDIE studio.",
  tourStandfirst:
    "Explore the spaces where students sketch, build, discuss and refine their ideas.",
  headline: "From a sketch to something you can test.",
  body: "The CDIE design studio brings design tools, electronics and fabrication spaces together to support medical device prototyping. It gives students room to explore ideas in different materials and learn from what they make.",
} as const;

/*
  Review of 11 September, item R9. The two sides are the Graduate School and the
  ATC, not the Design Studio and the ATC, and textiles and upholstery belongs to
  the first of them rather than the second.

  This is a conflict with Lucid, which names the first side Design Studio, and it
  is recorded in docs/BUILD_PLAN.md section 3.2. What changed here is the label
  and the membership. The page keeps its name and its route, because
  /design-studio is public and the page covers both sides. The id stays "studio"
  so shared ?space= links do not break.
*/
export const spaces: Space[] = [
  {
    id: "studio",
    name: "Graduate School",
    shortName: "Grad school",
    summary:
      "Design and CAD, electronics, 3D printing, co-working, and textiles and upholstery. The room plan covers the main room; textile work is not placed in it, because nothing documents where it sits.",
    hasModel: true,
  },
  {
    id: "atc",
    name: "ATC",
    shortName: "ATC",
    summary:
      "Engineering & Prototyping Workshop: CNC machining, laser cutting, metal fabrication, and tool storage inside and alongside the shipping container.",
    hasModel: true,
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
    components: [
      { id: "sketching", name: "Sketching tools", note: "Where a concept starts, before it reaches a screen." },
      { id: "cad-workstations", name: "CAD workstations", note: "Workstations for computer-aided design." },
      { id: "design-software", name: "Design software", note: "Computer-aided design software for developing the form." },
    ],
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
    components: [
      { id: "circuit-software", name: "Circuit-design software", note: "For laying out and checking a circuit before it is built." },
      { id: "microcontrollers", name: "Microcontrollers", note: "The programmable part of a prototype." },
      { id: "measurement", name: "Measurement equipment", note: "Oscilloscopes and other instruments for observing behaviour." },
    ],
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
    components: [
      { id: "fdm", name: "FDM printing", note: "Building a part up in layers of filament." },
      { id: "sla", name: "SLA printing", note: "Resin printing where the detail matters more than the speed." },
    ],
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
    components: [
      { id: "desks", name: "Co-working desks", note: "Room to work alongside other teams." },
      { id: "brainstorming", name: "Brainstorming space", note: "For comparing ideas and planning the next step." },
    ],
  },
  {
    id: "textiles",
    name: "Textiles and upholstery",
    space: "studio",
    headline: "Design for the way a product meets the body.",
    body: "Explore fabric-based components, wearable concepts and upholstery with tools for sewing, cutting and working with textiles. This area brings material choice, fit and comfort into the prototyping process.",
    modelGroup: null,
    pending: ["Equipment and materials", "Access, staff support and charges"],
    enquiry: "Ask about textile prototyping",
    media: [],
    components: [
      { id: "sewing", name: "Sewing", note: "Making up fabric-based components." },
      { id: "cutting", name: "Cutting", note: "Preparing material for a wearable or upholstered part." },
      { id: "upholstery", name: "Upholstery", note: "Working on the surfaces a product presents to the body." },
    ],
  },
  {
    id: "metalworking",
    name: "Metalworking",
    space: "atc",
    headline: "Make the structural parts your prototype needs.",
    body: "Centered on 4 heavy-duty steel fabrication workbenches and the container tooling shed. Outfitted for metal cutting, filing, grinding, arc welding, and mechanical assembly with TOTAL bench vice, inverter MMA welder, and organized tool storage.",
    modelGroup: "metalworking",
    pending: [
      "Equipment list, supported materials and fabrication limits",
      "Safety induction, supervision, access rules and charges",
    ],
    enquiry: "Ask about metalworking",
    media: [],
    components: [
      { id: "fabrication", name: "Heavy-duty fabrication benches", note: "Welding, mechanical assembly, electronics and staging tables." },
      { id: "vice", name: "Heavy-duty swivel bench vice", note: "Cast steel vice with anvil for cutting, filing and bending." },
      { id: "welding", name: "Inverter arc welding unit", note: "Portable MMA welding unit with digital readout and PPE." },
      { id: "tool-shed", name: "Tool storage shelving", note: "Multi-tier steel racks with power tools, drills, lubricants and parts bins." },
    ],
  },
  {
    id: "woodworking",
    name: "Woodworking",
    space: "atc",
    headline: "Explore your idea in wood, composites & plastics.",
    body: "Housed inside the blue shipping container for dust containment and acoustic control. Features the Blue Elephant ELECNC1212 3-axis CNC router with 1200×1200mm vacuum T-slot bed, water-cooled spindle, and dedicated CAD/CAM operator workstation.",
    modelGroup: "woodworking",
    pending: [
      "Equipment, supported materials and example work",
      "Safety induction, supervision, access rules and charges",
    ],
    enquiry: "Ask about woodworking",
    media: [],
    components: [
      { id: "cnc-router", name: "Three-axis CNC routing bed", note: "Vacuum bed, water-cooled spindle, stepper gantry." },
      { id: "operator-station", name: "CAD and CAM workstation", note: "Dedicated terminal with toolpath control and preview." },
      { id: "dust-extraction", name: "Dust extraction system", note: "High-vacuum swarf collector over spindle head." },
    ],
  },
  {
    id: "laser-cutting",
    // changes-v2 item 5: CNC and laser engraving are listed as one service.
    name: "CNC and Laser Engraving",
    space: "atc",
    headline: "Rapid 2D profiling and precision sheet prototyping.",
    body: "Positioned along the rear louvred window wall. The enclosed Blue Elephant CO2 laser cutter offers precision cutting and engraving across acrylic, MDF, plywood, cardboard, and technical textiles with active window exhaust.",
    modelGroup: "laser-cutting",
    pending: [
      "Supported sheet materials, thickness limits and cutting speeds",
      "Digital file preparation (.dxf, .ai, .svg) and Ruida DSP training",
      "Laser safety induction and exhaust extraction checklist",
    ],
    enquiry: "Ask about CNC and laser engraving",
    media: [],
    components: [
      { id: "co2-laser", name: "Enclosed laser cutting bed", note: "Enclosed cutting bed with safety interlock viewing canopy." },
      { id: "dsp-controller", name: "Digital controller keypad", note: "Digital speed, power and origin positioning keypad." },
      { id: "honeycomb-bed", name: "Honeycomb and knife bed", note: "Dual-surface cutting bed with active fume exhaust duct." },
    ],
  },
  /*
    changes-v2 item 5: "empty card for casting and moulding, no description for
    now". The card holds the name and nothing else: no headline and no
    equipment list, because none has been supplied. 2026-09-23: it now has a
    photograph, supplied for this service (a clear resin cast of a hand).
  */
  {
    id: "casting-moulding",
    name: "Casting and Moulding",
    space: "studio",
    headline: "",
    body: "",
    modelGroup: null,
    pending: ["A description of this area, its equipment and how to use it"],
    enquiry: "Ask about casting and moulding",
    media: [],
    components: [],
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

/*
  FAQ vetting page, 23 September 2026: the questions and answers below are the
  reviewed set from that page, classified onto the page each belongs to. Each
  answer records that review as its confirmation, so FaqList publishes it
  rather than the enquiry wording. Where a fact is still open the answer says
  so plainly, instead of stating something no source supports.
*/
export const studioFaqs: Faq[] = [
  {
    id: "who",
    question: "Who can use the studio?",
    answer:
      "The studio currently supports projects tied to the M.Sc. Medical Device Innovation programme. If you have a project or a collaboration in mind, contact the team to discuss how it might fit.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "external",
    question: "I am not on the MDI programme. Will that change?",
    answer:
      "CDIE expects to widen its scope beyond the master’s programme in future. Changes to access are announced through the newsletter and our social channels, so sign up to hear when that happens.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "booking",
    question: "How do I book, and what does it cost?",
    answer:
      "Contact the team with your project, the area you need and your preferred timing, and they will explain the current arrangements. Booking routes and any charges are still being confirmed.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "areas",
    question: "What can I make in the studio?",
    answer:
      "The studio brings several areas together: design and CAD, electronics and signal processing, 3D printing, metalworking, textiles and upholstery, woodworking, and a co-working space for planning and discussion. Each area has staff support and its own induction.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "three-d-print",
    question: "Can I get something 3D printed?",
    answer:
      "The studio has FDM and SLA printing to take a digital design to a physical model. File requirements, materials, turnaround and any charges depend on the machine and your project — ask the team before you prepare a file.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "materials",
    question: "Do I bring my own materials?",
    answer:
      "Material supply varies by area and by project. Tell the team what you are planning to build and they will explain what the studio stocks and what you should bring.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "unfamiliar",
    question: "What if I have not used a tool before?",
    answer:
      "Ask the CDIE staff member on shift before using any equipment you are not familiar with. They will show you how to use it safely, and some areas require a safety induction first.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "emergency",
    question: "There is an emergency in the studio. What should I do?",
    answer:
      "Notify the nearest CDIE staff member straight away. Make yourself familiar with where the first aid kits and fire extinguishers are kept before you start work, so you are ready if it happens.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "hours",
    question: "When is the studio open?",
    answer:
      "The CDIE team is available Monday to Friday, 8 am to 5 pm. Hours for a particular area depend on staff cover, so contact the team before you plan a working session.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "suggest",
    question: "Can I suggest a project for students to work on?",
    answer:
      "Yes. Email ive@ku.ac.ke with a short description of the problem or project idea and your contact details, and the team will get back to you.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "tour",
    question: "Can I visit or take a tour?",
    answer:
      "You can explore the studio through the virtual tour on this page. For an in-person visit, contact the team first so we can confirm a time and where to meet you.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
  {
    id: "where",
    question: "Where is the studio, and how do I get there?",
    answer:
      "The Design Studio is on the 2nd floor of the Kenyatta University Graduate School, off Thika Superhighway at Exit 11. Please contact the team before travelling so we can confirm where to meet you.",
    confirmed: { by: "CDIE team, FAQ vetting review", on: "2026-09-23", source: "FAQ vetting page, 23 September 2026" },
  },
];

export function getCapability(id: string): Capability | undefined {
  return capabilities.find((item) => item.id === id);
}

export const defaultCapabilityId = "electronics";
