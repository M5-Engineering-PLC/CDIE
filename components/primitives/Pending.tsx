/*
  Primitive. Stands where a fact the source has not confirmed would otherwise go.

  Decision PEND, 2026-09-11. The rule is unchanged and Gate 6 still checks it:
  an unconfirmed fact never publishes as a claim. What changed is the voice. The
  earlier version listed each gap behind a monospace "pending" marker, which
  read as build-log language on a public page. It now reads as an invitation,
  names the subjects in one plain sentence, and points at the enquiry.
*/

import Link from "next/link";

export type PendingProps = {
  items: readonly string[];
  /** overrides the default sentence where a page needs its own wording */
  lead?: string;
  /** where the reader is sent to ask */
  href?: string;
  label?: string;
};

function sentence(items: readonly string[]) {
  const parts = items.map((item) => item.charAt(0).toLowerCase() + item.slice(1));
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

export function Pending({
  items,
  lead,
  href = "/contact?topic=general",
  label = "Contact us for current details",
}: PendingProps) {
  if (items.length === 0) return null;

  return (
    <p className="border-l-2 border-brand-lift bg-surface py-3 pl-4 text-body text-ink-2">
      {lead ?? `For ${sentence(items)}, please ask the team directly.`}{" "}
      <Link href={href} className="font-medium text-brand hover:text-brand-live">
        {label}
      </Link>
    </p>
  );
}
