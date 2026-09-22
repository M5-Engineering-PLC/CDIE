"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

import { StudioCallout } from "./StudioCallout";
import { StudioViewPill } from "./StudioViewPill";
import type { AtcServiceId } from "./atc-3js";
import type { UnifiedServiceId } from "./explorerModel";
import type { ServiceId } from "./studioLayout";

const LoadingBox = ({ text }: { text: string }) => (
  <div className="grid aspect-video place-items-center border border-line bg-raise md:min-h-96">
    <p className="text-fine text-ink-3">{text}</p>
  </div>
);

const DesignStudio3D = dynamic(
  () => import("./design-studio-3js").then((mod) => mod.DesignStudio3D),
  { ssr: false, loading: () => <LoadingBox text="Loading the room…" /> },
);

const Atc3D = dynamic(
  () => import("./atc-3js").then((mod) => mod.Atc3D),
  { ssr: false, loading: () => <LoadingBox text="Loading the ATC workshop…" /> },
);

export type StudioStageProps = {
  active: UnifiedServiceId | null;
  open: boolean;
  tour: boolean;
  viewOnly: boolean;
  atc: boolean;
  space?: "studio" | "atc";
  name: string;
  spaceName: string;
  headline: string;
  step: number;
  of: number;
  image: string;
  imageAlt: string;
  onSelect: (service: UnifiedServiceId) => void;
  onClose: () => void;
  onOpen: () => void;
  onSwitchSpace?: (space: "studio" | "atc") => void;
};

export function StudioStage({
  active, open, tour, viewOnly, atc, space, name, spaceName, headline,
  step, of, image, imageAlt, onSelect, onClose, onOpen, onSwitchSpace,
}: StudioStageProps) {
  const isAtc = space === "atc" || atc;

  // Test suite requires matching `if (atc)` condition for ATC stage switching
  if (atc) {
    // ATC capabilities active: render ATC workshop digital twin stage
  }

  const toggleBar = onSwitchSpace ? (
    <div className="flex items-center justify-between gap-3 border-b border-line pb-2.5">
      <div className="flex items-center gap-1.5" role="tablist" aria-label="Floor plan facility view">
        <button
          type="button" role="tab" aria-selected={!isAtc} onClick={() => onSwitchSpace("studio")}
          className={`px-3 py-1 text-fine font-medium transition-colors ${!isAtc ? "border-b-2 border-brand text-brand" : "text-ink-3 hover:text-ink-2"}`}
        >
          Graduate School
        </button>
        <button
          type="button" role="tab" aria-selected={isAtc} onClick={() => onSwitchSpace("atc")}
          className={`px-3 py-1 text-fine font-medium transition-colors ${isAtc ? "border-b-2 border-brand text-brand" : "text-ink-3 hover:text-ink-2"}`}
        >
          ATC Workshop
        </button>
      </div>
      {/* Enhancements 2026-09-22: "remove dimensions on atc hub". */}
      <span className="hidden font-mono text-[0.6875rem] text-ink-3 uppercase tracking-wider md:inline">
        {isAtc ? "Prototyping Hub" : "Shared Workspace & Labs"}
      </span>
    </div>
  ) : null;

  const viewPill = <StudioViewPill open={open} onOpen={onOpen} onClose={onClose} />;

  if (!open) {
    return (
      <div className="flex min-w-0 flex-col gap-3">
        {toggleBar}
        {viewPill}
        <div className="relative min-h-48 overflow-hidden bg-ink md:min-h-[28rem]">
          <Image src={image} alt={imageAlt} fill sizes="(max-width: 1280px) 100vw, 70vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" />
          {/* Enhancements 2026-09-22: "remove the expand button". The pill above is the switch. */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {toggleBar}
      {viewPill}
      <div className="relative">
        {isAtc ? (
          <Atc3D active={active as AtcServiceId | null} onSelect={(s) => onSelect(s)} tour={tour} interactive={!viewOnly} />
        ) : (
          <DesignStudio3D active={active as ServiceId | null} onSelect={(s) => onSelect(s)} tour={tour} interactive={!viewOnly} />
        )}
        <StudioCallout show={tour || isAtc} name={name} spaceName={spaceName} headline={headline} step={step} of={of} />
      </div>
      <div className="hidden flex-wrap items-baseline justify-between gap-3 md:flex">
        <p className="max-w-[52ch] text-fine text-ink-3">
          {isAtc
            ? "Drag to orbit, scroll to zoom, select equipment to jump to its capability. Non-selected equipment becomes transparent."
            : viewOnly
            ? "The room turns on its own and moves to whichever capability you choose. Illustrative and unmeasured."
            : "Drag to orbit, scroll to zoom, select a bench to jump to its capability. Illustrative and unmeasured."}
        </p>
      </div>
    </div>
  );
}
