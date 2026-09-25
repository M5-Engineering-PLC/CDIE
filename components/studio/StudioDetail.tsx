// Actual Copy: Design Studio capability detail and enquiry wording.

import type { ExplorerCapability } from "./explorerModel";

export function StudioDetail({ selected }: { selected: ExplorerCapability }) {
  return (
    <div className="hidden min-w-0 flex-col gap-4 md:flex">
      {selected.modelGroup || selected.atc ? (
        <p className="kicker">
          {selected.modelGroup ? "Highlighted in the room" : `Held at the ${selected.spaceName}`}
        </p>
      ) : null}
      <h3 className="display text-sub leading-snug">{selected.headline}</h3>
      <p className="text-body leading-relaxed text-ink-2">{selected.body}</p>

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
