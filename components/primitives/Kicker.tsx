// Primitive. An eyebrow label. Structure only, never a claim.

import type { ReactNode } from "react";

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="kicker">{children}</p>;
}

export type ChipStatus = "open" | "soon" | "enquire";

const chipTone: Record<ChipStatus, string> = {
  open: "bg-moss/10 text-moss border-moss/30",
  soon: "bg-flag-wash text-flag-ink border-flag/40",
  enquire: "bg-ink/5 text-ink-2 border-line",
};

const chipLabel: Record<ChipStatus, string> = {
  open: "Open now",
  soon: "Opening soon",
  enquire: "Ask the team",
};

export function Chip({ status }: { status: ChipStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-edge border px-2 py-0.5 font-mono text-[0.6875rem] tracking-wide ${chipTone[status]}`}
    >
      {chipLabel[status]}
    </span>
  );
}
