"use client";

// The mobile disclosure panel. Split from SiteNav so neither file grows past
// the 150-line rule in AGENTS.md.
// Change request 2026-09-21, second pass: the panel follows the bar back to
// cobalt. Enhancements 2026-09-22: both are white again.
// Transitions branch 2026-09-29: the panel unfolds from the bar instead of
// snapping. It collapses its grid row to zero rather than using `hidden`, which
// cannot animate, and `inert` plus visibility keep the closed panel out of the
// tab order and the accessibility tree exactly as `hidden` did.

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
      inert={!open}
      data-open={open}
      className="invisible grid grid-rows-[0fr] border-t border-transparent transition-[grid-template-rows,border-color,visibility] duration-(--motion-glide) ease-(--ease-glide) data-[open=true]:visible data-[open=true]:grid-rows-[1fr] data-[open=true]:border-line bg-surface lg:hidden"
    >
      <div className="min-h-0 overflow-hidden">
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
      </div>
    </nav>
  );
}
