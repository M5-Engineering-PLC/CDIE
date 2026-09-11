"use client";

import { AtcRoomPlan } from "./AtcRoomPlan";
import { RoomPlan } from "./RoomPlan";
import type { AtcServiceId } from "./atc-3js";
import type { ServiceId } from "./studioLayout";

export type StudioRailThumbProps = {
  active: ServiceId | AtcServiceId | null;
  open: boolean;
  onOpen: () => void;
  space?: "studio" | "atc";
};

export function StudioRailThumb({ active, open, onOpen, space = "studio" }: StudioRailThumbProps) {
  const isAtc = space === "atc";

  return (
    <div className="mt-5 border-t border-line px-5 pt-5">
      <button
        type="button"
        onClick={onOpen}
        aria-pressed={open}
        className="group block w-full text-left"
      >
        <span className="block overflow-hidden border border-line bg-surface p-2 transition-colors group-hover:border-brand-live">
          {isAtc ? (
            <AtcRoomPlan active={active as AtcServiceId | null} className="w-full" />
          ) : (
            <RoomPlan active={active as ServiceId | null} className="w-full" />
          )}
        </span>
        <span className="mt-2 flex items-baseline justify-between gap-2">
          <span className="text-fine text-ink-3">
            {isAtc ? "ATC Workshop layout" : "Illustrative layout"}
          </span>
          <span className="text-fine text-brand">
            {open ? "Showing" : "Explore in 3D"}
          </span>
        </span>
      </button>
    </div>
  );
}
