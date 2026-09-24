"use client";

import { useCallback, useEffect, useState } from "react";

import { StudioCapabilityList } from "./StudioCapabilityList";
import { StudioComponentGrid } from "./StudioComponentGrid";
import { StudioDetail } from "./StudioDetail";
import { StudioRailThumb } from "./StudioRailThumb";
import { StudioStage } from "./StudioStage";
import { StudioTourIntro } from "./StudioTourIntro";
import type { ExplorerCapability, UnifiedServiceId } from "./explorerModel";
import { useStudio3DWarmup } from "./useStudio3DWarmup";
import { useViewOnly } from "./useViewOnly";

export type { ExplorerCapability, ExplorerComponent, UnifiedServiceId } from "./explorerModel";

export type StudioExplorerProps = {
  capabilities: ExplorerCapability[];
  initialId: string;
  /** Actual Copy, DESIGN STUDIO > Virtual tour */
  intro: { headline: string; standfirst: string };
};

const STEP_MS = 7000;

export function StudioExplorer({ capabilities, initialId, intro }: StudioExplorerProps) {
  const [selectedId, setSelectedId] = useState(initialId);
  const [roomOpen, setRoomOpen] = useState(false);
  const [tour, setTour] = useState(false);
  const viewOnly = useViewOnly();

  const index = Math.max(0, capabilities.findIndex((item) => item.id === selectedId));
  const selected = capabilities[index] ?? capabilities[0];
  useStudio3DWarmup(Boolean(selected?.atc));
  const [activeSpace, setActiveSpace] = useState<"studio" | "atc">(selected?.space ?? "studio");

  // Follow the selected capability into its space, adjusted during render
  // rather than in an effect (see SiteNav for the same pattern).
  const [lastSpace, setLastSpace] = useState(selected?.space);
  if (selected?.space && selected.space !== lastSpace) {
    setLastSpace(selected.space);
    setActiveSpace(selected.space);
  }

  const startTour = () => {
    setRoomOpen(true);
    setTour(true);
    window.requestAnimationFrame(() => {
      document.getElementById("studio-room")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  useEffect(() => {
    if (!tour || !roomOpen || capabilities.length < 2) return;
    const timer = window.setTimeout(() => {
      setSelectedId(capabilities[(index + 1) % capabilities.length].id);
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [capabilities, index, roomOpen, tour]);

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

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("service") === selectedId) return;
    url.searchParams.set("service", selectedId);
    window.history.replaceState(null, "", url);
  }, [selectedId]);

  if (!selected) return null;

  return (
    <div className="overflow-hidden border border-line bg-surface">
      <StudioTourIntro onStart={startTour} headline={intro.headline} standfirst={intro.standfirst} />
      <div id="studio-room" className="grid scroll-mt-20 grid-cols-[minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="order-1 border-y border-line bg-raise py-4 lg:order-1 lg:border-y-0 lg:border-r lg:py-5">
          <div className="flex items-center justify-between px-5 pb-3">
            <p className="kicker">Explore the studio</p>
            <span className="font-mono text-[0.625rem] uppercase tracking-wider text-ink-3">
              {activeSpace === "atc" ? "ATC Hub" : "Grad School"}
            </span>
          </div>
          <StudioCapabilityList items={capabilities} selectedId={selected.id} onSelect={setSelectedId} />
          <div className="hidden lg:block">
            <StudioRailThumb active={selected.modelGroup} open={roomOpen} space={activeSpace} onOpen={() => { setRoomOpen(true); setTour(true); }} />
          </div>
        </div>

        <div className="order-2 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 bg-surface px-gutter py-5 md:p-6 lg:order-2 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            <StudioStage
              active={selected.modelGroup} open={roomOpen} tour={tour} viewOnly={viewOnly} atc={selected.atc} space={activeSpace}
              name={selected.name} spaceName={selected.spaceName} headline={selected.headline} step={index + 1} of={capabilities.length}
              image={selected.image} imageAlt={`${selected.name} at the CDIE Design Studio`} onSelect={selectByModelGroup}
              onClose={() => { setRoomOpen(false); setTour(false); }} onOpen={() => { setRoomOpen(true); setTour(true); }}
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
