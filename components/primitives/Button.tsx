// Primitive. Source: cdie_landing_concepts v2 tokens; labels come from Actual Copy.
/*
  Change request 2026-09-21, section 2: "remove arrows on links". The trailing
  glyph is gone from every button and link label on the site. The external case
  keeps its screen-reader note, because that one carries information a sighted
  reader gets from the browser rather than from a decoration.
*/

import Link from "next/link";
import type { ReactNode } from "react";

type Tone = "solid" | "outline" | "quiet";

const tones: Record<Tone, string> = {
  solid:
    "bg-brand text-surface border border-brand hover:bg-brand-live hover:border-brand-live",
  outline:
    "bg-transparent text-brand border border-brand/40 hover:border-brand hover:bg-brand/5",
  quiet:
    "bg-transparent text-ink border-b border-ink/30 hover:border-ink rounded-none px-0 py-1",
};

export type ButtonProps = {
  href: string;
  children: ReactNode;
  tone?: Tone;
  external?: boolean;
  className?: string;
};

export function Button({
  href,
  children,
  tone = "solid",
  external = false,
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 rounded-edge px-4 py-2.5 text-body font-medium transition-colors";
  const classes = `${base} ${tones[tone]} ${className}`.trim();

  if (external) {
    return (
      <a className={classes} href={href} target="_blank" rel="noreferrer">
        {children}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link className={classes} href={href}>{children}</Link>
  );
}
