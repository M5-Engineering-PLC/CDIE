// Review R2: Contact block, social links, and LOGIN repeated from the main nav.
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
  socialAccounts: { id: "linkedin" | "instagram" | "facebook" | "x"; label: string; href?: string }[];
};

function SocialIcon({ id }: { id: "linkedin" | "instagram" | "facebook" | "x" }) {
  const path = {
    linkedin: "M6.5 8.5V18M6.5 5.75v.01M10.5 18v-5.25c0-2.5 4.5-2.7 4.5 0V18M10.5 8.5V18",
    instagram: "M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm8.5 3.5h.01M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
    facebook: "M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v5h4v-5h3l1-4h-4V9c0-.6.4-1 1-1Z",
    x: "m5 4 14 16M19 4 5 20",
  }[id];
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8"><path d={path} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

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
    <footer className="mt-24 border-t border-brand-lift/25 bg-ink text-surface">
      <div className="shell grid gap-10 py-16 md:grid-cols-[1.25fr_.8fr_1fr]">
        <div className="flex flex-col gap-3">
          <p className="display text-title text-surface">{name}</p>
          <p className="text-fine leading-relaxed text-surface/70">
            {longName}
            <br />
            {institution}
          </p>
          <p className="text-fine text-surface/70">{contact.campus}</p>
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
          </ul>
        </nav>

        <div>
          <p className="kicker mb-3 !text-brand-lift">Reach us</p>
          <ul className="flex flex-col gap-2 text-body text-surface/70">
            <li>
              <a href={`mailto:${contact.email}`} className="text-surface">
                {contact.email}
              </a>
            </li>
            <li>
              <a href={contact.phoneHref} className="text-surface">
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
                  className="font-mono text-fine text-brand-lift no-underline hover:text-surface"
                >
                  {item.label} ↗
                </a>
              </li>
            ))}
          </ul>
          <ul className="mt-7 flex gap-3" aria-label="Social media">
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
          <span className="font-mono">Contact the team before travelling.</span>
        </div>
      </div>
    </footer>
  );
}
