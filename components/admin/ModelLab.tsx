"use client";

/*
  Admin tooling, served under /admin. Not a website surface.

  The isolation harness for the two Three.js packages, so their geometry,
  lighting and camera can be worked on without the studio explorer, its
  content records or its tour state around them. It renders no copy from
  content/, and no viewer page links to it.
*/

import { useState, type ReactNode } from "react";

export type LabStation = {
  id: string;
  number: number;
  label: string;
  service: string;
};

export type LabViewerState = {
  active: string | null;
  tour: boolean;
  interactive: boolean;
  onSelect: (service: string) => void;
};

export type ModelLabProps = {
  title: string;
  room: { width: number; depth: number; height: number };
  isMeasured: boolean;
  stations: readonly LabStation[];
  children: (state: LabViewerState) => ReactNode;
};

export function ModelLab({ title, room, isMeasured, stations, children }: ModelLabProps) {
  const [active, setActive] = useState<string | null>(null);
  const [tour, setTour] = useState(false);
  const [interactive, setInteractive] = useState(true);
  const [log, setLog] = useState<string[]>([]);

  const onSelect = (service: string) => {
    setActive(service);
    setLog((prev) => [`${new Date().toLocaleTimeString()}  onSelect("${service}")`, ...prev].slice(0, 8));
  };

  const services = Array.from(new Set(stations.map((station) => station.service)));

  return (
    <main className="grid min-h-screen grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_20rem]">
      <section className="min-w-0">
        <h1 className="mb-4 font-mono text-fine uppercase tracking-widest text-ink-3">{title}</h1>
        <div key={`${tour}-${interactive}`}>{children({ active, tour, interactive, onSelect })}</div>
      </section>

      <aside className="flex flex-col gap-5 text-fine">
        <div>
          <h2 className="mb-2 font-mono text-[0.625rem] uppercase tracking-widest text-ink-3">Room</h2>
          <p className="text-ink-2">
            {`${room.width} x ${room.depth} x ${room.height} m`}
          </p>
          <p className="text-ink-3">{isMeasured ? "Measured plan" : "Illustrative, not measured"}</p>
        </div>

        <div>
          <h2 className="mb-2 font-mono text-[0.625rem] uppercase tracking-widest text-ink-3">Mode</h2>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setTour((prev) => !prev)}
              aria-pressed={tour}
              className={`border border-line px-3 py-1.5 ${tour ? "bg-brand text-surface" : "text-ink-2"}`}
            >
              tour: {tour ? "on" : "off"}
            </button>
            <button
              type="button"
              onClick={() => setInteractive((prev) => !prev)}
              aria-pressed={interactive}
              className={`border border-line px-3 py-1.5 ${interactive ? "bg-brand text-surface" : "text-ink-2"}`}
            >
              interactive: {interactive ? "on" : "off"}
            </button>
          </div>
        </div>

        <div>
          <h2 className="mb-2 font-mono text-[0.625rem] uppercase tracking-widest text-ink-3">
            Stations
          </h2>
          <ul className="flex flex-col gap-1">
            {stations.map((station) => (
              <li key={station.id}>
                <button
                  type="button"
                  onClick={() => onSelect(station.service)}
                  aria-pressed={active === station.service}
                  className={`w-full border border-line px-3 py-1.5 text-left ${
                    active === station.service ? "bg-brand text-surface" : "text-ink-2"
                  }`}
                >
                  {station.number}. {station.label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="w-full border border-line px-3 py-1.5 text-left text-ink-3"
              >
                clear highlight
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 font-mono text-[0.625rem] uppercase tracking-widest text-ink-3">
            Service ids
          </h2>
          <p className="break-words text-ink-3">{services.join(", ")}</p>
        </div>

        <div>
          <h2 className="mb-2 font-mono text-[0.625rem] uppercase tracking-widest text-ink-3">
            Emitted
          </h2>
          <ul className="flex flex-col gap-0.5 text-ink-3">
            {log.length === 0 ? <li>nothing yet</li> : log.map((line, index) => <li key={index}>{line}</li>)}
          </ul>
        </div>
      </aside>
    </main>
  );
}
