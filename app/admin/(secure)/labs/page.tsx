import Link from "next/link";

import { adminLabs } from "@/lib/admin/labs";

export const dynamic = "force-dynamic";

export default function AdminLabsPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-6 md:p-10">
      <header className="flex flex-col gap-2">
        <p className="kicker">Experimental builds</p>
        <h1 className="text-head text-ink">Labs</h1>
        <p className="max-w-[68ch] text-body leading-relaxed text-ink-2">
          Review interactive builds here before they appear on the public website.
        </p>
      </header>

      <section aria-labelledby="available-labs" className="flex flex-col gap-4">
        <h2 id="available-labs" className="kicker">Available labs</h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {adminLabs.map((lab) => (
            <li key={lab.id}>
              <Link
                href={lab.href}
                className="group flex h-full flex-col gap-5 border border-line bg-surface p-5 transition-colors hover:border-brand"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-body font-semibold text-ink">{lab.name}</h3>
                    <p className="text-fine text-ink-3">{lab.description}</p>
                  </div>
                  <span className="shrink-0 border border-line px-2 py-1 font-mono text-[0.625rem] uppercase tracking-wider text-brand">
                    {lab.status}
                  </span>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <span className="font-mono text-fine text-ink-3">{lab.branch}</span>
                  <span className="text-fine font-medium text-brand group-hover:underline">Open lab →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
