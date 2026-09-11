"use client";

// Lucid: nav order Home > Programmes > Design Studio > Media > About Us > Contact.
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
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="shell flex items-center justify-between gap-6 py-3">
        <Link href="/" className="flex items-center gap-3 no-underline" aria-label="CDIE home">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            priority
            className="h-9 w-auto md:h-10"
          />
          <span className="hidden border-l border-line pl-3 text-fine leading-tight text-ink-2 xl:block">
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
                      isCurrent(item.href)
                        ? "text-brand [box-shadow:inset_0_-2px_0_0_currentColor]"
                        : "text-ink-2 hover:text-ink"
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
              className="rounded-edge border border-brand/40 px-3.5 py-2 text-body font-medium text-brand no-underline transition-colors hover:border-brand hover:bg-brand hover:text-surface"
            >
              {login.label}
              <span aria-hidden="true"> ↗</span>
            </a>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="rounded-edge border border-line px-3 py-2 text-fine lg:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Main"
        hidden={!open}
        className="border-t border-line bg-surface lg:hidden"
      >
        <ul className="shell flex flex-col py-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                className={`block border-b border-line-soft py-3 text-lead no-underline ${
                  isCurrent(item.href) ? "text-brand" : "text-ink"
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
                className="block py-3 text-lead font-medium text-brand no-underline"
              >
                {login.label}
                <span aria-hidden="true"> ↗</span>
              </a>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
}
