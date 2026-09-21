// Change request 2026-09-13: marks placeholder content during layout review.
/*
  Sits directly above any band fed from content/samples.ts. AGENTS.md forbids
  publishing an invented date, person or testimonial as a claim; this is what
  keeps sample data on the right side of that rule while the layout is reviewed.

  It uses the flag tokens, the same vocabulary the build already uses for
  unconfirmed facts, so it reads as a build state rather than site furniture.
  It disappears with content/samples.ts.
*/

export function SampleNotice({ what }: { what: string }) {
  return (
    <p
      role="note"
      className="mb-6 border-l-2 border-flag bg-flag-wash px-4 py-3 text-body text-flag-ink"
    >
      <strong className="font-semibold">Sample content.</strong> These {what} are
      invented and shown only so the layout can be reviewed. Nothing here is a
      published fact, and none of it ships.
    </p>
  );
}
