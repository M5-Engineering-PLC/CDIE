// Index of the Three.js isolation harnesses. Not a website surface.

import Link from "next/link";

const labs = [
  { href: "/lab/design-studio", name: "design-studio-3js", note: "Design Studio room, 10.8 x 7.4 x 3.2 m, illustrative" },
  { href: "/lab/atc", name: "atc-3js", note: "ATC prototyping workshop, 12.8 x 8.8 x 2.6 m, illustrative" },
];

export default function LabIndexPage() {
  return (
    <main className="mx-auto flex max-w-[60ch] flex-col gap-4 p-10">
      <h1 className="font-mono text-fine uppercase tracking-widest text-ink-3">Model lab</h1>
      <p className="text-body text-ink-2">
        Each route mounts one Three.js package on its own, with nothing from the site around
        it. Neither model is measured, so nothing seen here is a statement about the rooms.
      </p>
      <ul className="flex flex-col gap-2">
        {labs.map((lab) => (
          <li key={lab.href}>
            <Link href={lab.href} className="block border border-line px-4 py-3">
              <span className="block text-body text-ink">{lab.name}</span>
              <span className="block text-fine text-ink-3">{lab.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
