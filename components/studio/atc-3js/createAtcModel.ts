/* Source: the supplied ATC floor plan, room videos, and the Design Studio material finish. */

import * as THREE from "three";

import { atcLayout, type AtcServiceId } from "./atcLayout";
import { createAtcArchitecture } from "./createAtcArchitecture";
import { createAtcContainer } from "./createAtcContainer";
import { createAtcLaser } from "./createAtcLaser";
import { createAtcRouter } from "./createAtcRouter";
import { createAtcStorage } from "./createAtcStorage";
import { createAtcMetalWorkstations, createAtcWoodAssemblyStation } from "./createAtcWorkstations";
import { createAtcMaterials, type AtcMaterials } from "./materials";
import { atcBox } from "./primitives";

export type AtcRuntime = {
  nodes: Record<string, THREE.Object3D>;
  services: Record<AtcServiceId, THREE.Group>;
  selectable: THREE.Object3D[];
  sprites: THREE.Sprite[];
  textures: THREE.Texture[];
  baseMaterials: THREE.Material[];
  toggleRoof: () => boolean;
  setLabelsVisible: (visible: boolean) => void;
};

function createNumberSprite(
  stationId: string,
  number: number,
  service: AtcServiceId,
  materials: AtcMaterials,
): THREE.Sprite {
  let map: THREE.CanvasTexture | null = null;
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = "#f2efe4";
      context.beginPath();
      context.arc(48, 48, 43, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#17252a";
      context.lineWidth = 4;
      context.stroke();
      context.fillStyle = "#17252a";
      context.font = "bold 48px Arial, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(String(number), 48, 49);
      map = new THREE.CanvasTexture(canvas);
      map.colorSpace = THREE.SRGBColorSpace;
      materials.textures.push(map);
    }
  }
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: map ?? undefined,
    color: map ? 0xffffff : 0xf2efe4,
    depthTest: false,
  }));
  sprite.name = `${stationId}-marker`;
  sprite.scale.set(0.4, 0.4, 1);
  sprite.renderOrder = 30;
  sprite.userData.stationId = stationId;
  sprite.userData.service = service;
  return sprite;
}

function makeServices() {
  return {
    woodworking: new THREE.Group(),
    "tooling-storage": new THREE.Group(),
    "laser-cutting": new THREE.Group(),
    metalworking: new THREE.Group(),
    "facility-access": new THREE.Group(),
  } satisfies Record<AtcServiceId, THREE.Group>;
}

export function createAtcModel(): THREE.Group {
  const root = new THREE.Group();
  root.name = "atc-workshop-room-study";
  root.userData.approximate = true;
  root.userData.measured = atcLayout.isMeasured;
  root.userData.sourceAuthority = "user-supplied-atc-floorplan-and-room-videos";
  root.userData.sourceMedia = ["IMG_0936.MP4", "IMG_0938.MP4", "IMG_0939.MP4", "IMG_0940.MP4"];

  const materials = createAtcMaterials();
  const services = makeServices();
  for (const [service, group] of Object.entries(services)) {
    group.name = `atc-${service}`;
  }

  const architecture = createAtcArchitecture(materials, atcLayout.room.width, atcLayout.room.depth);
  const container = createAtcContainer(materials);
  services["tooling-storage"].add(createAtcStorage(materials));
  services.metalworking.add(createAtcMetalWorkstations(materials));
  services.woodworking.add(createAtcRouter(materials), createAtcWoodAssemblyStation(materials));
  services["laser-cutting"].add(createAtcLaser(materials));

  const { depth } = atcLayout.room;
  const access = services["facility-access"];
  access.add(atcBox("open-side-access-threshold", [1.85, 0.035, 0.28], [4.82, 0.018, depth / 2 - 0.32], "chrome", materials, "facility-access"));
  access.userData.centre = new THREE.Vector3(4.82, 0.7, depth / 2 - 0.32);

  services.metalworking.userData.centre = new THREE.Vector3(-3.55, 1.0, -0.2);
  services.woodworking.userData.centre = new THREE.Vector3(2.9, 1.05, 0.85);
  services["laser-cutting"].userData.centre = new THREE.Vector3(4.65, 1.0, -2.72);
  services["tooling-storage"].userData.centre = new THREE.Vector3(-2.25, 1.2, -3.58);

  root.add(architecture.group, architecture.roof, container, ...Object.values(services));

  const nodes: Record<string, THREE.Object3D> = {};
  const selectable: THREE.Object3D[] = [];
  const sprites: THREE.Sprite[] = [];
  for (const station of atcLayout.stations) {
    if (station.number === undefined) continue;
    const marker = createNumberSprite(station.id, station.number, station.service, materials);
    marker.position.set(station.position[0], station.position[1] + 1.18, station.position[2]);
    root.add(marker);
    sprites.push(marker);
  }

  root.traverse((node) => {
    if (node.name) nodes[node.name] = node;
    if (node.userData.service && node instanceof THREE.Mesh) selectable.push(node);
  });

  const runtime: AtcRuntime = {
    nodes,
    services,
    selectable,
    sprites,
    textures: materials.textures,
    baseMaterials: Object.values(materials.palette),
    toggleRoof: architecture.toggleRoof,
    setLabelsVisible: (visible) => sprites.forEach((sprite) => { sprite.visible = visible; }),
  };
  root.userData.sculptRuntime = runtime;
  return root;
}
