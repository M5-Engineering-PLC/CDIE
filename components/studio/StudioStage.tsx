"use client";

/*
  Lucid: Design Studio, virtual tour first. Concept 02: the plan opens into an
  interactive room.

  The stage holds one of two things. Closed, it is the flat plan, which ships
  with the page and costs nothing. Open, it is the Three.js room from
  components/studio/design-studio-3js, loaded on demand.

  Three.js is around half a megabyte. The brief asks for the mobile experience
  to be simplified exceptionally, so it is not in the page weight until a
  visitor asks for it by opening the room.
*/

import dynamic from "next/dynamic";

import { RoomPlan } from "./RoomPlan";
import type { ServiceId } from "./studioLayout";

const DesignStudio3D = dynamic(
  () => import("./design-studio-3js").then((mod) => mod.DesignStudio3D),
  {
    ssr: false,
    loading: () => (
      <div className="grid aspect-video min-h-96 place-items-center border border-line bg-raise">
        <p className="text-fine text-ink-3">Loading the room…</p>
      </div>
    ),
  },
);

export type StudioStageProps = {
  active: ServiceId | null;
  open: boolean;
  onSelect: (service: ServiceId) => void;
  onClose: () => void;
};

export function StudioStage({ active, open, onSelect, onClose }: StudioStageProps) {
  if (!open) {
    return (
      <div className="flex min-w-0 flex-col gap-3">
        <RoomPlan active={active} />
        <p className="text-fine text-ink-3">
          Illustrative and unmeasured. The room follows a hand sketch and three wall
          photographs, normalised so it can be corrected when measurements exist.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <DesignStudio3D active={active} onSelect={onSelect} />
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="max-w-[52ch] text-fine text-ink-3">
          Drag to orbit, scroll to zoom, select a bench to jump to its capability.
          Illustrative and unmeasured.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-fine font-medium text-brand underline-offset-4 hover:underline"
        >
          Close the room
        </button>
      </div>
    </div>
  );
}
