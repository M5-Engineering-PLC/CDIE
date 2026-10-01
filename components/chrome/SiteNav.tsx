"use client";

// Review R1/R2: the logo is Home; visible links start at Programmes and end in
// LOGIN. Decision R2, 2026-09-11: the studio login joins the bar as its last
// item. The logo is the home link, so no wordmark sits beside it.
// Navbar transition reference: fixes/navbar_transtition.mp4, full two-row to single row.

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { NavItem } from "@/content/types";

import { MenuIcon } from "./MenuIcon";
import { NavPanel } from "./NavPanel";
import { useAdminEasterEgg } from "./useAdminEasterEgg";

export type SiteNavProps = {
  items: NavItem[];
  utility: NavItem[];
  name: string;
  longName: string;
  institution: string;
  logo: { src: string; alt: string; width: number; height: number };
};

export function SiteNav({ items, utility, logo }: SiteNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 72);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const isCurrent = (href: string) =>
    Boolean(pathname && (href === "/" ? pathname === "/" : pathname.startsWith(href)));

  // Close the mobile panel when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // The closing panel turns inert, which would drop focus to the page;
      // hand it back to the control that opened it, as the disclosure pattern expects.
      toggle.current?.focus();
    };
    // Reaching the desktop breakpoint reveals the full bar, so the panel is
    // redundant and would otherwise stay open behind it.
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => wide.matches && setOpen(false);
    // Review 2026-09-30: "when the navbar is open, it closes when you tap outside it".
    const onOutside = (event: PointerEvent) => {
      if (!bar.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const login = utility[0];
  const onLogoClick = useAdminEasterEgg();

  return (
    <header ref={bar} className={`site-nav sticky top-0 z-40 ${compact ? "is-compact" : ""}`}>
      <div className="site-nav-inner">
        <Link href="/" className="site-nav-brand" aria-label="CDIE home" onClick={onLogoClick}>
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            priority
            className="site-nav-logo"
          />
        </Link>

        <nav aria-label="Main" className="site-nav-links">
            <ul>
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isCurrent(item.href) ? "page" : undefined}
                    /* Current page keeps the cobalt colour and underline. */
                    className="site-nav-link"
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
              target="_blank"
              rel="noreferrer"
              className="site-login"
            >
              {login.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
        ) : null}

        <button
          ref={toggle}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="site-nav-menu grid h-10 w-10 place-items-center lg:hidden"
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
