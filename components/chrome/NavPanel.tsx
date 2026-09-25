"use client";

// The mobile disclosure panel. Split from SiteNav so neither file grows past
// the 150-line rule in AGENTS.md.
// Change request 2026-09-21, second pass: the panel follows the bar back to
// cobalt. Enhancements 2026-09-22: both are white again.

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
      className="border-t border-line bg-surface lg:hidden"
    >
      <ul className="shell flex flex-col py-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              className={`block border-b border-line py-2.5 text-lead transition-colors ${
                isCurrent(item.href) ? "font-medium text-brand" : "text-ink-2 hover:text-brand"
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
              target="_blank"
              rel="noreferrer"
              onClick={onNavigate}
              className="block py-2.5 text-lead font-semibold text-ink-2 transition-colors hover:text-brand"
            >
              {login.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
