/* Laser Cutting Station: Blue Elephant CO2 Laser Cutter along the rear window wall.
   Source: frame_7030.jpg, frame_7039.jpg, laser.jpg.
   Features off-white chassis, dark tinted glass hatch, honeycomb bed, Blue Elephant diamond brand,
   control panel with E-stop, caster wheels, and rear exhaust ducting. */

import * as THREE from "three";

import type { AtcMaterials } from "./materials";
import { addTextPlate, atcBox, atcCylinder } from "./primitives";

export function createAtcLaser(materials: AtcMaterials): THREE.Group {
  const laser = new THREE.Group();
  laser.name = "blue-elephant-laser-cutter";
  laser.position.set(2.2, 0, -2.9);
  laser.userData.service = "laser-cutting";

  const w = 2.05;
  const d = 1.35;
  const h = 0.98;

  // 1. Heavy-duty Caster Wheels with locking foot levers (Source: frame_7030.jpg)
  const wheelCoords = [
    [-w / 2 + 0.16, -d / 2 + 0.16], [w / 2 - 0.16, -d / 2 + 0.16],
    [-w / 2 + 0.16, d / 2 - 0.16], [w / 2 - 0.16, d / 2 - 0.16],
  ] as const;

  wheelCoords.forEach(([wx, wz], idx) => {
    laser.add(atcCylinder(`laser-wheel-${idx}`, 0.05, 0.04, [wx, 0.05, wz], "rubber", materials, "laser-cutting", 16));
    laser.add(atcBox(`laser-wheel-bracket-${idx}`, [0.08, 0.06, 0.08], [wx, 0.1, wz], "steelDark", materials, "laser-cutting"));
  });

  // 2. Base Pedestal Cabinet (Steel Dark)
  laser.add(atcBox("laser-base-skirt", [w - 0.06, 0.16, d - 0.06], [0, 0.18, 0], "steelDark", materials, "laser-cutting", 0.02));

  // 3. Main Enclosure Body (Clean Off-White with rounded chamfers - Source: frame_7030.jpg)
  laser.add(atcBox("laser-body-chassis", [w, 0.72, d], [0, 0.62, 0], "white", materials, "laser-cutting", 0.035));

  // Side ventilation slots (matching frame_7030.jpg)
  for (let z = -d / 2 + 0.25; z <= d / 2 - 0.25; z += 0.14) {
    laser.add(atcBox(`laser-side-vent-l-${z.toFixed(2)}`, [0.02, 0.025, 0.08], [-w / 2 - 0.005, 0.45, z], "steelDark", materials, "laser-cutting"));
    laser.add(atcBox(`laser-side-vent-r-${z.toFixed(2)}`, [0.02, 0.025, 0.08], [w / 2 + 0.005, 0.45, z], "steelDark", materials, "laser-cutting"));
  }

  // 4. Cutting Chamber Lid & Dark Glass Window (Hatch)
  const hatchW = 1.38;
  const hatchD = 0.82;
  const hatchX = -0.15;
  const hatchZ = 0.08;

  /* Revised 2026-10-01: the lid flickered. The tinted glass sat inside the
     frame, its top 2.5 mm under the frame's, and the frame cut into the body.
     Each layer now rests on the one below with a clear step, and the glass,
     being see-through, casts no shadow of its own. */
  // Hatch frame, resting on the body top
  laser.add(atcBox("laser-hatch-frame", [hatchW, 0.03, hatchD], [hatchX, h + 0.015, hatchZ], "steelDark", materials, "laser-cutting", 0.012));

  // Dark tinted acrylic glass window, laid on the frame (Source: frame_7039.jpg)
  const glass = atcBox("laser-view-glass", [hatchW - 0.1, 0.01, hatchD - 0.1], [hatchX, h + 0.036, hatchZ], "darkGlass", materials, "laser-cutting");
  glass.castShadow = false;
  laser.add(glass);

  // Hatch handles and hinges
  laser.add(atcBox("laser-hatch-handle", [0.42, 0.025, 0.03], [hatchX, h + 0.06, hatchZ + hatchD / 2 - 0.04], "steelDark", materials, "laser-cutting", 0.008));
  laser.add(atcBox("laser-hinge-l", [0.08, 0.02, 0.04], [hatchX - 0.4, h + 0.04, hatchZ - hatchD / 2 + 0.02], "steelDark", materials, "laser-cutting"));
  laser.add(atcBox("laser-hinge-r", [0.08, 0.02, 0.04], [hatchX + 0.4, h + 0.04, hatchZ - hatchD / 2 + 0.02], "steelDark", materials, "laser-cutting"));

  // 5. Honeycomb Cutting Bed & Laser Head inside chamber
  laser.add(atcBox("laser-honeycomb-bed", [hatchW - 0.16, 0.03, hatchD - 0.16], [hatchX, h - 0.16, hatchZ], "chrome", materials, "laser-cutting"));
  laser.add(atcBox("laser-acrylic-stock", [0.45, 0.008, 0.35], [hatchX + 0.1, h - 0.14, hatchZ], "white", materials, "laser-cutting"));

  // 6. Right Control Console (Digital Keypad, Screen, Emergency Stop, Key Switch)
  const panelX = w / 2 - 0.22;
  const panelZ = 0.15;
  laser.add(atcBox("laser-control-panel-recess", [0.32, 0.02, 0.48], [panelX, h + 0.01, panelZ], "steelDark", materials, "laser-cutting", 0.01));
  laser.add(atcBox("laser-lcd-screen", [0.18, 0.008, 0.14], [panelX, h + 0.025, panelZ - 0.12], "screen", materials, "laser-cutting"));
  laser.add(atcBox("laser-keypad-membrane", [0.18, 0.006, 0.16], [panelX, h + 0.024, panelZ + 0.06], "black", materials, "laser-cutting"));

  // Red mushroom emergency stop button (Source: laser.jpg)
  laser.add(atcCylinder("laser-estop-base", 0.025, 0.02, [panelX - 0.08, h + 0.03, panelZ + 0.19], "yellow", materials, "laser-cutting", 16));
  laser.add(atcCylinder("laser-estop-mushroom", 0.032, 0.025, [panelX - 0.08, h + 0.052, panelZ + 0.19], "red", materials, "laser-cutting", 20));

  // Key switch
  laser.add(atcCylinder("laser-key-switch", 0.014, 0.02, [panelX + 0.08, h + 0.03, panelZ + 0.19], "chrome", materials, "laser-cutting", 12));

  // 7. Blue Elephant Brand Badge on Front Panel (Source: frame_7030.jpg "BLUE ELEPHANT" with diamond)
  addTextPlate(
    laser,
    "laser-brand-plate",
    "BLUE ELEPHANT",
    "CO2 LASER PRECISION",
    [1.1, 0.24],
    [-0.1, 0.66, d / 2 + 0.01],
    "#f8fafc",
    "#1d4f8d",
    materials,
    "laser-cutting",
  );

  return laser;
}
