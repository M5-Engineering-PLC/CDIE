// Lucid: Design Studio virtual tour. Geometry: the Three.js room layout module.
"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createSceneFrameLoop } from "../sceneFrameLoop";

import { createDesignStudioModel, type StudioRuntime } from "./createDesignStudioModel";
import { createTourCamera } from "./tourCamera";
import type { ServiceId } from "./studioLayout";

export type StudioView = "isometric" | "top" | "printers" | "cabinets" | "chairs" | "textile";

/*
  Change request 2026-09-21, section 4. Three capabilities the room did not have:

  - `tour`. "let the room rotate slowly, constantly, highlighting different
    parts of the room", and closing on whatever is highlighted. The camera is
    driven by ./tourCamera while it runs; see that file for why drive and
    orbit are not mixed.
  - `interactive`. False disables orbit, zoom and pan outright, so a touch on
    the canvas scrolls the page instead of dragging the room. That is the
    mobile posture: autofocus and the slow turn, nothing to drag.
*/
type SceneOptions = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  active: ServiceId | null;
  view: StudioView;
  tour?: boolean;
  interactive?: boolean;
  /** Pause while the room is hidden. */
  paused?: boolean;
  onSelect?: (service: ServiceId) => void;
  onReady?: () => void;
  onError?: () => void;
};

const views = {
  isometric: {
    position: new THREE.Vector3(-11.5, 10.1, -12.5),
    target: new THREE.Vector3(0.2, 0.55, 0.15),
  },
  printers: {
    position: new THREE.Vector3(2.05, 2.7, 2.4),
    target: new THREE.Vector3(2.05, 1.48, -3.1),
  },
  cabinets: {
    position: new THREE.Vector3(1.5, 2.2, 0.5),
    target: new THREE.Vector3(4.96, 0.7, 0),
  },
  chairs: {
    position: new THREE.Vector3(0.1, 2.5, 2.7),
    target: new THREE.Vector3(0, 0.65, 0),
  },
  textile: {
    position: new THREE.Vector3(-1.6, 2.7, 1.45),
    target: new THREE.Vector3(-4.8, 0.9, 0.8),
  },
  top: {
    position: new THREE.Vector3(0, 18.5, 0.01),
    target: new THREE.Vector3(0, 0, 0),
  },
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

export function useDesignStudioScene({
  canvasRef,
  active,
  view,
  tour = false,
  interactive = true,
  paused = false,
  onSelect,
  onReady,
  onError,
}: SceneOptions) {
  const runtimeRef = useRef<StudioRuntime | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  /* The loop reads these every frame. They are refs, not state, because a
     change must reach the running animation without rebuilding the scene. */
  const driveRef = useRef({ tour, interactive, active });
  const pausedRef = useRef(paused);
  const frameRef = useRef<ReturnType<typeof createSceneFrameLoop> | null>(null);
  const selectRef = useRef(onSelect);
  const readyRef = useRef(onReady);
  const errorRef = useRef(onError);

  useEffect(() => {
    selectRef.current = onSelect;
    readyRef.current = onReady;
    errorRef.current = onError;
  }, [onSelect, onReady, onError]);

  useEffect(() => {
    driveRef.current = { tour, interactive, active };
    frameRef.current?.invalidate();
  }, [tour, interactive, active]);

  useEffect(() => {
    pausedRef.current = paused;
    frameRef.current?.invalidate();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    } catch {
      errorRef.current?.();
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    /* Fix plan 2026-10-11, W2: static shadows update only after build or scene changes. */
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xedf1ef);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    camera.position.copy(views.isometric.position);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(views.isometric.target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 2;
    controls.maxDistance = 26;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.screenSpacePanning = true;
    controlsRef.current = controls;

    scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x725f49, 1.65));
    const daylight = new THREE.DirectionalLight(0xdcecff, 3.1);
    daylight.position.set(-8, 10, -4);
    daylight.castShadow = true;
    daylight.shadow.mapSize.set(2048, 2048);
    scene.add(daylight);
    const fill = new THREE.DirectionalLight(0xfff0cf, 1.25);
    fill.position.set(6, 8, 7);
    scene.add(fill);

    const model = createDesignStudioModel();
    const runtime = model.userData.sculptRuntime as StudioRuntime;
    runtimeRef.current = runtime;
    scene.add(model);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(35, 35),
      new THREE.ShadowMaterial({ color: 0x5b686d, opacity: 0.12 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const choose = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(runtime.selectable, false)[0];
      const service = hit?.object.userData.service as ServiceId | undefined;
      if (service) selectRef.current?.(service);
    };
    const contextLost = () => errorRef.current?.();
    canvas.addEventListener("click", choose);
    canvas.addEventListener("webglcontextlost", contextLost);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = createTourCamera(runtime, camera, controls, still);

    const frames = createSceneFrameLoop({
      canvas, renderer, scene, camera, controls,
      step: () => step(driveRef.current),
      paused: () => pausedRef.current,
      touring: () => driveRef.current.tour && !still,
    });
    frameRef.current = frames;
    readyRef.current?.();

    return () => {
      frames.dispose();
      frameRef.current = null;
      canvas.removeEventListener("click", choose);
      canvas.removeEventListener("webglcontextlost", contextLost);
      controls.dispose();
      model.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        node.geometry.dispose();
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => {
          if (material instanceof THREE.MeshBasicMaterial && material.map) material.map.dispose();
          material.dispose();
        });
      });
      for (const texture of (model.userData.generatedTextures as THREE.Texture[] | undefined) ?? []) texture.dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      runtimeRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
    };
  }, [canvasRef]);

  useEffect(() => {
    if (runtimeRef.current) setSelection(runtimeRef.current, active);
    frameRef.current?.invalidate(true);
  }, [active]);

  /* A view button is a manual override, so it does nothing while the tour is
     driving: the camera would snap and the tour would drag it straight back. */
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || tour) return;
    camera.position.copy(views[view].position);
    controls.target.copy(views[view].target);
    controls.update();
    frameRef.current?.invalidate();
  }, [tour, view]);
}
