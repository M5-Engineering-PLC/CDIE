// Lucid: nav order Home > Programmes > Design Studio > Media > About Us > Contact.
// Copy: CONTACT > Contact CDIE.
/*
  Change request 2026-09-21, second pass: "restore contact page". The first
  pass dropped Contact from the bar and left the route and the footer link
  standing. Contact returns to the bar, in Lucid's order, as the last item
  before LOGIN. Every enquiry button on the site resolves there, so the page a
  reader is sent to most often is now reachable without scrolling to the foot.
*/

import type { NavItem } from "./types";

export const site = {
  name: "CDIE",
  longName: "Centre for Design, Innovation & Engineering",
  institution: "Kenyatta University",
  tagline: "A place to learn, design and build for better healthcare.",
  /*
    The logo is the home link. Decision, 2026-09-11: the wordmark no longer sits
    beside it, because the logo already carries the name.
  */
  logo: {
    src: "/brand/cdie-logo.webp",
    alt: "CDIE, Centre for Design, Innovation & Engineering",
    width: 332,
    height: 195,
  },
} as const;

export const nav: NavItem[] = [
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
  Decision R2, 2026-09-11: the studio login is the last item in the navigation
  bar and keeps its footer link as well. This overrules Lucid, which kept
  app.cdie.co.ke out of the main navigation as a footer utility. Lucid's own
  fork fk6 still records that nobody has described what the application does.
*/
export const utilityLinks: NavItem[] = [
  { label: "LOGIN", href: "https://app.cdie.co.ke" },
];

/*
  Copy, MEDIA > From our community. These four destinations were verified from
  the current CDIE site's public social links on 2026-09-11.
*/
export const socialAccounts: { id: "linkedin" | "instagram" | "facebook" | "x"; label: string; href?: string }[] = [
  { id: "linkedin", label: "CDIE on LinkedIn", href: "https://www.linkedin.com/in/invention-education-kenyatta-university-a574b9336/" },
  { id: "instagram", label: "CDIE on Instagram", href: "https://www.instagram.com/eduinventku/" },
  { id: "facebook", label: "CDIE on Facebook", href: "https://www.facebook.com/profile.php?id=61568090889879" },
  { id: "x", label: "CDIE on X", href: "https://x.com/EduInventKU" },
];
