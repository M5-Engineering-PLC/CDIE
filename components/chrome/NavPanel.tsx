"use client";

// The mobile disclosure panel. Split from SiteNav so neither file grows past
// the 150-line rule in AGENTS.md.
// Change request 2026-09-21, second pass: the panel follows the bar back to
// cobalt, so opening the menu does not drop a white sheet out of a blue bar.

import Link from "next/link";

import type { NavItem } from "@/content/types";

export type NavPanelProps = {
  items: NavItem[];
  login?: NavItem;
  open: boolean;
  isCurrent: (href: string) => boolean;
  onNavigate: () => void;
};

export function NavPanel({ items, login, open, isCurrent, onNavigate }: NavPanelProps) {
  return (
    <nav
      id="mobile-nav"
      aria-label="Main"
      hidden={!open}
      className="border-t border-brand-lift/30 bg-brand lg:hidden"
    >
      <ul className="shell flex flex-col py-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              className={`block border-b border-surface/15 py-2.5 text-lead transition-colors ${
                isCurrent(item.href) ? "font-medium text-surface" : "text-surface/75 hover:text-surface"
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
              onClick={onNavigate}
              className="block py-2.5 text-lead font-semibold text-surface"
            >
              {login.label}
            </a>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
