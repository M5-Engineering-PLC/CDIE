"use client";

// Lucid: Design Studio, the seven capability blocks.
// Split from StudioExplorer so neither file passes the 150-line rule.
// The number is the tour's running order, which is what the callout counts.
/*
  Change request 2026-09-21, section 1: a phone shows half the band. Seven
  stacked rows put the room a screen and a half below the fold, so on a phone
  the list is a scrolling row of chips and the room sits above it. From lg it
  is the column beside the room it has always been.
*/

export type CapabilityListItem = {
  id: string;
  name: string;
  spaceName: string;
};

export function StudioCapabilityList({
  items,
  selectedId,
  onSelect,
}: {
  items: CapabilityListItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="rail auto-cols-max gap-px lg:grid-flow-row lg:auto-cols-auto lg:overflow-visible">
      {items.map((item, index) => {
        const active = item.id === selectedId;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              aria-pressed={active}
              className={`flex w-full items-center gap-2 whitespace-nowrap border-b-[3px] px-4 py-2.5 text-left text-body transition-colors lg:grid lg:grid-cols-[1.75rem_1fr_auto] lg:whitespace-normal lg:border-b-0 lg:border-l-[3px] lg:px-5 ${
                active
                  ? "border-brand-live bg-surface font-medium text-ink"
                  : "border-transparent text-ink-2 hover:bg-surface"
              }`}
            >
              <span className={`font-mono text-fine ${active ? "text-brand-live" : "text-ink-3"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item.name}</span>
              <span className="hidden font-mono text-[0.625rem] uppercase tracking-widest text-ink-3 lg:block">
                {item.spaceName}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
