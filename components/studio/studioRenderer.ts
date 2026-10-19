// Lucid: Design Studio virtual tour. One WebGL renderer and canvas for both rooms, kept for the whole visit.
import * as THREE from "three";

/*
  Review 2026-10-19: opening the tour used to create a renderer, compile every
  shader and draw a 2048 px shadow map inside the click (about 400 + 140 ms).
  Now the site keeps one renderer. Each room's scene is built once, cached at
  module level, and drawn into the one canvas, which moves into whichever room
  is on screen. Nothing here forces a context loss on unmount.
*/

export type RoomScene = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** static shadows are redrawn only when this is set */
  shadows: { dirty: boolean };
  /** shaders compiled and the shadow map drawn at least once */
  warmed: boolean;
};

type Shared = { renderer: THREE.WebGLRenderer; canvas: HTMLCanvasElement };

let shared: Shared | null | undefined;
let owner: object | null = null;
const rooms = new Set<RoomScene>();

function create(): Shared | null {
  const canvas = document.createElement("canvas");
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  /* Reading shader logs on first use waits for every link to finish on the main thread. Development keeps the check. */
  renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  /* three r186 removed PCFSoftShadowMap and maps it to PCF, so both rooms already drew PCF. */
  renderer.shadowMap.type = THREE.PCFShadowMap;
  /* Fix plan 2026-10-11, W2: static shadows update only after build or scene changes. */
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  /* A lost context cannot be trusted again: the next room to open makes a new renderer. */
  canvas.addEventListener("webglcontextlost", () => {
    if (shared?.canvas !== canvas) return;
    shared = undefined;
    owner = null;
    rooms.forEach((room) => { room.warmed = false; room.shadows.dirty = true; });
  });
  return { renderer, canvas };
}

/** The site's one renderer, or null when WebGL is unavailable. */
export function getStudioRenderer() {
  if (shared === undefined && typeof document !== "undefined") shared = create();
  return shared ?? null;
}

/** A room's scene and camera, registered so a context loss marks it cold again. */
export function createRoomScene(background: number, fov: number): RoomScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  const room = { scene, camera: new THREE.PerspectiveCamera(fov, 1, 0.1, 80), shadows: { dirty: true }, warmed: false };
  rooms.add(room);
  return room;
}

/** Move the shared canvas into a room's container. The last caller owns it. */
export function attachStudioCanvas(token: object, container: HTMLElement) {
  const current = getStudioRenderer();
  if (!current) return null;
  owner = token;
  container.appendChild(current.canvas);
  return current;
}

export function detachStudioCanvas(token: object) {
  if (owner !== token) return;
  owner = null;
  shared?.canvas.remove();
}

export function drawRoom(renderer: THREE.WebGLRenderer, room: RoomScene) {
  renderer.shadowMap.needsUpdate = room.shadows.dirty;
  renderer.render(room.scene, room.camera);
  room.shadows.dirty = false;
  room.warmed = true;
}

export type WarmSlices = { idle: () => Promise<void>; pause: () => Promise<void> };

/*
  Staged warm-up, one small slice per idle period, never all at once:
  renderer, scene graph, shader compile (parallel where the browser allows),
  then one draw at 1 x 1 px that uploads buffers and fills the shadow map.
  The draw is skipped while a room is on screen; that room draws for itself.
*/
export async function warmRoom(getRoom: () => RoomScene, { idle, pause }: WarmSlices, name: string) {
  const mark = (stage: string) => performance.mark(`studio-3d:${name}:${stage}`);
  await idle();
  const current = getStudioRenderer();
  if (!current) return;
  mark("renderer");
  await idle();
  const room = getRoom();
  mark("built");
  await pause();
  if (room.warmed) return;
  await idle();
  await current.renderer.compileAsync(room.scene, room.camera);
  mark("compiled");
  await pause();
  await idle();
  if (room.warmed || owner !== null || shared !== current) return;
  current.renderer.setSize(1, 1, false);
  drawRoom(current.renderer, room);
  mark("drawn");
}
