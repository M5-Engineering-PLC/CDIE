"use client";

/*
  Lucid: Design Studio, the seven capability blocks. Behaviour: the flow
  brief's explorer — capability list, media stage, compact room navigator and
  inline detail, with one selected id driving all four.

  Change request 2026-09-21, section 4:
  - Tour mode with callout and component tiles.
  - Interactive 3D room and floor plan for both Graduate School and ATC Workshop.
  - Space switcher (Graduate School <-> ATC Workshop).
*/

import { useCallback, useEffect, useState } from "react";

import { StudioCapabilityList } from "./StudioCapabilityList";
import { StudioComponentGrid } from "./StudioComponentGrid";
import { StudioDetail } from "./StudioDetail";
import { StudioRailThumb } from "./StudioRailThumb";
import { StudioStage } from "./StudioStage";
import { StudioTourIntro } from "./StudioTourIntro";
import type { ExplorerCapability, UnifiedServiceId } from "./explorerModel";
import { useViewOnly } from "./useViewOnly";

export type { ExplorerCapability, ExplorerComponent, UnifiedServiceId } from "./explorerModel";

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

  // Active facility space ('studio' or 'atc')
  const [activeSpace, setActiveSpace] = useState<"studio" | "atc">(
    selected?.space ?? "studio",
  );

  // Sync space when selecting a capability
  useEffect(() => {
    if (selected?.space) {
      setActiveSpace(selected.space);
    }
  }, [selected?.space]);

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

  /* Selecting equipment in 3D maps back to the matching capability */
  const selectByModelGroup = useCallback(
    (group: UnifiedServiceId) => {
      const match = capabilities.find((item) => item.modelGroup === group);
      if (match) {
        setSelectedId(match.id);
        setActiveSpace(match.space);
      }
    },
    [capabilities],
  );

  // Handle switching space tab directly
  const handleSwitchSpace = useCallback(
    (space: "studio" | "atc") => {
      setActiveSpace(space);
      if (selected.space !== space) {
        const firstInSpace = capabilities.find((item) => item.space === space);
        if (firstInSpace) setSelectedId(firstInSpace.id);
      }
    },
    [capabilities, selected.space],
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
      {/* On a phone the room leads and the list follows it; from lg the list is
          the column beside the room. Source order puts the list first so it is
          read before the canvas either way. */}
      <div id="studio-room" className="grid scroll-mt-20 grid-cols-[minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="order-2 border-y border-line bg-raise py-4 lg:order-1 lg:border-y-0 lg:border-r lg:py-5">
          <div className="flex items-center justify-between px-5 pb-3">
            <p className="kicker">Explore the studio</p>
            <span className="font-mono text-[0.625rem] uppercase tracking-wider text-ink-3">
              {activeSpace === "atc" ? "ATC Hub" : "Grad School"}
            </span>
          </div>
          <StudioCapabilityList
            items={capabilities}
            selectedId={selected.id}
            onSelect={setSelectedId}
          />
          {/* Redundant on a phone, where the room is directly above it. */}
          <div className="hidden lg:block">
            <StudioRailThumb
              active={selected.modelGroup}
              open={roomOpen}
              space={activeSpace}
              onOpen={() => { setRoomOpen(true); setTour(true); }}
            />
          </div>
        </div>

        <div className="order-1 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 bg-surface p-4 md:p-6 lg:order-2 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            <StudioStage
              active={selected.modelGroup}
              open={roomOpen}
              tour={tour}
              viewOnly={viewOnly}
              atc={selected.atc}
              space={activeSpace}
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
              onSwitchSpace={handleSwitchSpace}
            />
            <StudioComponentGrid items={selected.components} capabilityName={selected.name} />
          </div>

          <StudioDetail selected={selected} />
        </div>
      </div>
    </div>
  );
}
