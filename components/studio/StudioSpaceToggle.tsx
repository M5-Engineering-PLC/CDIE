// Lucid: Design Studio, virtual tour first. Switches the stage between the two spaces.

export function StudioSpaceToggle({ isAtc, onSwitch }: { isAtc: boolean; onSwitch: (space: "studio" | "atc") => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line pb-2.5">
      <div className="flex items-center gap-1.5" role="tablist" aria-label="Floor plan facility view">
        <button
          type="button" role="tab" aria-selected={!isAtc} onClick={() => onSwitch("studio")}
          className={`px-3 py-1 text-fine font-medium transition-colors ${!isAtc ? "border-b-2 border-brand text-brand" : "text-ink-3 hover:text-ink-2"}`}
        >
          Graduate School
        </button>
        <button
          type="button" role="tab" aria-selected={isAtc} onClick={() => onSwitch("atc")}
          className={`px-3 py-1 text-fine font-medium transition-colors ${isAtc ? "border-b-2 border-brand text-brand" : "text-ink-3 hover:text-ink-2"}`}
        >
          ATC Workshop
        </button>
      </div>
      {/* Enhancements 2026-09-22: "remove dimensions on atc hub". */}
      <span className="hidden font-mono text-[0.6875rem] text-ink-3 uppercase tracking-wider md:inline">
        {isAtc ? "Prototyping Hub" : "Shared Workspace & Labs"}
      </span>
    </div>
  );
}
