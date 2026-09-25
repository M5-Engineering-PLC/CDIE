/* Metalworking & Fabrication Workstations: Heavy-duty workbenches in the open workshop.
   Source: sideView_workbenchWithlightcomingfromDoor.webp, viewAsOneEntersDoor.jpg, frame_7030.jpg, frame_7039.jpg.
   Equipped with TOTAL swivel bench vice clamping steel stock, yellow TOTAL MMA inverter welder,
   angle grinder, cordless drill, machinist tools, and workshop stools. */

import * as THREE from "three";

import type { AtcMaterials } from "./materials";
import { atcBox, atcCylinder } from "./primitives";

function createWorkbenchTable(
  name: string,
  width: number,
  depth: number,
  height: number,
  position: readonly [number, number, number],
  materials: AtcMaterials,
  service: "metalworking" | "woodworking",
) {
  const bench = new THREE.Group();
  bench.name = name;
  bench.position.set(...position);
  bench.userData.service = service;

  // Solid hardwood worktop (procedural wood grain)
  bench.add(atcBox(`${name}-wood-top`, [width, 0.08, depth], [0, height, 0], "wood", materials, service, 0.015));

  // 6-legged heavy-duty steel frame (matching site photos)
  const legCoords = [
    [-width / 2 + 0.08, -depth / 2 + 0.08],
    [0, -depth / 2 + 0.08],
    [width / 2 - 0.08, -depth / 2 + 0.08],
    [-width / 2 + 0.08, depth / 2 - 0.08],
    [0, depth / 2 - 0.08],
    [width / 2 - 0.08, depth / 2 - 0.08],
  ] as const;

  legCoords.forEach(([lx, lz], idx) => {
    bench.add(atcBox(`${name}-leg-${idx}`, [0.065, height - 0.08, 0.065], [lx, (height - 0.08) / 2, lz], "steelDark", materials, service));
    bench.add(atcBox(`${name}-foot-${idx}`, [0.14, 0.02, 0.14], [lx, 0.01, lz], "steel", materials, service));
  });

  // Lower tie stretchers and storage shelf
  bench.add(atcBox(`${name}-stretcher-x1`, [width - 0.14, 0.04, 0.04], [0, 0.22, -depth / 2 + 0.08], "steelDark", materials, service));
  bench.add(atcBox(`${name}-stretcher-x2`, [width - 0.14, 0.04, 0.04], [0, 0.22, depth / 2 - 0.08], "steelDark", materials, service));
  bench.add(atcBox(`${name}-lower-shelf`, [width - 0.2, 0.03, depth - 0.2], [0, 0.24, 0], "steel", materials, service));

  return bench;
}

function addStool(group: THREE.Group, materials: AtcMaterials, x: number, z: number) {
  const stool = new THREE.Group();
  stool.position.set(x, 0, z);
  stool.add(atcCylinder("stool-seat", 0.16, 0.04, [0, 0.52, 0], "wood", materials, "metalworking", 24));
  stool.add(atcCylinder("stool-leg", 0.03, 0.5, [0, 0.25, 0], "steelDark", materials, "metalworking", 16));
  group.add(stool);
}

