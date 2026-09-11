"use client";

// Lucid: nav order Home > Programmes > Design Studio > Media > About Us > Contact.
// All six labels visible on desktop; a labelled menu on mobile.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import type { NavItem } from "@/content/types";

export type SiteNavProps = {
  items: NavItem[];
  name: string;
  longName: string;
  institution: string;
};

export function SiteNav({ items, name, longName, institution }: SiteNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="shell flex items-center justify-between gap-6 py-3">
        <Link href="/" className="flex items-baseline gap-3 no-underline">
          <span className="display text-sub font-medium text-ink">{name}</span>
          <span className="hidden border-l border-line pl-3 text-fine leading-tight text-ink-2 sm:block">
            {institution}
            <br />
            {longName}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
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
        </ul>
      </nav>
    </header>
  );
}
