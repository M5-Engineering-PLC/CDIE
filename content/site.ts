// Lucid: nav order Home > Programmes > Design Studio > Media > About Us > Contact.
// Copy: CONTACT > Contact CDIE.

import type { NavItem } from "./types";

export const site = {
  name: "CDIE",
  longName: "Centre for Design, Innovation & Engineering",
  institution: "Kenyatta University",
  tagline: "A place to learn, design and build for better healthcare.",
} as const;

export const nav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Programmes", href: "/programmes" },
  { label: "Design Studio", href: "/design-studio" },
  { label: "Media", href: "/media" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/*
  The one contact record. Every page reads from here.
  This closes fault F-04, inconsistent contact details across pages.

  The building and floor are deliberately absent: the Contacts page publishes
  2nd Floor Graduate School and the FAQ publishes 1st Floor Chandaria Centre.
  Lucid records this as open fork fk3. Until it is answered, the site publishes
  neither, and keeps the instruction to contact the team before travelling.
*/
export const contact = {
  email: "ive@ku.ac.ke",
  phone: "+254 759 158 430",
  phoneHref: "tel:+254759158430",
  availability: "Monday to Friday, 8 am–5 pm",
  campus: "Kenyatta University Main Campus, off Thika Superhighway, Exit 11.",
  buildingConfirmed: false,
  beforeYouTravel:
    "Please contact the team before travelling so we can confirm where to meet you.",
} as const;

/*
  Lucid keeps app.cdie.co.ke as a utility only, out of the main navigation.
  Open fork fk6: nobody has described what it does, so it gets one footer link.
*/
export const utilityLinks: NavItem[] = [
  { label: "Studio login", href: "https://app.cdie.co.ke" },
];

/*
  Copy, MEDIA > From our community. The editorial note requires confirmed
  account URLs before anything is displayed, so these carry no href yet and the
  footer omits the group until one is confirmed.
*/
export const socialAccounts: { label: string; href?: string }[] = [
  { label: "CDIE on LinkedIn" },
  { label: "CDIE on Instagram" },
  { label: "CDIE on YouTube" },
];
