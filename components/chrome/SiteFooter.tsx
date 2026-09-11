// Lucid: Contact block plus the Login utility, which stays out of the main nav.
// Copy: CONTACT > Contact CDIE. One contact record, read by every page.

import Link from "next/link";

import type { NavItem } from "@/content/types";

export type SiteFooterProps = {
  items: NavItem[];
  utility: NavItem[];
  contact: {
    email: string;
    phone: string;
    phoneHref: string;
    availability: string;
    campus: string;
  };
  name: string;
  longName: string;
  institution: string;
};

export function SiteFooter({
  items,
  utility,
  contact,
  name,
  longName,
  institution,
}: SiteFooterProps) {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <p className="display text-title text-ink">{name}</p>
          <p className="text-fine leading-relaxed text-ink-2">
            {longName}
            <br />
            {institution}
          </p>
          <p className="text-fine text-ink-2">{contact.campus}</p>
        </div>

        <nav aria-label="Footer">
          <p className="kicker mb-3">Pages</p>
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-body text-ink-2 no-underline hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="kicker mb-3">Reach us</p>
          <ul className="flex flex-col gap-2 text-body text-ink-2">
            <li>
              <a href={`mailto:${contact.email}`} className="text-brand">
                {contact.email}
              </a>
            </li>
            <li>
              <a href={contact.phoneHref} className="text-brand">
                {contact.phone}
              </a>
            </li>
            <li>{contact.availability}</li>
          </ul>
          <ul className="mt-6 flex flex-col gap-2">
            {utility.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="font-mono text-fine text-ink-3 no-underline hover:text-ink-2"
                >
                  {item.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line-soft">
        <div className="shell flex flex-wrap justify-between gap-3 py-5 text-fine text-ink-3">
          <span>
            © {new Date().getFullYear()} {longName}, {institution}.
          </span>
          <span className="font-mono">Contact the team before travelling.</span>
        </div>
      </div>
    </footer>
  );
}
