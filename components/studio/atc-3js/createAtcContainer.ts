/* Shipping Container: 20ft blue storage/machining booth on the left side.
   Source: frame_7040.jpg, frame_7030.jpg, viewAsOneEntersDoor.jpg.
   Houses the Blue Elephant CNC router, operator CAD/CAM desk, and tool storage.
   Equipped with realistic corrugated steel panels, louvered ventilation frame, and roll-up shutter. */

import * as THREE from "three";

import { atcLayout } from "./atcLayout";
import type { AtcMaterials } from "./materials";
import { atcBox, atcCylinder } from "./primitives";

export function createAtcContainer(materials: AtcMaterials) {
  const container = new THREE.Group();
  container.name = "shipping-container";
  container.position.set(...atcLayout.container.position);

  const [width, height, length] = atcLayout.container.size;
  const halfWidth = width / 2;
  const halfLength = length / 2;

  // 1. Foundation Curb & Floor Slab
  container.add(atcBox("cont-floor", [width, 0.1, length], [0, 0.05, 0], "steelDark", materials));

  // 2. Heavy-duty structural base runners and top long rails
  for (const x of [-halfWidth + 0.1, halfWidth - 0.1]) {
    container.add(atcBox(`container-base-runner-${x}`, [0.18, 0.16, length], [x, 0.08, 0], "steelDark", materials));
    container.add(atcBox(`container-top-long-rail-${x}`, [0.16, 0.16, length], [x, height - 0.08, 0], "containerBlue", materials));
  }

  // 3. Four corner casting posts
  const cornerCoords = [
    [-halfWidth + 0.09, -halfLength + 0.09],
    [halfWidth - 0.09, -halfLength + 0.09],
    [-halfWidth + 0.09, halfLength - 0.09],
    [halfWidth - 0.09, halfLength - 0.09],
  ] as const;

  cornerCoords.forEach(([cx, cz], index) => {
    container.add(atcBox(`container-corner-${index}`, [0.18, height, 0.18], [cx, height / 2, cz], "containerBlue", materials, undefined, 0.015));
  });

  // 4. Rear end wall (Z negative)
  container.add(atcBox("container-end-wall-rear", [width - 0.2, height - 0.2, 0.1], [0, height / 2, -halfLength + 0.05], "containerBlue", materials));
  container.add(atcBox("container-end-rail-rear-top", [width, 0.14, 0.16], [0, height - 0.07, -halfLength + 0.05], "containerBlue", materials));

  // 5. Front end wall (Z positive) - partial wall framing the roll-up door
  container.add(atcBox("container-end-rail-front-top", [width, 0.14, 0.16], [0, height - 0.07, halfLength - 0.05], "containerBlue", materials));
  container.add(atcBox("container-end-post-front-l", [0.45, height, 0.1], [-halfWidth + 0.22, height / 2, halfLength - 0.05], "containerBlue", materials));
  container.add(atcBox("container-end-post-front-r", [0.45, height, 0.1], [halfWidth - 0.22, height / 2, halfLength - 0.05], "containerBlue", materials));

  // 6. External Corrugated Side Wall (Left outer wall: X negative)
  const backWallX = -halfWidth + 0.06;
  container.add(atcBox("container-outer-wall", [0.12, height - 0.2, length - 0.2], [backWallX, height / 2, 0], "containerBlue", materials));

  // Corrugation ribs along outer wall
  for (let z = -halfLength + 0.3; z <= halfLength - 0.3; z += 0.28) {
    container.add(atcBox(`container-rib-${z.toFixed(2)}`, [0.045, height - 0.22, 0.06], [backWallX - 0.06, height / 2, z], "steelDark", materials));
  }

  // White louvered air ventilation box on the outer container wall (Source: frame_7040.jpg & viewAsOneEntersDoor.jpg)
  const ventZ = -1.8;
  container.add(atcBox("container-vent-casing", [0.08, 0.52, 1.1], [backWallX - 0.08, 1.85, ventZ], "white", materials, "facility-access", 0.02));
  for (let y = 1.68; y <= 2.05; y += 0.08) {
    container.add(atcBox(`container-vent-blade-${y.toFixed(2)}`, [0.04, 0.02, 0.96], [backWallX - 0.11, y, ventZ], "steelDark", materials, "facility-access"));
  }

  // 7. Right-facing interior opening (cutaway along positive X so camera can see inside the booth)
  container.add(atcBox("container-cutaway-header", [0.14, 0.16, length - 0.2], [halfWidth - 0.07, height - 0.08, 0], "containerBlue", materials));

  // 8. Front Entrance Roll-up Shutter (Source: frame_7040.jpg - student pulling roller shutter)
  // Front-facing at Z positive (+Z facing the front aisle and viewer)
  const shutterGroup = new THREE.Group();
  shutterGroup.name = "container-rollup-shutter";
  const shutterWidth = width - 0.9;
  const shutterZ = halfLength - 0.04;

  // Overhead roll drum hood & rolled coil drum
  container.add(atcBox("shutter-drum-hood", [shutterWidth + 0.16, 0.26, 0.26], [0, height - 0.2, shutterZ], "shutterWhite", materials, "facility-access", 0.02));
  container.add(atcCylinder("shutter-rolled-drum", 0.1, shutterWidth, [0, height - 0.22, shutterZ], "shutterWhite", materials, "facility-access", 16));

  // Vertical side guide tracks on left and right posts
  container.add(atcBox("shutter-track-l", [0.06, height - 0.34, 0.05], [-shutterWidth / 2 - 0.03, (height - 0.34) / 2, shutterZ], "steelDark", materials, "facility-access"));
  container.add(atcBox("shutter-track-r", [0.06, height - 0.34, 0.05], [shutterWidth / 2 + 0.03, (height - 0.34) / 2, shutterZ], "steelDark", materials, "facility-access"));

  // Slatted shutter curtain (operable)
  const shutterCurtain = new THREE.Group();
  shutterCurtain.name = "shutter-curtain";

  // 18 horizontal interlocking steel slats
  const slatHeight = 0.11;
  const totalSlats = 18;
  for (let i = 0; i < totalSlats; i += 1) {
    const y = 0.12 + i * slatHeight;
    const slat = atcBox(`shutter-slat-${i}`, [shutterWidth, slatHeight - 0.012, 0.028], [0, y, shutterZ], "shutterWhite", materials, "facility-access");
    shutterCurtain.add(slat);
  }

  // Bottom pull bar with twin handles (Source: frame_7040.jpg)
  shutterCurtain.add(atcBox("shutter-bottom-bar", [shutterWidth, 0.05, 0.045], [0, 0.14, shutterZ + 0.01], "steelDark", materials, "facility-access"));
  shutterCurtain.add(atcBox("shutter-handle-l", [0.12, 0.02, 0.04], [-0.3, 0.15, shutterZ + 0.03], "steelDark", materials, "facility-access"));
  shutterCurtain.add(atcBox("shutter-handle-r", [0.12, 0.02, 0.04], [0.3, 0.15, shutterZ + 0.03], "steelDark", materials, "facility-access"));

  // Default: shutter is rolled open (curtain retracted into overhead drum hood)
  let isOpen = true;
  shutterCurtain.visible = false;

  shutterGroup.add(shutterCurtain);
  container.add(shutterGroup);

  const toggleShutter = (): boolean => {
    isOpen = !isOpen;
    shutterCurtain.visible = !isOpen;
    return isOpen;
  };

  return {
    group: container,
    toggleShutter,
  };
}
