/* Source: User-supplied ATC floor plan, site photographs, and video captures.
   Hyper-realistic, clean studio workshop representation.
   Rule: NO GREEN BARS. CNC and tool storage inside container, workbenches and laser in open workshop. */

import * as THREE from "three";

import { atcLayout, type AtcServiceId } from "./atcLayout";
import { createAtcArchitecture } from "./createAtcArchitecture";
import { createAtcContainer } from "./createAtcContainer";
import { createAtcLaser } from "./createAtcLaser";
import { createAtcRouter } from "./createAtcRouter";
import { createAtcStorage } from "./createAtcStorage";
import { createAtcMetalWorkstations } from "./createAtcWorkstations";
import { createAtcMaterials, type AtcMaterials } from "./materials";

export type AtcRuntime = {
  root: THREE.Group;
  nodes: Record<string, THREE.Object3D>;
  services: Record<AtcServiceId, THREE.Group>;
  selectable: THREE.Object3D[];
  sprites: THREE.Sprite[];
  textures: THREE.Texture[];
  baseMaterials: THREE.Material[];
  toggleShutter: () => boolean;
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
      context.clearRect(0, 0, 96, 96);
      context.fillStyle = "#0b78c0";
      context.beginPath();
      context.arc(48, 48, 43, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = "#ffffff";
      context.lineWidth = 5;
      context.stroke();

      context.fillStyle = "#ffffff";
      context.font = "bold 46px Arial, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(String(number), 48, 50);

      map = new THREE.CanvasTexture(canvas);
      map.colorSpace = THREE.SRGBColorSpace;
      materials.textures.push(map);
    }
  }

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: map ?? undefined,
      color: map ? 0xffffff : 0x0b78c0,
      depthTest: false,
    }),
  );
  sprite.name = `${stationId}-badge`;
  sprite.scale.set(0.6, 0.6, 1);
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
  root.name = "atc-prototyping-workshop";
  root.userData.approximate = true;
  root.userData.measured = atcLayout.isMeasured;
  root.userData.sourceAuthority = "user-supplied-atc-floorplan-and-site-photos";

  const materials = createAtcMaterials();
  const services = makeServices();
  for (const [service, group] of Object.entries(services)) {
    group.name = `atc-${service}`;
  }

  // 1. Architecture Envelope (no green bars!)
  const architecture = createAtcArchitecture(materials, atcLayout.room.width, atcLayout.room.depth);

  // 2. Shipping Container (with interactive roll-up shutter toggle)
  const container = createAtcContainer(materials);

  // 3. Equipment & Workspaces
  // Tool Storage inside Container
  services["tooling-storage"].add(createAtcStorage(materials));
  services["tooling-storage"].userData.centre = new THREE.Vector3(-4.8, 1.2, -0.6);

  // Woodworking (CNC Router & CAD/CAM Desk) inside Container
  services.woodworking.add(createAtcRouter(materials));
  services.woodworking.userData.centre = new THREE.Vector3(-4.0, 0.88, 0.8);

  // Metalworking & Fabrication Workbenches in Open Workshop
  services.metalworking.add(createAtcMetalWorkstations(materials));
  services.metalworking.userData.centre = new THREE.Vector3(1.2, 0.88, 1.4);

  // Laser Cutting Station along Rear Window Wall
  services["laser-cutting"].add(createAtcLaser(materials));
  services["laser-cutting"].userData.centre = new THREE.Vector3(2.2, 0.88, -2.9);

  // Facility Access
  services["facility-access"].userData.centre = new THREE.Vector3(6.4, 0.9, 0.2);

  root.add(architecture, container.group, ...Object.values(services));

  // 4. Numbered 3D Station Badges
  const nodes: Record<string, THREE.Object3D> = {};
  const selectable: THREE.Object3D[] = [];
  const sprites: THREE.Sprite[] = [];

  for (const station of atcLayout.stations) {
    if (station.number === undefined) continue;
    const marker = createNumberSprite(station.id, station.number, station.service, materials);
    marker.position.set(station.position[0], station.position[1] + 1.25, station.position[2]);
    root.add(marker);
    sprites.push(marker);
  }

  // Traverse and register selectable meshes
  root.traverse((node) => {
    if (node.name) nodes[node.name] = node;
    if (node.userData.service && node instanceof THREE.Mesh) {
      selectable.push(node);
    }
  });

  const runtime: AtcRuntime = {
    root,
    nodes,
    services,
    selectable,
    sprites,
    textures: materials.textures,
    baseMaterials: Object.values(materials.palette),
    toggleShutter: container.toggleShutter,
    setLabelsVisible: (visible) => {
      sprites.forEach((sprite) => {
        sprite.visible = visible;
      });
    },
  };

  root.userData.sculptRuntime = runtime;
  return root;
}
