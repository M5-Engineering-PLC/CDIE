// Lucid: Design Studio virtual tour. Geometry: the Three.js room layout module.
"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { useRoomCanvas } from "../useRoomCanvas";
import { atcViews, getAtcRoom, peekAtcRoom, type AtcRoom, type AtcView } from "./atcRoom";
import type { AtcRuntime } from "./createAtcModel";
import type { AtcServiceId } from "./atcLayout";

export type { AtcView } from "./atcRoom";

/* Review 2026-10-19: the scene lives in ./atcRoom, built once and drawn by the shared renderer. */
type SceneOptions = {
  containerRef: RefObject<HTMLDivElement | null>;
  active: AtcServiceId | null;
  view: AtcView;
  tour?: boolean;
  interactive?: boolean;
  showLabels?: boolean;
  /** Pause while the room is hidden. */
  paused?: boolean;
  canvasClassName: string;
  label: string;
  onSelect?: (service: AtcServiceId) => void;
  onReady?: (runtime: AtcRuntime) => void;
  onError?: () => void;
};

function setSelection(runtime: AtcRuntime, active: AtcServiceId | null) {
  runtime.root.traverse((node) => {
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
      // Determine if node or any ancestor belongs to the active station
      let service = node.userData.service as AtcServiceId | undefined;
      let parent = node.parent;
      while (active !== null && !service && parent && parent !== runtime.root) {
        if (parent.userData.service) service = parent.userData.service as AtcServiceId;
        parent = parent.parent;
      }
      // No selection, or the selected station: original materials, no blue highlight.
      // Otherwise the rest of the space becomes transparent so the selected station is prominent.
      const faded = active !== null && service !== active;
      material.transparent = faded || material.userData.baseTransparent;
      material.opacity = faded ? 0.08 : material.userData.baseOpacity;
      material.depthWrite = !faded;
      material.emissive.setHex(faded ? 0x000000 : material.userData.baseEmissive);
      material.emissiveIntensity = faded ? 0 : material.userData.baseEmissiveIntensity;
    }
  });
}

function select(room: AtcRoom, active: AtcServiceId | null) {
  if ((room.selected ?? null) === active) return false;
  setSelection(room.runtime, active);
  room.selected = active;
  return true;
}

function applyView(room: AtcRoom, view: AtcView, tour: boolean) {
  if (tour) return;
  room.camera.position.copy(atcViews[view].position);
  room.controls.target.copy(atcViews[view].target);
  room.controls.update();
}

export function useAtcScene({
  containerRef, active, view, tour = false, interactive = true, paused = false, showLabels = true,
  canvasClassName, label, onSelect, onReady, onError,
}: SceneOptions) {
  const drive = useMemo(() => ({ tour, interactive, active }), [tour, interactive, active]);
  /* The first attach of a mount sets the view and opens the shutter, as a fresh room did. */
  const fresh = useRef(true);
  const frameRef = useRoomCanvas({
    containerRef, drive, paused, canvasClassName, label,
    peekRoom: peekAtcRoom,
    buildRoom: getAtcRoom,
    prepare: (room) => {
      if (select(room, active)) room.shadows.dirty = true;
      room.runtime.setLabelsVisible(showLabels);
      if (fresh.current) {
        applyView(room, view, tour);
        if (!room.shutterOpen) {
          room.shutterOpen = room.runtime.toggleShutter();
          room.shadows.dirty = true;
        }
      }
      fresh.current = false;
    },
    onSelect: onSelect as ((service: string) => void) | undefined,
    onReady: (room) => onReady?.(room.runtime),
    onError,
  });

  useEffect(() => {
    const room = peekAtcRoom();
    if (!room || !select(room, active)) return;
    room.shadows.dirty = true;
    frameRef.current?.invalidate();
  }, [active, frameRef]);

  useEffect(() => {
    peekAtcRoom()?.runtime.setLabelsVisible(showLabels);
    frameRef.current?.invalidate();
  }, [showLabels, frameRef]);

  useEffect(() => {
    const room = peekAtcRoom();
    if (!room || fresh.current) return;
    applyView(room, view, tour);
    frameRef.current?.invalidate();
  }, [tour, view, frameRef]);

  return {
    toggleShutter: () => {
      const room = peekAtcRoom();
      if (!room) return undefined;
      room.shutterOpen = room.runtime.toggleShutter();
      room.shadows.dirty = true;
      frameRef.current?.invalidate();
      return room.shutterOpen;
    },
  };
}
