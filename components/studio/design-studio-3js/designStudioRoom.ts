// Lucid: Design Studio virtual tour. Geometry: the Three.js room layout module.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { createRoomScene, warmRoom, type WarmSlices } from "../studioRenderer";
import type { CachedRoom } from "../useRoomCanvas";
import { createDesignStudioModel, type StudioRuntime } from "./createDesignStudioModel";
import { createTourCamera } from "./tourCamera";
import type { ServiceId } from "./studioLayout";

export type StudioView = "isometric" | "top" | "printers" | "cabinets" | "chairs" | "textile";
export type StudioDrive = { tour: boolean; interactive: boolean; active: ServiceId | null };
export type DesignStudioRoom = CachedRoom<StudioDrive> & { runtime: StudioRuntime };

export const studioViews: Record<StudioView, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  isometric: { position: new THREE.Vector3(-11.5, 10.1, -12.5), target: new THREE.Vector3(0.2, 0.55, 0.15) },
  printers: { position: new THREE.Vector3(2.05, 2.7, 2.4), target: new THREE.Vector3(2.05, 1.48, -3.1) },
  cabinets: { position: new THREE.Vector3(1.5, 2.2, 0.5), target: new THREE.Vector3(4.96, 0.7, 0) },
  chairs: { position: new THREE.Vector3(0.1, 2.5, 2.7), target: new THREE.Vector3(0, 0.65, 0) },
  textile: { position: new THREE.Vector3(-1.6, 2.7, 1.45), target: new THREE.Vector3(-4.8, 0.9, 0.8) },
  top: { position: new THREE.Vector3(0, 18.5, 0.01), target: new THREE.Vector3(0, 0, 0) },
};

let cached: DesignStudioRoom | undefined;

/* Review 2026-10-19: built once per visit and reused by every mount, the warm-up included. */
export const peekDesignStudioRoom = () => cached;

export function getDesignStudioRoom(): DesignStudioRoom {
  if (cached) return cached;
  const base = createRoomScene(0xedf1ef, 34);
  const { scene, camera } = base;
  camera.position.copy(studioViews.isometric.position);

  const controls = new OrbitControls(camera);
  controls.target.copy(studioViews.isometric.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.minDistance = 2;
  controls.maxDistance = 26;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.screenSpacePanning = true;
  controls.update();

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
  scene.add(model);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(35, 35),
    new THREE.ShadowMaterial({ color: 0x5b686d, opacity: 0.12 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  scene.add(ground);

  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const step = createTourCamera(runtime, camera, controls, still);
  cached = Object.assign(base, { controls, runtime, selectable: runtime.selectable, step, still });
  return cached;
}

export const warmDesignStudio3D = (slices: WarmSlices) => warmRoom(getDesignStudioRoom, slices, "studio");
