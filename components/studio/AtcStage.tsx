"use client";

/*
  CDIE ATC Prototyping Workshop Stage.
  Closed, it renders the lightweight 2D SVG plan (AtcRoomPlan).
  Open, it dynamically loads the interactive Three.js 3D workshop (Atc3D) on demand.
*/

import dynamic from "next/dynamic";

import { AtcRoomPlan } from "./AtcRoomPlan";
import type { AtcServiceId } from "./atc-3js";

const Atc3D = dynamic(
  () => import("./atc-3js").then((mod) => mod.Atc3D),
  {
    ssr: false,
    loading: () => (
      <div className="grid aspect-video min-h-96 place-items-center border border-line bg-raise">
        <p className="text-fine text-ink-3">Loading the ATC workshop…</p>
      </div>
    ),
  },
);

export type AtcStageProps = {
  active: AtcServiceId | null;
  open: boolean;
  onSelect: (service: AtcServiceId) => void;
  onClose: () => void;
  onOpen?: () => void;
};

export function AtcStage({ active, open, onSelect, onClose, onOpen }: AtcStageProps) {
  if (!open) {
    return (
      <div className="flex min-w-0 flex-col gap-3">
        <AtcRoomPlan active={active} />
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-fine text-ink-3">
            Illustrative layout of the ATC Engineering & Prototyping Workshop based on site video captures and schematics.
          </p>
          {onOpen ? (
            <button
              type="button"
              onClick={onOpen}
              className="text-fine font-medium text-brand underline-offset-4 hover:underline"
            >
              Open 3D interactive room →
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Atc3D active={active} onSelect={onSelect} />
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="max-w-[56ch] text-fine text-ink-3">
          Drag to orbit, scroll to zoom, select equipment to jump to its capability.
          Toggle badges or container roll-up shutter in the toolbar.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-fine font-medium text-brand underline-offset-4 hover:underline"
        >
          Close the workshop
        </button>
      </div>
    </div>
  );
}
