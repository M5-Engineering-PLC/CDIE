"use client";

// Admin model lab: isolation harness for components/studio/atc-3js. Not a website surface.

import { Atc3D, atcLayout, type AtcServiceId } from "@/components/studio/atc-3js";
import { ModelLab } from "@/components/admin/ModelLab";

export default function AtcLabPage() {
  return (
    <ModelLab
      title="atc-3js — Engineering & Prototyping Workshop"
      room={atcLayout.room}
      isMeasured={atcLayout.isMeasured}
      stations={atcLayout.stations}
    >
      {({ active, tour, interactive, onSelect }) => (
        <Atc3D
          active={active as AtcServiceId | null}
          onSelect={onSelect}
          tour={tour}
          interactive={interactive}
        />
      )}
    </ModelLab>
  );
}
