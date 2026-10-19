// Lucid: Design Studio virtual tour, ATC workshop. Geometry: the Three.js room layout module.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { createRoomScene, warmRoom, type WarmSlices } from "../studioRenderer";
import type { CachedRoom } from "../useRoomCanvas";
import { createAtcModel, type AtcRuntime } from "./createAtcModel";
import { createAtcTourCamera } from "./atcTourCamera";
import type { AtcServiceId } from "./atcLayout";

export type AtcView = "isometric" | "top";
export type AtcDrive = { tour: boolean; interactive: boolean; active: AtcServiceId | null };
export type AtcRoom = CachedRoom<AtcDrive> & { runtime: AtcRuntime; shutterOpen: boolean };

export const atcViews: Record<AtcView, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  isometric: { position: new THREE.Vector3(12.5, 10.5, 12.5), target: new THREE.Vector3(0, 0.4, 0) },
  top: { position: new THREE.Vector3(0.001, 18, 0.001), target: new THREE.Vector3(0, 0, 0) },
};

let cached: AtcRoom | undefined;

/* Review 2026-10-19: built once per visit and reused by every mount, the warm-up included. */
export const peekAtcRoom = () => cached;

export function getAtcRoom(): AtcRoom {
  if (cached) return cached;
  const base = createRoomScene(0xf1f5f9, 38);
  const { scene, camera } = base;
  camera.position.copy(atcViews.isometric.position);

  const controls = new OrbitControls(camera);
  controls.target.copy(atcViews.isometric.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.minDistance = 2.5;
  controls.maxDistance = 35;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.screenSpacePanning = true;
  controls.update();

  // Studio Lighting Rig
  scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe7ec, 1.3));
  const sunLight = new THREE.DirectionalLight(0xfffaed, 2.4);
  sunLight.position.set(12, 16, 12);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.bias = -0.0004;
  sunLight.shadow.normalBias = 0.02;
  scene.add(sunLight);
  const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.8);
  fillLight.position.set(-10, 12, -8);
  scene.add(fillLight);

  // Warm interior light inside the shipping container booth
  const containerInteriorLight = new THREE.PointLight(0xfff3db, 16, 8, 2);
  containerInteriorLight.position.set(-4.0, 2.1, 0.2);
  scene.add(containerInteriorLight);

  // Ground shadow receiver
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 36),
    new THREE.ShadowMaterial({ color: 0x334155, opacity: 0.12 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.11;
  ground.receiveShadow = true;
  scene.add(ground);

  const model = createAtcModel();
  const runtime = model.userData.sculptRuntime as AtcRuntime;
  scene.add(model);

  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const step = createAtcTourCamera(runtime, camera, controls, still);
  cached = Object.assign(base, { controls, runtime, selectable: runtime.selectable, step, still, shutterOpen: true });
  return cached;
}

export const warmAtc3D = (slices: WarmSlices) => warmRoom(getAtcRoom, slices, "atc");
