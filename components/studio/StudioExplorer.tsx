"use client";

/*
  Lucid: Design Studio, the seven capability blocks.
  Behaviour: the flow brief's explorer — capability list, media stage, compact
  room navigator, inline detail, and one selected id driving all four.

  The rule this component exists to keep: a capability with no known position
  highlights nothing. Metalworking, textiles and woodworking sit at the ATC and
  their locations are undocumented, so the plan stays unlit and the panel says
  so rather than inventing a place for them.

  Nothing here imports from content/. The page maps records onto this view model.
*/

import { useEffect, useState } from "react";

import { RoomPlan } from "./RoomPlan";
import type { ServiceId } from "./studioLayout";

export type ExplorerCapability = {
  id: string;
  name: string;
  spaceName: string;
  headline: string;
  body: string;
  modelGroup: ServiceId | null;
  pending: readonly string[];
  enquiry: string;
  enquiryHref: string;
};

export type StudioExplorerProps = {
  capabilities: ExplorerCapability[];
  initialId: string;
};

export function StudioExplorer({ capabilities, initialId }: StudioExplorerProps) {
  const [selectedId, setSelectedId] = useState(initialId);
  const selected =
    capabilities.find((item) => item.id === selectedId) ?? capabilities[0];

  // Keep the selection shareable: /design-studio?service=electronics
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("service") === selectedId) return;
    url.searchParams.set("service", selectedId);
    window.history.replaceState(null, "", url);
  }, [selectedId]);

  if (!selected) return null;

  return (
    <div className="grid border border-line lg:grid-cols-[16rem_1fr]">
      <div className="border-b border-line bg-raise py-5 lg:border-b-0 lg:border-r">
        <p className="kicker px-5 pb-3">Explore the studio</p>
        <ul>
          {capabilities.map((capability, index) => {
            const active = capability.id === selected.id;
            return (
              <li key={capability.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(capability.id)}
                  aria-pressed={active}
                  className={`grid w-full grid-cols-[1.75rem_1fr_auto] items-center gap-2 border-l-[3px] px-5 py-2.5 text-left text-body transition-colors ${
                    active
                      ? "border-brand-live bg-surface font-medium text-ink"
                      : "border-transparent text-ink-2 hover:bg-surface"
                  }`}
                >
                  <span
                    className={`font-mono text-fine ${active ? "text-brand-live" : "text-ink-3"}`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{capability.name}</span>
                  <span className="font-mono text-[0.625rem] uppercase tracking-widest text-ink-3">
                    {capability.spaceName}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-8 bg-surface p-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="flex min-w-0 flex-col gap-3">
          <RoomPlan active={selected.modelGroup} />
          <p className="text-fine text-ink-3">
            Illustrative and unmeasured. The room follows a hand sketch and three wall
            photographs, normalised so it can be corrected when measurements exist.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <p className="kicker">
            {selected.modelGroup ? "Highlighted in the room" : "No mapped area"}
          </p>
          <h3 className="display text-sub leading-snug">{selected.headline}</h3>
          <p className="text-body leading-relaxed text-ink-2">{selected.body}</p>

          {selected.modelGroup === null ? (
            <p className="border-l-2 border-flag/60 bg-flag-wash/50 px-4 py-3 text-fine text-ink-2">
              Held at the ATC. Its position is not documented, so nothing lights up in the
              plan and nothing is guessed. Photographs and the service text carry this one.
            </p>
          ) : null}

          {selected.pending.length > 0 ? (
            <ul className="flex flex-col gap-1.5 border-t border-line pt-4">
              {selected.pending.map((item) => (
                <li key={item} className="text-fine text-ink-2">
                  <span className="mr-2 font-mono text-[0.625rem] uppercase tracking-widest text-flag-ink">
                    pending
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          ) : null}

          <a href={selected.enquiryHref} className="text-body font-medium text-brand">
            {selected.enquiry} →
          </a>
        </div>
      </div>
    </div>
  );
}
