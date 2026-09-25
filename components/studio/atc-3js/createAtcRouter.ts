/* Woodworking: Blue Elephant ELECNC1212 3-axis CNC router & CAD/CAM operator station.
   Located inside the blue container booth for dust containment and acoustic control.
   Source: frame_7040.jpg, cnc.jpg, cncwithWOrkbench.jpg, IMG_0938.MP4. */

import * as THREE from "three";

import type { AtcMaterials } from "./materials";
import { addTextPlate, atcBox, atcCylinder } from "./primitives";

export function createAtcRouter(materials: AtcMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = "woodworking-cnc-zone";
  root.userData.service = "woodworking";

  // =========================================================================
  // 1. Blue Elephant ELECNC1212 3-Axis CNC Router (Inside Container at [-4.0, 0, 0.9])
  // =========================================================================
  const router = new THREE.Group();
  router.name = "blue-elephant-cnc-router";
  router.position.set(-4.0, 0, 0.9);
  router.userData.service = "woodworking";

  // Tubular steel stand legs and lower tie bracing
  const legCoords = [
    [-0.72, -0.62], [0.72, -0.62],
    [-0.72, 0.62], [0.72, 0.62],
  ] as const;
  legCoords.forEach(([lx, lz], idx) => {
    router.add(atcBox(`cnc-leg-${idx}`, [0.08, 0.44, 0.08], [lx, 0.22, lz], "steelDark", materials, "woodworking"));
    router.add(atcBox(`cnc-foot-${idx}`, [0.12, 0.03, 0.12], [lx, 0.015, lz], "rubber", materials, "woodworking"));
  });
  router.add(atcBox("cnc-stand-brace-x1", [1.44, 0.05, 0.05], [0, 0.14, -0.62], "steelDark", materials, "woodworking"));
  router.add(atcBox("cnc-stand-brace-x2", [1.44, 0.05, 0.05], [0, 0.14, 0.62], "steelDark", materials, "woodworking"));
  router.add(atcBox("cnc-stand-brace-z1", [0.05, 0.05, 1.24], [-0.72, 0.14, 0], "steelDark", materials, "woodworking"));
  router.add(atcBox("cnc-stand-brace-z2", [0.05, 0.05, 1.24], [0.72, 0.14, 0], "steelDark", materials, "woodworking"));

  // Industrial Yellow Chassis Bed
  router.add(atcBox("cnc-chassis-base", [1.62, 0.2, 1.42], [0, 0.52, 0], "yellow", materials, "woodworking", 0.02));
  router.add(atcBox("cnc-front-apron", [1.58, 0.16, 0.04], [0, 0.52, 0.72], "yellow", materials, "woodworking", 0.015));

  // Dark T-slot vacuum cutting bed
  router.add(atcBox("cnc-vacuum-bed", [1.44, 0.06, 1.26], [0, 0.63, 0], "steelDark", materials, "woodworking"));

  // Linear guide rails (Chrome) along X sides
  router.add(atcBox("cnc-rail-l", [0.04, 0.035, 1.34], [-0.74, 0.66, 0], "chrome", materials, "woodworking"));
  router.add(atcBox("cnc-rail-r", [0.04, 0.035, 1.34], [0.74, 0.66, 0], "chrome", materials, "woodworking"));

  // Freshly milled workpiece with CDIE engraved logo (matching user request & cnc.jpg)
  router.add(atcBox("cnc-workpiece", [0.85, 0.024, 0.75], [0.05, 0.67, 0.05], "carvedWorkpiece", materials, "woodworking", 0.005));

  // Gantry Uprights (Industrial Yellow)
  router.add(atcBox("cnc-gantry-upright-l", [0.16, 0.48, 0.18], [-0.74, 0.88, 0.05], "yellow", materials, "woodworking", 0.02));
  router.add(atcBox("cnc-gantry-upright-r", [0.16, 0.48, 0.18], [0.74, 0.88, 0.05], "yellow", materials, "woodworking", 0.02));

  // Gantry Cross Beam
  router.add(atcBox("cnc-gantry-beam", [1.48, 0.16, 0.16], [0, 1.04, 0.05], "yellow", materials, "woodworking", 0.02));

  // Cable carrier track along gantry
  router.add(atcBox("cnc-cable-carrier-track", [1.18, 0.04, 0.05], [0, 1.14, 0.05], "black", materials, "woodworking"));

  // Z-Axis Tool Carriage & Black Accordion Bellows
  router.add(atcBox("cnc-carriage", [0.24, 0.28, 0.18], [0.05, 0.98, 0.05], "white", materials, "woodworking", 0.02));
  router.add(atcBox("cnc-bellows-boot", [0.18, 0.18, 0.12], [0.05, 0.85, 0.05], "black", materials, "woodworking", 0.015));

  // Spindle motor, collet chuck, and drill bit hovering right over the newly carved CDIE logo
  router.add(atcCylinder("cnc-spindle-motor", 0.065, 0.24, [0.05, 0.78, 0.05], "chrome", materials, "woodworking", 24));
  router.add(atcCylinder("cnc-collet-chuck", 0.022, 0.06, [0.05, 0.68, 0.05], "steelDark", materials, "woodworking", 16));
  router.add(atcCylinder("cnc-endmill-bit", 0.006, 0.035, [0.05, 0.65, 0.05], "chrome", materials, "woodworking", 12));

  // Compact spindle dust shoe (no dangling cables/ducts)
  router.add(atcBox("cnc-dust-shoe", [0.16, 0.04, 0.14], [0.05, 0.71, 0.05], "black", materials, "woodworking"));

  // Front brand plate: "BLUE ELEPHANT"
  addTextPlate(
    router,
    "cnc-brand-plate",
    "BLUE ELEPHANT",
    "ELECNC1212",
    [1.1, 0.22],
    [0, 0.52, 0.745],
    "#f59e0b",
    "#18181b",
    materials,
    "woodworking",
  );

  root.add(router);

  // =========================================================================
  // 2. CAD/CAM Operator Workstation Desk (Inside Container beside CNC at [-4.0, 0, -0.6])
  // Source: frame_7040.jpg, cncwithWOrkbench.jpg
  // =========================================================================
  const desk = new THREE.Group();
  desk.name = "cnc-operator-workstation-desk";
  desk.position.set(-4.0, 0, -0.65);
  desk.userData.service = "woodworking";

  const dW = 1.35;
  const dD = 0.75;
  const dH = 0.76;

  // Solid wood desktop
  desk.add(atcBox("desk-top", [dW, 0.04, dD], [0, dH, 0], "wood", materials, "woodworking", 0.015));

  // 3-drawer cabinet stack on the left side of the desk (matching frame_7040.jpg)
  const cabW = 0.42;
  const cabX = -dW / 2 + cabW / 2 + 0.04;
  desk.add(atcBox("desk-drawer-cabinet", [cabW, dH - 0.04, dD - 0.06], [cabX, (dH - 0.04) / 2, 0], "wood", materials, "woodworking"));
  for (let i = 0; i < 3; i += 1) {
    const dy = 0.12 + i * 0.22;
    desk.add(atcBox(`desk-drawer-front-${i}`, [cabW - 0.03, 0.18, 0.02], [cabX, dy, dD / 2 - 0.02], "steelDark", materials, "woodworking"));
    desk.add(atcBox(`desk-drawer-handle-${i}`, [0.12, 0.015, 0.02], [cabX, dy, dD / 2], "chrome", materials, "woodworking"));
  }

  // Right steel legs
  const legX = dW / 2 - 0.06;
  desk.add(atcBox("desk-leg-rf", [0.05, dH - 0.04, 0.05], [legX, (dH - 0.04) / 2, dD / 2 - 0.06], "steelDark", materials, "woodworking"));
  desk.add(atcBox("desk-leg-rb", [0.05, dH - 0.04, 0.05], [legX, (dH - 0.04) / 2, -dD / 2 + 0.06], "steelDark", materials, "woodworking"));
  desk.add(atcBox("desk-leg-stretcher", [0.04, 0.04, dD - 0.12], [legX, 0.15, 0], "steelDark", materials, "woodworking"));

  // Widescreen LCD Monitor showing real CNC toolpath software screen!
  const monX = 0.12;
  desk.add(atcBox("monitor-base", [0.24, 0.018, 0.2], [monX, dH + 0.03, -0.05], "black", materials, "woodworking", 0.008));
  desk.add(atcBox("monitor-stand-neck", [0.04, 0.18, 0.04], [monX, dH + 0.12, -0.07], "chrome", materials, "woodworking"));
  desk.add(atcBox("monitor-bezel", [0.56, 0.36, 0.03], [monX, dH + 0.28, -0.05], "black", materials, "woodworking", 0.01));
  desk.add(atcBox("monitor-screen", [0.52, 0.32, 0.005], [monX, dH + 0.28, -0.034], "cncScreen", materials, "woodworking"));

  // Keyboard & Mouse
  desk.add(atcBox("operator-keyboard", [0.44, 0.014, 0.14], [monX - 0.02, dH + 0.025, 0.18], "black", materials, "woodworking", 0.005));
  desk.add(atcBox("operator-mouse", [0.07, 0.02, 0.11], [monX + 0.28, dH + 0.025, 0.18], "black", materials, "woodworking", 0.008));

  // Swivel Operator Stool
  const stool = new THREE.Group();
  stool.name = "operator-stool";
  stool.position.set(monX, 0, 0.65);
  stool.add(atcCylinder("stool-seat", 0.18, 0.05, [0, 0.52, 0], "black", materials, "woodworking", 24));
  stool.add(atcCylinder("stool-stem", 0.03, 0.44, [0, 0.25, 0], "chrome", materials, "woodworking", 16));
  for (let a = 0; a < 4; a += 1) {
    const angle = (a * Math.PI) / 2;
    const leg = atcBox(`stool-foot-${a}`, [0.22, 0.03, 0.04], [Math.cos(angle) * 0.12, 0.05, Math.sin(angle) * 0.12], "steelDark", materials, "woodworking");
    leg.rotation.y = angle;
    stool.add(leg);
  }
  desk.add(stool);

  root.add(desk);

  return root;
}
