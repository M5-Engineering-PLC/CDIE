"use client";

/*
  Lucid: Design Studio, the seven capability blocks. Behaviour: the flow
  brief's explorer — capability list, media stage, compact room navigator and
  inline detail, with one selected id driving all four.

  The rule this component exists to keep: a capability with no known position
  highlights nothing. Three of the seven have no documented position, so the
  plan stays unlit and the panel says so rather than inventing a place for them.

  Change request 2026-09-21, section 4. The tour is now a tour: starting it
  opens the room, turns it slowly and constantly, and walks the capabilities in
  order, each arriving with its callout and the tiles for what that area
  covers. Choosing from the list takes the tour there and carries on from it.

  Nothing here imports from content/. The page maps records onto this view model.
*/

import { useCallback, useEffect, useState } from "react";

import { StudioCapabilityList } from "./StudioCapabilityList";
import { StudioComponentGrid } from "./StudioComponentGrid";
import { StudioRailThumb } from "./StudioRailThumb";
import { StudioDetail } from "./StudioDetail";
import { StudioStage } from "./StudioStage";
import { StudioTourIntro } from "./StudioTourIntro";
import { useViewOnly } from "./useViewOnly";
import type { ExplorerCapability } from "./explorerModel";
import type { ServiceId } from "./studioLayout";

export type { ExplorerCapability, ExplorerComponent } from "./explorerModel";

export type StudioExplorerProps = {
  capabilities: ExplorerCapability[];
  initialId: string;
};

/** How long the tour rests on one capability before moving to the next. */
const STEP_MS = 7000;

export function StudioExplorer({ capabilities, initialId }: StudioExplorerProps) {
  const [selectedId, setSelectedId] = useState(initialId);
  const [roomOpen, setRoomOpen] = useState(false);
  const [tour, setTour] = useState(false);
  const viewOnly = useViewOnly();

  const index = Math.max(0, capabilities.findIndex((item) => item.id === selectedId));
  const selected = capabilities[index] ?? capabilities[0];

  const startTour = () => {
    setRoomOpen(true);
    setTour(true);
    window.requestAnimationFrame(() => {
      document.getElementById("studio-room")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  /* The walk. Each rest advances the selection, moving list, panel, tiles and
     camera together. Selecting by hand resets the rest, because `index` is a
     dependency: the tour continues from wherever the reader took it. */
  useEffect(() => {
    if (!tour || !roomOpen || capabilities.length < 2) return;
    const timer = window.setTimeout(() => {
      setSelectedId(capabilities[(index + 1) % capabilities.length].id);
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [capabilities, index, roomOpen, tour]);

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
        <div className="border-b border-line bg-raise py-4 lg:border-b-0 lg:border-r lg:py-5">
          <p className="kicker px-5 pb-3">Explore the studio</p>
          <StudioCapabilityList
            items={capabilities}
            selectedId={selected.id}
            onSelect={setSelectedId}
          />
          <StudioRailThumb
            active={selected.modelGroup}
            open={roomOpen}
            onOpen={() => { setRoomOpen(true); setTour(true); }}
          />
        </div>

        <div className="grid gap-6 bg-surface p-4 md:p-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            <StudioStage
              active={selected.modelGroup}
              open={roomOpen}
              tour={tour}
              viewOnly={viewOnly}
              atc={selected.atc}
              name={selected.name}
              spaceName={selected.spaceName}
              headline={selected.headline}
              step={index + 1}
              of={capabilities.length}
              image={selected.image}
              imageAlt={`${selected.name} at the CDIE Design Studio`}
              onSelect={selectByModelGroup}
              onClose={() => { setRoomOpen(false); setTour(false); }}
              onOpen={() => { setRoomOpen(true); setTour(true); }}
              onToggleTour={() => setTour((running) => !running)}
            />
            <StudioComponentGrid items={selected.components} capabilityName={selected.name} />
          </div>

          <StudioDetail selected={selected} />
        </div>
      </div>
    </div>
  );
}
