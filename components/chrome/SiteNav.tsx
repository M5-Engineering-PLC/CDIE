"use client";

// Review R1/R2: the logo is Home; visible links start at Programmes and end in LOGIN.
// Decision R2, 2026-09-11: the studio login joins the bar as its last item.
// The logo is the home link, so no wordmark sits beside it.

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import type { NavItem } from "@/content/types";

export type SiteNavProps = {
  items: NavItem[];
  utility: NavItem[];
  name: string;
  longName: string;
  institution: string;
  logo: { src: string; alt: string; width: number; height: number };
};

export function SiteNav({ items, utility, longName, institution, logo }: SiteNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const login = utility[0];

  return (
    <header className="sticky top-0 z-40 border-b border-brand-lift/30 bg-brand/95 text-surface backdrop-blur">
      <div className="shell flex items-center justify-between gap-6 py-2">
        <Link href="/" className="flex items-center gap-3 rounded-edge bg-surface px-2 py-1 no-underline" aria-label="CDIE home">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            priority
            className="h-12 w-auto md:h-14"
          />
          <span className="hidden border-l border-line pl-3 text-fine leading-tight text-ink-2 2xl:block">
            {institution}
            <br />
            {longName}
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          <nav aria-label="Main">
            <ul className="flex items-center gap-7">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isCurrent(item.href) ? "page" : undefined}
                    className={`text-body no-underline transition-colors ${
                      /*
                        Change request 2026-09-13, section 2.2: the current page
                        is signalled by colour, not a rule under the word. Full
                        white against 70% is a clear step and keeps contrast on
                        the brand header, where brand-lift would not.
                      */
                      isCurrent(item.href)
                        ? "text-surface"
                        : "text-surface/70 hover:text-surface"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {login ? (
            <a
              href={login.href}
              className="rounded-edge border border-surface/50 bg-surface px-4 py-2 text-body font-semibold tracking-wide text-brand no-underline transition-colors hover:bg-brand-lift hover:text-ink"
            >
              {login.label}
            </a>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="rounded-edge border border-surface/50 px-3 py-2 text-fine text-surface lg:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Main"
        hidden={!open}
        className="border-t border-brand-lift/30 bg-brand lg:hidden"
      >
        <ul className="shell flex flex-col py-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                className={`block border-b border-surface/15 py-3 text-lead no-underline ${
                  isCurrent(item.href) ? "text-surface" : "text-surface/75"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {login ? (
            <li>
              <a
                href={login.href}
                onClick={() => setOpen(false)}
                className="block py-3 text-lead font-semibold text-surface no-underline"
              >
                {login.label}
              </a>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
}
