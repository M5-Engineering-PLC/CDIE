"use client";

/* Source: user-supplied ATC floor plan and room videos. */

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
            Illustrative plan based on your hand-drawn plan and room videos. Room dimensions are estimates.
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
        <p className="text-fine text-ink-3">
          Illustrative room model based on your floor plan and videos. Room dimensions are estimates.
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
