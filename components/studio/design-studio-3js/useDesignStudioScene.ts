// Lucid: Design Studio virtual tour. Geometry: the Three.js room layout module.
"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { useRoomCanvas } from "../useRoomCanvas";
import type { StudioRuntime } from "./createDesignStudioModel";
import {
  getDesignStudioRoom, peekDesignStudioRoom, studioViews, type DesignStudioRoom, type StudioView,
} from "./designStudioRoom";
import type { ServiceId } from "./studioLayout";

export type { StudioView } from "./designStudioRoom";

/*
  Change request 2026-09-21, section 4. Three capabilities the room did not have:

  - `tour`. "let the room rotate slowly, constantly, highlighting different
    parts of the room", and closing on whatever is highlighted. The camera is
    driven by ./tourCamera while it runs; see that file for why drive and
    orbit are not mixed.
  - `interactive`. False disables orbit, zoom and pan outright, so a touch on
    the canvas scrolls the page instead of dragging the room. That is the
    mobile posture: autofocus and the slow turn, nothing to drag.

  Review 2026-10-19: the scene lives in ./designStudioRoom, built once and
  drawn by the site's shared renderer (../studioRenderer).
*/
type SceneOptions = {
  containerRef: RefObject<HTMLDivElement | null>;
  active: ServiceId | null;
  view: StudioView;
  tour?: boolean;
  interactive?: boolean;
  /** Pause while the room is hidden. */
  paused?: boolean;
  canvasClassName: string;
  label: string;
  onSelect?: (service: ServiceId) => void;
  onReady?: () => void;
  onError?: () => void;
};

function setSelection(runtime: StudioRuntime, active: ServiceId | null) {
  for (const [id, group] of Object.entries(runtime.services) as [ServiceId, THREE.Group][]) {
    group.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) {
        if (!(material instanceof THREE.MeshStandardMaterial)) continue;
        if (material.userData.baseOpacity === undefined) {
          material.userData.baseOpacity = material.opacity;
          material.userData.baseTransparent = material.transparent;
          material.userData.baseEmissive = material.emissive.getHex();
          material.userData.baseEmissiveIntensity = material.emissiveIntensity;
        }
        const selected = active === id || (active !== null && node.userData.alsoService === active);
        const muted = active !== null && !selected;
        material.transparent = muted || material.userData.baseTransparent;
        material.opacity = muted ? 0.24 : material.userData.baseOpacity;
        material.emissive.setHex(selected ? 0x0b78c0 : material.userData.baseEmissive);
        material.emissiveIntensity = selected ? 0.3 : material.userData.baseEmissiveIntensity;
      }
    });
  }
}

/** Apply a selection once; true when the room changed and its shadows need a redraw. */
function select(room: DesignStudioRoom, active: ServiceId | null) {
  if ((room.selected ?? null) === active) return false;
  setSelection(room.runtime, active);
  room.selected = active;
  return true;
}

/* A view button is a manual override, so it does nothing while the tour is
   driving: the camera would snap and the tour would drag it straight back. */
function applyView(room: DesignStudioRoom, view: StudioView, tour: boolean) {
  if (tour) return;
  room.camera.position.copy(studioViews[view].position);
  room.controls.target.copy(studioViews[view].target);
  room.controls.update();
}

export function useDesignStudioScene({
  containerRef, active, view, tour = false, interactive = true, paused = false,
  canvasClassName, label, onSelect, onReady, onError,
}: SceneOptions) {
  const drive = useMemo(() => ({ tour, interactive, active }), [tour, interactive, active]);
  /* The first attach of a mount sets the view; later attaches keep where the visitor left the camera. */
  const viewed = useRef(false);
  const frameRef = useRoomCanvas({
    containerRef, drive, paused, canvasClassName, label,
    peekRoom: peekDesignStudioRoom,
    buildRoom: getDesignStudioRoom,
    prepare: (room) => {
      if (select(room, active)) room.shadows.dirty = true;
      if (!viewed.current) applyView(room, view, tour);
      viewed.current = true;
    },
    onSelect: onSelect as ((service: string) => void) | undefined,
    onReady: () => onReady?.(),
    onError,
  });

  useEffect(() => {
    const room = peekDesignStudioRoom();
    if (!room || !select(room, active)) return;
    room.shadows.dirty = true;
    frameRef.current?.invalidate();
  }, [active, frameRef]);

  useEffect(() => {
    const room = peekDesignStudioRoom();
    if (!room || !viewed.current) return;
    applyView(room, view, tour);
    frameRef.current?.invalidate();
  }, [tour, view, frameRef]);
}
