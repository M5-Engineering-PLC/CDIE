// Primitive. An eyebrow label. Structure only, never a claim.

import type { ReactNode } from "react";

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="kicker">{children}</p>;
}

export type ChipStatus = "open" | "soon" | "enquire";

const chipTone: Record<ChipStatus, string> = {
  open: "bg-moss/10 text-moss border-moss/30",
  soon: "bg-flag-wash text-flag-ink border-flag/40",
  enquire: "",
};

const chipLabel: Record<ChipStatus, string | null> = {
  open: "Open now",
  soon: "Opening soon",
  /*
    Change request 2026-09-21, section 3: "remove ask the team buttons". Every
    opportunity carries status "enquire", so the chip appeared on all five and
    told the reader nothing they could act on; the enquiry route is the button
    at the foot of each card. The status stays in the data, because "open" and
    "soon" are real states the moment a source confirms one.
  */
  enquire: null,
};

export function Chip({ status }: { status: ChipStatus }) {
  const label = chipLabel[status];
  if (!label) return null;

  return (
    <span
      className={`inline-flex items-center rounded-edge border px-2 py-0.5 font-mono text-[0.6875rem] tracking-wide ${chipTone[status]}`}
    >
      {label}
    </span>
  );
}
