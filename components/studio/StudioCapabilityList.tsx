"use client";

// Lucid: Design Studio, the seven capability blocks.
// Split from StudioExplorer so neither file passes the 150-line rule.
// The number is the tour's running order, which is what the callout counts.

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
    <ul>
      {items.map((item, index) => {
        const active = item.id === selectedId;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              aria-pressed={active}
              className={`grid w-full grid-cols-[1.75rem_1fr_auto] items-center gap-2 border-l-[3px] px-5 py-2.5 text-left text-body transition-colors ${
                active
                  ? "border-brand-live bg-surface font-medium text-ink"
                  : "border-transparent text-ink-2 hover:bg-surface"
              }`}
            >
              <span className={`font-mono text-fine ${active ? "text-brand-live" : "text-ink-3"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item.name}</span>
              <span className="font-mono text-[0.625rem] uppercase tracking-widest text-ink-3">
                {item.spaceName}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
