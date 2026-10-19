// Lucid: Design Studio virtual tour. Puts the shared canvas into a room while that room is on screen.
"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Raycaster, Vector2, type Object3D } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { createSceneFrameLoop } from "./sceneFrameLoop";
import { attachStudioCanvas, detachStudioCanvas, type RoomScene } from "./studioRenderer";

export type CachedRoom<Drive> = RoomScene & {
  controls: OrbitControls;
  selectable: Object3D[];
  step: (drive: Drive) => void;
  still: boolean;
  /** the selection last applied to the cached materials */
  selected?: string | null;
};

type Options<Room extends CachedRoom<Drive>, Drive extends { tour: boolean }> = {
  containerRef: RefObject<HTMLDivElement | null>;
  /** the cached room, or undefined when it has not been built yet */
  peekRoom: () => Room | undefined;
  buildRoom: () => Room;
  drive: Drive;
  paused: boolean;
  canvasClassName: string;
  label: string;
  /** apply selection, labels and view before the first draw */
  prepare: (room: Room) => void;
  onSelect?: (service: string) => void;
  onReady?: (room: Room) => void;
  onError?: () => void;
};

/*
  Review 2026-10-19: a warmed room attaches in a layout effect and draws once
  before the browser paints, so opening the tour or switching space shows the
  room at once with no stale frame. A room that is not built yet keeps the old
  path: the loading text paints first, then the room builds.
*/
export function useRoomCanvas<Room extends CachedRoom<Drive>, Drive extends { tour: boolean }>(options: Options<Room, Drive>) {
  const latest = useRef(options);
  const driveRef = useRef(options.drive);
  const pausedRef = useRef(options.paused);
  const frameRef = useRef<ReturnType<typeof createSceneFrameLoop> | null>(null);
  const [token] = useState(() => ({}));

  useLayoutEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    driveRef.current = options.drive;
    frameRef.current?.invalidate();
  }, [options.drive]);

  const { paused, containerRef } = options;
  useLayoutEffect(() => {
    pausedRef.current = paused;
    const container = containerRef.current;
    if (paused || !container) return;
    let teardown: (() => void) | undefined;
    let frame = 0;
    let timer = 0;
    const attach = () => {
      const { peekRoom, buildRoom, canvasClassName, label } = latest.current;
      let room: Room;
      try {
        room = peekRoom() ?? buildRoom();
      } catch {
        latest.current.onError?.();
        return;
      }
      const shared = attachStudioCanvas(token, container);
      if (!shared) {
        latest.current.onError?.();
        return;
      }
      const { renderer, canvas } = shared;
      canvas.className = canvasClassName;
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", label);
      room.controls.connect(canvas);
      const raycaster = new Raycaster();
      const pointer = new Vector2();
      const choose = (event: MouseEvent) => {
        const bounds = canvas.getBoundingClientRect();
        pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
        raycaster.setFromCamera(pointer, room.camera);
        const service = raycaster.intersectObjects(room.selectable, false)[0]?.object.userData.service as string | undefined;
        if (service) latest.current.onSelect?.(service);
      };
      const contextLost = () => latest.current.onError?.();
      canvas.addEventListener("click", choose);
      canvas.addEventListener("webglcontextlost", contextLost);
      latest.current.prepare(room);
      const frames = createSceneFrameLoop({
        canvas, renderer, scene: room.scene, camera: room.camera, controls: room.controls, shadows: room.shadows,
        step: () => room.step(driveRef.current),
        paused: () => pausedRef.current,
        touring: () => driveRef.current.tour && !room.still,
      });
      frameRef.current = frames;
      frames.drawNow();
      room.warmed = true;
      latest.current.onReady?.(room);
      teardown = () => {
        frames.dispose();
        frameRef.current = null;
        canvas.removeEventListener("click", choose);
        canvas.removeEventListener("webglcontextlost", contextLost);
        room.controls.disconnect();
        detachStudioCanvas(token);
      };
    };
    if (latest.current.peekRoom()) attach();
    else frame = window.requestAnimationFrame(() => { timer = window.setTimeout(attach); });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      teardown?.();
    };
  }, [paused, containerRef, token]);

  return frameRef;
}
