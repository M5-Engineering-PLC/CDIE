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

import { useCallback, useEffect, useState } from "react";

import { StudioRailThumb } from "./StudioRailThumb";
import { StudioDetail } from "./StudioDetail";
import { StudioStage } from "./StudioStage";
import { StudioTourIntro } from "./StudioTourIntro";
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
  image: string;
};

export type StudioExplorerProps = {
  capabilities: ExplorerCapability[];
  initialId: string;
};

export function StudioExplorer({ capabilities, initialId }: StudioExplorerProps) {
  const [selectedId, setSelectedId] = useState(initialId);
  const [roomOpen, setRoomOpen] = useState(false);
  const selected =
    capabilities.find((item) => item.id === selectedId) ?? capabilities[0];

  const startTour = () => {
    setRoomOpen(true);
    window.requestAnimationFrame(() => {
      document.getElementById("studio-room")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  /* The room emits a model group, not a capability. Map it back so selecting a
     bench moves the list and the panel with it. A group nothing claims is
     ignored rather than guessed at. */
  const selectByModelGroup = useCallback(
    (group: ServiceId) => {
      const match = capabilities.find((item) => item.modelGroup === group);
      if (match) setSelectedId(match.id);
    },
    [capabilities],
  );

  // Keep the selection shareable: /design-studio?service=electronics
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("service") === selectedId) return;
    url.searchParams.set("service", selectedId);
    window.history.replaceState(null, "", url);
  }, [selectedId]);

  if (!selected) return null;

  return (
    <div className="overflow-hidden border border-line bg-surface">
      <StudioTourIntro onStart={startTour} />
      <div id="studio-room" className="grid scroll-mt-20 lg:grid-cols-[16rem_1fr]">
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

        <StudioRailThumb
          active={selected.modelGroup}
          open={roomOpen}
          onOpen={() => setRoomOpen(true)}
        />
      </div>

      <div className="grid gap-8 bg-surface p-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <StudioStage
          active={selected.modelGroup}
          open={roomOpen}
          image={selected.image}
          imageAlt={`${selected.name} at the CDIE Design Studio`}
          onSelect={selectByModelGroup}
          onClose={() => setRoomOpen(false)}
          onOpen={() => setRoomOpen(true)}
        />

        <StudioDetail selected={selected} />
      </div>
      </div>
    </div>
  );
}
