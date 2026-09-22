// Admin dashboard index. Internal tooling, not a website surface.

import Link from "next/link";

const tools = [
  {
    href: "/admin/models/design-studio",
    name: "Design Studio model",
    note: "design-studio-3js, 10.8 x 7.4 x 3.2 m, illustrative",
  },
  {
    href: "/admin/models/atc",
    name: "ATC workshop model",
    note: "atc-3js, 12.8 x 8.8 x 2.6 m, illustrative",
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto flex max-w-[70ch] flex-col gap-6 p-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-h2 text-ink">Dashboard</h1>
        <p className="text-body text-ink-2">
          Tools for building the site, kept off the viewer side of it. What is shown here is
          working material: neither room model is measured, so nothing on these pages is a
          statement about the real rooms.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-fine uppercase tracking-widest text-ink-3">Model lab</h2>
        <ul className="flex flex-col gap-2">
          {tools.map((tool) => (
            <li key={tool.href}>
              <Link href={tool.href} className="block border border-line px-4 py-3">
                <span className="block text-body text-ink">{tool.name}</span>
                <span className="block text-fine text-ink-3">{tool.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
