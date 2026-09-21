"use client";

/*
  Change request 2026-09-21, section 4: "maybe with some text boxes jumping up
  into someone's view when the path is crossed".

  The camera passes each area in turn; this is the box that arrives with it. It
  rises from the foot of the canvas as the room settles on a new station and
  leaves the same way, so the reader is told what they are looking at without
  having to look away from the room to find out.

  It carries only the capability's own name, area and headline. Nothing is
  counted, measured or named beyond what the source says.
*/

export type StudioCalloutProps = {
  show: boolean;
  name: string;
  spaceName: string;
  headline: string;
  step: number;
  of: number;
};

export function StudioCallout({ show, name, spaceName, headline, step, of }: StudioCalloutProps) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none absolute inset-x-3 bottom-3 transition-all duration-500 ease-out md:inset-x-5 md:bottom-5 md:max-w-sm ${
        show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div className="border border-line bg-surface/95 p-4 shadow-lg backdrop-blur">
        <p className="flex items-baseline justify-between gap-3 font-mono text-[0.625rem] uppercase tracking-widest text-ink-3">
          <span>{spaceName}</span>
          <span>
            {step} / {of}
          </span>
        </p>
        <h3 className="display mt-2 text-sub leading-snug text-ink">{name}</h3>
        <p className="mt-1 text-body leading-relaxed text-ink-2">{headline}</p>
      </div>
    </div>
  );
}
