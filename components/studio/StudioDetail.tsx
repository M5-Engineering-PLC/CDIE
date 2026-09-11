// Actual Copy: Design Studio capability detail and enquiry wording.

import type { ExplorerCapability } from "./StudioExplorer";

export function StudioDetail({ selected }: { selected: ExplorerCapability }) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <p className="kicker">
        {selected.modelGroup ? "Highlighted in the room" : "No mapped area"}
      </p>
      <h3 className="display text-sub leading-snug">{selected.headline}</h3>
      <p className="text-body leading-relaxed text-ink-2">{selected.body}</p>

      {selected.modelGroup === null ? (
        <p className="border-l-2 border-brand-lift bg-raise px-4 py-3 text-body text-ink-2">
          This one is held at the ATC, beyond the room shown in the plan, so nothing
          is highlighted here.
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

      <a href={selected.enquiryHref} className="text-body font-medium text-brand">
        {selected.enquiry} →
      </a>
    </div>
  );
}
