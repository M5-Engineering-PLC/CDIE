"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { AtcServiceId } from "@/components/studio/atc-3js";

const Atc3D = dynamic(
  () => import("@/components/studio/atc-3js").then((module) => module.Atc3D),
  {
    ssr: false,
    loading: () => (
      <div className="grid aspect-video min-h-96 place-items-center border border-line bg-raise">
        <p className="text-fine text-ink-3">Loading the ATC room lab…</p>
      </div>
    ),
  },
);

const serviceGroups: { id: AtcServiceId; name: string; description: string }[] = [
  { id: "metalworking", name: "Metalworking", description: "Fabrication benches, TOTAL vice, welder & grinder" },
  { id: "woodworking", name: "Woodworking", description: "CNC router & CAD/CAM desk inside container" },
  { id: "laser-cutting", name: "Laser cutting", description: "CO2 laser cutter along rear window wall" },
  { id: "tooling-storage", name: "Tool storage", description: "Heavy-duty tool shelving inside container" },
  { id: "facility-access", name: "Room structure", description: "Container booth and entrance gateway" },
];

export function AtcLab() {
  const [active, setActive] = useState<AtcServiceId | null>(null);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="flex min-w-0 flex-col gap-3" aria-label="Interactive ATC room model">
        <Atc3D active={active} onSelect={setActive} initialView="isometric" interactive />
        <p className="text-fine text-ink-3">
          Drag to rotate. Scroll to zoom. Select equipment in the model or use the list to highlight an area.
        </p>
      </section>

      <aside className="flex flex-col gap-4 border border-line bg-surface p-5" aria-label="ATC lab controls">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="kicker">Interactive mode</p>
            <h2 className="mt-1 text-body font-semibold text-ink">Explore an area</h2>
          </div>
          <span className="border border-line px-2 py-1 font-mono text-[0.625rem] uppercase tracking-wider text-brand">
            Review
          </span>
        </div>

        <ul className="flex flex-col gap-2">
          {serviceGroups.map((service) => {
            const selected = active === service.id;
            return (
              <li key={service.id}>
                <button
                  type="button"
                  onClick={() => setActive(selected ? null : service.id)}
                  aria-pressed={selected}
                  className={`flex w-full items-start justify-between gap-3 border px-3 py-2.5 text-left transition-colors ${
                    selected ? "border-brand bg-raise" : "border-line hover:border-brand"
                  }`}
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="text-fine font-medium text-ink">{service.name}</span>
                    <span className="text-[0.6875rem] leading-relaxed text-ink-3">{service.description}</span>
                  </span>
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => setActive(null)}
          disabled={active === null}
          className="self-start text-fine font-medium text-brand underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-ink-3"
        >
          Clear selection
        </button>

        <div className="mt-auto border-t border-line pt-4">
          <p className="text-[0.6875rem] uppercase tracking-wider text-ink-3">Build branch</p>
          <p className="mt-1 break-all font-mono text-fine text-ink-2">atc-latest</p>
        </div>
      </aside>
    </div>
  );
}