export function createAtcMetalWorkstations(materials: AtcMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = "metalworking-fabrication-zone";
  root.userData.service = "metalworking";

  // =========================================================================
  // Workbench 1: Fabrication & Welding Bench (Center Foreground at [1.0, 0, 1.4])
  // Source: sideView_workbenchWithlightcomingfromDoor.webp, viewAsOneEntersDoor.jpg
  // =========================================================================
  const tW = 2.9;
  const tD = 1.1;
  const tH = 0.88;

  const bench1 = createWorkbenchTable("welding-workbench-1", tW, tD, tH, [1.0, 0, 1.4], materials, "metalworking");

  // 1A. TOTAL Swivel Bench Vice (Source: sideView_workbenchWithlightcomingfromDoor.webp)
  // Gold/bronze body mounted on front corner, clamping a square steel tube
  const viceX = tW / 2 - 0.28;
  const viceZ = tD / 2 - 0.18;
  bench1.add(atcCylinder("vice-swivel-base", 0.11, 0.04, [viceX, tH + 0.04, viceZ], "steelDark", materials, "metalworking", 20));
  bench1.add(atcBox("vice-body-main", [0.18, 0.15, 0.26], [viceX, tH + 0.135, viceZ], "viceGold", materials, "metalworking", 0.015));
  bench1.add(atcBox("vice-fixed-jaw", [0.08, 0.11, 0.28], [viceX, tH + 0.17, viceZ - 0.15], "chrome", materials, "metalworking"));
  bench1.add(atcBox("vice-moving-jaw", [0.08, 0.11, 0.28], [viceX, tH + 0.17, viceZ + 0.15], "chrome", materials, "metalworking"));
  const viceHandle = atcCylinder("vice-screw-handle", 0.016, 0.38, [viceX, tH + 0.12, viceZ + 0.26], "chrome", materials, "metalworking", 16);
  viceHandle.rotation.z = Math.PI / 2;
  bench1.add(viceHandle);

  // Clamped square steel tube in vice (Source: sideView_workbenchWithlightcomingfromDoor.webp)
  bench1.add(atcBox("clamped-steel-tube", [0.05, 0.05, 0.75], [viceX, tH + 0.175, viceZ], "steelDark", materials, "metalworking"));

  // 1B. TOTAL Yellow MMA Inverter Welder (Source: viewAsOneEntersDoor.jpg)
  const welderX = -0.72;
  const welderZ = 0.12;
  bench1.add(atcBox("inverter-welder-body", [0.36, 0.26, 0.2], [welderX, tH + 0.15, welderZ], "yellow", materials, "metalworking", 0.02));
  bench1.add(atcBox("welder-handle", [0.24, 0.04, 0.04], [welderX, tH + 0.29, welderZ], "black", materials, "metalworking", 0.01));
  // Front circular cooling fan grill
  bench1.add(atcCylinder("welder-fan-grill", 0.065, 0.01, [welderX, tH + 0.14, welderZ + 0.105], "black", materials, "metalworking", 24));
  bench1.add(atcBox("welder-digital-display", [0.09, 0.04, 0.01], [welderX + 0.08, tH + 0.22, welderZ + 0.105], "screen", materials, "metalworking"));

  // 1C. Angle Grinder (Source: sideView_workbenchWithlightcomingfromDoor.webp)
  const grinderX = 0.35;
  const grinderZ = -0.16;
  const grinderBody = atcCylinder("grinder-motor-body", 0.038, 0.24, [grinderX, tH + 0.05, grinderZ], "turquoise", materials, "metalworking", 16);
  grinderBody.rotation.z = Math.PI / 2;
  bench1.add(grinderBody);
  const cuttingDisc = atcCylinder("grinder-cutting-disc", 0.075, 0.006, [grinderX + 0.14, tH + 0.05, grinderZ], "steelDark", materials, "metalworking", 24);
  cuttingDisc.rotation.z = Math.PI / 2;
  bench1.add(cuttingDisc);

  // 1D. Auto-Darkening Welding Helmet (Source: sideView_workbenchWithlightcomingfromDoor.webp)
  const helmetX = -0.2;
  const helmetZ = 0.22;
  bench1.add(atcBox("welding-helmet-shell", [0.22, 0.24, 0.22], [helmetX, tH + 0.12, helmetZ], "black", materials, "metalworking", 0.03));
  bench1.add(atcBox("welding-helmet-visor-frame", [0.12, 0.09, 0.02], [helmetX, tH + 0.13, helmetZ + 0.11], "turquoise", materials, "metalworking", 0.01));
  bench1.add(atcBox("welding-helmet-lens", [0.1, 0.055, 0.005], [helmetX, tH + 0.13, helmetZ + 0.12], "darkGlass", materials, "metalworking"));
  bench1.add(atcCylinder("welding-helmet-knob", 0.018, 0.02, [helmetX + 0.12, tH + 0.12, helmetZ], "red", materials, "metalworking", 12));

  // 1E. Machinist Ball-Peen Hammer & Tape Measure
  const hammerHandle = atcCylinder("ballpeen-hammer-handle", 0.012, 0.32, [-0.15, tH + 0.02, -0.22], "wood", materials, "metalworking", 12);
  hammerHandle.rotation.x = Math.PI / 2;
  bench1.add(hammerHandle);
  bench1.add(atcBox("ballpeen-hammer-head", [0.035, 0.035, 0.1], [-0.15, tH + 0.035, -0.06], "steelDark", materials, "metalworking", 0.005));

  // Yellow Compact Steel Tape Measure
  bench1.add(atcBox("tape-measure-case", [0.075, 0.075, 0.035], [0.65, tH + 0.038, -0.2], "yellow", materials, "metalworking", 0.01));
  bench1.add(atcBox("tape-measure-hook", [0.015, 0.02, 0.04], [0.65, tH + 0.01, -0.24], "chrome", materials, "metalworking"));

  // 1F. Chrome Spanners Set (10mm, 13mm, 17mm)
  [-0.32, -0.42, -0.52].forEach((sx, idx) => {
    const spanner = atcBox(`spanner-${idx}`, [0.018 + idx * 0.003, 0.006, 0.14 + idx * 0.03], [sx, tH + 0.008, -0.25], "chrome", materials, "metalworking");
    spanner.rotation.y = 0.15;
    bench1.add(spanner);
  });

  // Safety Goggles (Clear lens, black strap)
  bench1.add(atcBox("safety-goggles-lens", [0.14, 0.045, 0.06], [0.05, tH + 0.025, 0.3], "glass", materials, "metalworking"));
  bench1.add(atcBox("safety-goggles-strap", [0.16, 0.015, 0.08], [0.05, tH + 0.015, 0.28], "rubber", materials, "metalworking"));

  // Stools
  addStool(bench1, materials, -0.9, 0.75);
  addStool(bench1, materials, 0.6, 0.75);

  root.add(bench1);

  // =========================================================================
  // Workbench 2: Parallel Assembly & Layout Bench (Center-Right at [1.0, 0, -1.2])
  // =========================================================================
  const bench2 = createWorkbenchTable("assembly-workbench-2", tW, tD, tH, [1.0, 0, -1.2], materials, "metalworking");

  // Cordless drill (Total turquoise)
  bench2.add(atcBox("cordless-drill-body", [0.18, 0.16, 0.06], [-0.65, tH + 0.1, 0.12], "turquoise", materials, "metalworking", 0.01));
  bench2.add(atcCylinder("cordless-drill-chuck", 0.02, 0.06, [-0.65, tH + 0.14, 0.18], "steelDark", materials, "metalworking", 16));

  // Precision tools: Machinist square, digital caliper, steel rule
  bench2.add(atcBox("machinist-square-blade", [0.22, 0.005, 0.04], [0.35, tH + 0.035, -0.15], "chrome", materials, "metalworking"));
  bench2.add(atcBox("machinist-square-stock", [0.04, 0.015, 0.16], [0.44, tH + 0.04, -0.15], "steelDark", materials, "metalworking"));
  bench2.add(atcBox("caliper-beam", [0.24, 0.006, 0.035], [-0.15, tH + 0.035, -0.2], "chrome", materials, "metalworking"));
  bench2.add(atcBox("parts-tray-screws", [0.32, 0.045, 0.22], [0.85, tH + 0.05, 0.15], "steelDark", materials, "metalworking", 0.01));

  // Digital Multimeter (Yellow protective boot, LCD, selector dial)
  const dmmX = 0.08;
  const dmmZ = 0.18;
  bench2.add(atcBox("multimeter-case", [0.1, 0.035, 0.18], [dmmX, tH + 0.03, dmmZ], "yellow", materials, "metalworking", 0.01));
  bench2.add(atcBox("multimeter-screen", [0.07, 0.005, 0.045], [dmmX, tH + 0.05, dmmZ - 0.04], "screen", materials, "metalworking"));
  bench2.add(atcCylinder("multimeter-dial", 0.02, 0.01, [dmmX, tH + 0.05, dmmZ + 0.03], "black", materials, "metalworking", 16));

  // Soldering Station (Compact soldering iron, stand & solder wire spool)
  const solderX = -0.32;
  const solderZ = -0.18;
  bench2.add(atcBox("solder-station-base", [0.15, 0.11, 0.14], [solderX, tH + 0.06, solderZ], "containerBlue", materials, "metalworking", 0.01));
  bench2.add(atcCylinder("solder-iron-pencil", 0.012, 0.18, [solderX + 0.12, tH + 0.08, solderZ], "turquoise", materials, "metalworking", 12));
  bench2.add(atcCylinder("solder-wire-spool", 0.04, 0.045, [solderX - 0.14, tH + 0.035, solderZ], "chrome", materials, "metalworking", 16));

  // Solid aluminum prototype blocks & angle brackets
  bench2.add(atcBox("prototype-block-1", [0.08, 0.06, 0.12], [0.45, tH + 0.04, 0.18], "chrome", materials, "metalworking"));
  bench2.add(atcBox("prototype-bracket-l", [0.05, 0.05, 0.08], [0.56, tH + 0.035, 0.18], "steelDark", materials, "metalworking"));

  addStool(bench2, materials, -0.6, -0.75);
  addStool(bench2, materials, 0.6, -0.75);

  root.add(bench2);

  // =========================================================================
  // Workbench 3: Wood Assembly & Staging Table (Right Foreground at [3.8, 0, 1.4])
  // =========================================================================
  const bench3 = createWorkbenchTable("wood-staging-workbench-3", 2.4, tD, tH, [3.8, 0, 1.4], materials, "woodworking");
  bench3.add(atcBox("assembly-plywood-board", [1.4, 0.03, 0.78], [0, tH + 0.04, 0], "plywood", materials, "woodworking", 0.008));
  bench3.add(atcBox("assembly-bar-clamp-1", [0.04, 0.14, 0.86], [-0.45, tH + 0.09, 0], "steelDark", materials, "woodworking"));
  bench3.add(atcBox("assembly-bar-clamp-2", [0.04, 0.14, 0.86], [0.45, tH + 0.09, 0], "steelDark", materials, "woodworking"));

  // Wood Chisels with polished steel blades & try square
  bench3.add(atcCylinder("wood-chisel-1", 0.014, 0.22, [-0.75, tH + 0.02, 0.15], "wood", materials, "woodworking", 12));
  bench3.add(atcCylinder("wood-chisel-2", 0.016, 0.24, [-0.75, tH + 0.02, -0.1], "wood", materials, "woodworking", 12));
  bench3.add(atcBox("try-square-blade", [0.26, 0.005, 0.04], [0.72, tH + 0.02, -0.12], "chrome", materials, "woodworking"));
  bench3.add(atcBox("try-square-stock", [0.04, 0.015, 0.14], [0.82, tH + 0.025, -0.12], "steelDark", materials, "woodworking"));

  root.add(bench3);

  return root;
}
