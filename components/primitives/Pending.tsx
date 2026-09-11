/*
  Primitive. Renders the facts a source marks [TBD] as an honest gap.

  This is the component that keeps Gate 6 passable. Nothing here reads as a
  claim: it names what is not yet confirmed and points at the enquiry, which is
  what the Actual Copy tab asks for wherever a fact is missing.
*/

export type PendingProps = {
  items: readonly string[];
  /** what the reader should do instead; defaults to the general enquiry line */
  lead?: string;
};

export function Pending({ items, lead }: PendingProps) {
  if (items.length === 0) return null;

  return (
    <div className="border-l-2 border-flag/60 bg-flag-wash/50 py-3 pl-4">
      <p className="text-fine text-ink-2">
        {lead ?? "Not confirmed yet, so it is not published here. Ask the team and they will tell you where this stands:"}
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {items.map((item) => (
          <li key={item} className="text-fine text-ink-2">
            <span className="mr-2 font-mono text-[0.625rem] uppercase tracking-widest text-flag-ink">
              pending
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
