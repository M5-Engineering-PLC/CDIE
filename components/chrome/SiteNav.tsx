"use client";

// Review R1/R2: the logo is Home; visible links start at Programmes and end in
// LOGIN. Decision R2, 2026-09-11: the studio login joins the bar as its last
// item. The logo is the home link, so no wordmark sits beside it.
/*
  Change request 2026-09-21, second pass: "revert navbar back to cobalt blue".
  The white bar is withdrawn. The bar is solid brand again, the logo keeps the
  white plate that carries it against that ground, and the current page is full
  white against 70%, the step that holds contrast where brand-lift would not.
  The hamburger and the self-closing panel stay as the first pass left them.
*/

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { NavItem } from "@/content/types";

import { MenuIcon } from "./MenuIcon";
import { NavPanel } from "./NavPanel";

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

  /*
    A navigation closes the panel: the reader has arrived, so the menu is
    spent. Adjusted during render rather than in an effect, which is React's
    own answer for state that derives from a prop change and avoids the
    cascading second render an effect would cost.
  */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    // Reaching the desktop breakpoint reveals the full bar, so the panel is
    // redundant and would otherwise stay open behind it.
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => wide.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const login = utility[0];

  return (
    <header className="sticky top-0 z-40 border-b border-brand-lift/30 bg-brand/95 text-surface backdrop-blur">
      <div className="shell flex items-center justify-between gap-6 py-2">
        <Link href="/" className="flex items-center gap-3 rounded-edge bg-surface px-2 py-1" aria-label="CDIE home">
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
                    /* Change request 2026-09-13, section 2.2: the current page
                       is signalled by colour, not a rule under the word. On
                       the cobalt bar that step is full white against 70%. */
                    className={`text-body transition-colors ${
                      isCurrent(item.href)
                        ? "font-medium text-surface"
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
              className="rounded-edge border border-surface/50 bg-surface px-4 py-2 text-body font-semibold tracking-wide text-brand transition-colors hover:bg-brand-lift hover:text-ink"
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
          className="grid h-10 w-10 place-items-center rounded-edge border border-surface/50 text-surface lg:hidden"
        >
          <MenuIcon open={open} />
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>

      <NavPanel
        items={items}
        login={login}
        open={open}
        isCurrent={isCurrent}
        onNavigate={() => setOpen(false)}
      />
    </header>
  );
}
