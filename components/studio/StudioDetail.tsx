// Actual Copy: Design Studio capability detail and enquiry wording.

import type { ExplorerCapability } from "./explorerModel";

export function StudioDetail({ selected }: { selected: ExplorerCapability }) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <p className="kicker">
        {selected.modelGroup
          ? "Highlighted in the room"
          : selected.atc
            ? `Held at the ${selected.spaceName}`
            : "No mapped area"}
      </p>
      <h3 className="display text-sub leading-snug">{selected.headline}</h3>
      <p className="trim-mobile text-body leading-relaxed text-ink-2">{selected.body}</p>

      {/*
        Two different silences, and they must not be confused. A capability at
        the ATC is elsewhere, which the ATC view already says. One in this room
        with no recorded position is genuinely undocumented, and saying so is
        the point: the plan stays unlit rather than guessing at a bench.
      */}
      {selected.modelGroup === null && !selected.atc ? (
        <p className="border-l-2 border-brand-lift bg-raise px-4 py-3 text-body text-ink-2">
          {`Nothing documents where ${selected.name.toLowerCase()} sits in the room, so the plan stays unlit rather than guessing at a bench.`}
        </p>
      ) : null}

      {selected.pending.length > 0 ? (
        <p className="border-t border-line pt-4 text-body text-ink-2">
          {`For ${selected.pending
            .map((item) => item.charAt(0).toLowerCase() + item.slice(1))
            .join(", ")
            .replace(/, ([^,]*)$/, " and $1")}, ask the team.`}
        </p>
      ) : null}

      <a href={selected.enquiryHref} className="text-body font-medium text-brand hover:text-brand-live">
        {selected.enquiry}
      </a>
    </div>
  );
}
