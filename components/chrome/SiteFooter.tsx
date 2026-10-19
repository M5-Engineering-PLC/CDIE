// Review R2: Contact block, social links, and LOGIN repeated from the main nav.
// Copy: CONTACT > Contact CDIE. One contact record, read by every page.
/*
  Change request 2026-09-13, sections 2.1 and 7.2: the brand mark replaces the
  text wordmark, and the travel note leaves the footer. The note still renders
  on Contact and Design Studio, where someone is actually planning a visit.

  Review 2026-10-19, "remove unnecessary information on the footer": the
  campus line becomes a short "Graduate School" link that opens the building
  in Google Maps, and the days line goes, leaving the opening hours. The pages
  list stays: Contact is reached only from here.
*/

import Link from "next/link";

import { SocialIcon } from "@/components/chrome/SocialIcon";
import type { NavItem } from "@/content/types";

export type SiteFooterProps = {
  items: NavItem[];
  utility: NavItem[];
  contact: {
    email: string;
    phone: string;
    phoneHref: string;
    availability: string;
    availabilityDays: string;
    availabilityHours: string;
    campus: string;
  };
  name: string;
  longName: string;
  institution: string;
  socialAccounts: { id: "linkedin" | "instagram" | "facebook" | "x"; label: string; href?: string }[];
};

export function SiteFooter({
  items,
  utility,
  contact,
  name,
  longName,
  institution,
  socialAccounts,
}: SiteFooterProps) {
  return (
    <footer className="mt-12 border-t md:mt-24 border-brand-lift/25 bg-ink text-surface">
      {/* Change request 2026-09-21, section 1: the two link columns sit side by
          side on a phone rather than stacking, which halves the footer. */}
      <div className="shell grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:gap-10 md:py-16 md:grid-cols-[1.25fr_.8fr_1fr]">
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          {/*
            Initials, not the mark. The full logo already carries the name in
            the header; repeating it on ink meant silhouetting it, which threw
            away the colour that makes it recognisable. The letterforms read
            cleanly at any size and need no asset.
          */}
          <p className="display text-head leading-none tracking-tight text-surface">{name}</p>
          <p className="text-fine leading-relaxed text-surface/70">
            {longName}
            <br />
            {institution}
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=-1.183719%2C36.927427"
            target="_blank"
            rel="noreferrer"
            className="text-fine text-surface/70 hover:text-surface"
          >
            Graduate School
            <span className="sr-only"> (opens in Google Maps in a new tab)</span>
          </a>
        </div>

        <nav aria-label="Footer">
          <p className="kicker mb-3 !text-brand-lift">Pages</p>
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-body text-surface/70 no-underline hover:text-surface">
                  {item.label}
                </Link>
              </li>
            ))}
            {/* Enhancements 2026-09-22: LOGIN joins the pages list. */}
            {utility.map((item) => (
              <li key={item.href}>
                <a href={item.href} target="_blank" rel="noreferrer" className="text-body font-semibold text-brand-lift no-underline hover:text-surface">
                  {item.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="kicker mb-3 !text-brand-lift">Reach us</p>
          <ul className="flex flex-col gap-2 text-body text-surface/70">
            <li>
              <a href={`mailto:${contact.email}`} className="text-surface hover:text-brand-lift">
                {contact.email}
              </a>
            </li>
            <li>
              <a href={contact.phoneHref} className="text-surface hover:text-brand-lift">
                {contact.phone}
              </a>
            </li>
            <li>{contact.availabilityHours}</li>
          </ul>
          {/* changes-v2 item 8: two icons per row on a phone. */}
          <ul className="mt-7 grid w-fit grid-cols-2 gap-3 sm:flex sm:flex-wrap" aria-label="Social media">
            {socialAccounts.filter((account) => account.href).map((account) => (
              <li key={account.id}>
                <a href={account.href} target="_blank" rel="noreferrer" aria-label={account.label} className="grid h-10 w-10 place-items-center rounded-full border border-surface/25 text-surface/75 transition hover:border-brand-lift hover:text-brand-lift">
                  <SocialIcon id={account.id} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-surface/15">
        <div className="shell flex flex-wrap justify-between gap-3 py-5 text-fine text-surface/50">
          <span>
            © {new Date().getFullYear()} {longName}, {institution}.
          </span>
        </div>
      </div>
    </footer>
  );
}
