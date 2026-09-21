"use client";

/*
  Lucid: Design Studio. Concept 02 places a small layout plan at the foot of the
  capability rail, captioned "Illustrative layout".

  It is the trigger for the interactive room, not a decoration, so it is a
  button with a real label rather than a clickable div. It draws the same 2D
  plan the stage uses, which costs no download: the Three.js room is fetched
  only once someone opens it.
*/

import { RoomPlan } from "./RoomPlan";
import type { ServiceId } from "./studioLayout";

export type StudioRailThumbProps = {
  active: ServiceId | null;
  open: boolean;
  onOpen: () => void;
};

export function StudioRailThumb({ active, open, onOpen }: StudioRailThumbProps) {
  return (
    <div className="mt-5 border-t border-line px-5 pt-5">
      <button
        type="button"
        onClick={onOpen}
        aria-pressed={open}
        className="group block w-full text-left"
      >
        <span className="block overflow-hidden border border-line bg-surface p-2 transition-colors group-hover:border-brand-live">
          <RoomPlan active={active} className="w-full" />
        </span>
        <span className="mt-2 flex items-baseline justify-between gap-2">
          <span className="text-fine text-ink-3">Illustrative layout</span>
          <span className="text-fine text-brand">
            {open ? "Showing" : "Explore in 3D"}
          </span>
        </span>
      </button>
    </div>
  );
}
