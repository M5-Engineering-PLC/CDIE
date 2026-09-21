"use client";

// Isolation harness for components/studio/design-studio-3js. Not a website surface.

import {
  DesignStudio3D,
  studioLayout,
  type ServiceId,
} from "@/components/studio/design-studio-3js";
import { ModelLab } from "@/components/lab/ModelLab";

const stations = studioLayout.stations.map((station, index) => ({
  id: station.id,
  number: index + 1,
  label: station.label,
  service: station.service,
}));

export default function DesignStudioLabPage() {
  return (
    <ModelLab
      title="design-studio-3js — Design Studio"
      room={studioLayout.room}
      isMeasured={studioLayout.isMeasured}
      stations={stations}
    >
      {({ active, tour, interactive, onSelect }) => (
        <DesignStudio3D
          active={active as ServiceId | null}
          onSelect={onSelect}
          tour={tour}
          interactive={interactive}
        />
      )}
    </ModelLab>
  );
}
