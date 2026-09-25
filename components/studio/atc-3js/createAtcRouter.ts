/* Source: the Blue Elephant ELECNC1212 router shown in IMG_0938.MP4. */

import * as THREE from "three";

import type { AtcMaterials } from "./materials";
import { addTextPlate, atcBox, atcCylinder, atcTube } from "./primitives";

function addDuctRibs(group: THREE.Group, materials: AtcMaterials) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.1, 1.48, -0.1),
    new THREE.Vector3(-0.55, 1.64, -0.28),
    new THREE.Vector3(-0.95, 1.52, -0.53),
    new THREE.Vector3(-1.2, 1.12, -0.78),
  ]);
  group.add(atcTube("router-dust-extraction-hose", curve.points.map((point) => [point.x, point.y, point.z]), 0.082, "duct", materials, "woodworking", 36));
  const ringMaterial = materials.palette.steelDark.clone();
  for (let index = 0; index <= 24; index += 1) {
    const t = index / 24;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.084, 0.009, 6, 16), ringMaterial.clone());
    ring.name = `router-hose-corrugation-${index}`;
    ring.position.copy(curve.getPointAt(t));
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), curve.getTangentAt(t));
    ring.castShadow = true;
    ring.userData.service = "woodworking";
    group.add(ring);
  }
}

export function createAtcRouter(materials: AtcMaterials): THREE.Group {
  const router = new THREE.Group();
  router.name = "blue-elephant-elecnc1212-router";
  router.position.set(2.55, 0, 0.25);
  router.userData.service = "woodworking";

  router.add(atcBox("router-lower-cabinet", [3.5, 0.4, 2.4], [0, 0.38, 0], "white", materials, "woodworking", 0.035));
  router.add(atcBox("router-front-apron", [3.42, 0.22, 0.055], [0, 0.55, 1.2], "white", materials, "woodworking", 0.018));
  router.add(atcBox("router-bed-frame", [3.48, 0.1, 2.26], [0, 0.68, 0], "steelDark", materials, "woodworking"));
  router.add(atcBox("router-work-bed", [3.18, 0.06, 2.0], [0, 0.77, 0], "chrome", materials, "woodworking"));

  for (const x of [-1.53, 1.53]) {
    router.add(atcBox(`router-side-track-${x}`, [0.17, 0.14, 2.18], [x, 0.88, 0], "steelDark", materials, "woodworking", 0.018));
    router.add(atcBox(`router-linear-guide-${x}`, [0.065, 0.055, 2.12], [x, 0.985, 0], "chrome", materials, "woodworking"));
    router.add(atcBox(`router-gantry-upright-${x}`, [0.24, 0.72, 0.24], [x, 1.4, 0], "white", materials, "woodworking", 0.035));
    router.add(atcBox(`router-gantry-yellow-cap-${x}`, [0.27, 0.09, 0.27], [x, 1.76, 0], "yellow", materials, "woodworking", 0.025));
  }

  router.add(atcBox("router-gantry-beam", [3.18, 0.31, 0.32], [0, 1.72, 0], "yellow", materials, "woodworking", 0.035));
  router.add(atcBox("router-gantry-front-rail", [2.88, 0.1, 0.07], [0, 1.68, 0.2], "steelDark", materials, "woodworking"));
  router.add(atcBox("router-gantry-bellows", [2.55, 0.18, 0.14], [0, 1.43, 0.11], "black", materials, "woodworking", 0.035));

  router.add(atcBox("router-head-carriage", [0.38, 0.38, 0.36], [0, 1.39, 0.1], "white", materials, "woodworking", 0.04));
  router.add(atcBox("router-head-dark-cover", [0.28, 0.2, 0.3], [0, 1.34, 0.3], "steelDark", materials, "woodworking", 0.025));
  router.add(atcCylinder("router-spindle-motor", 0.105, 0.34, [0, 1.12, 0.12], "chrome", materials, "woodworking", 32));
  router.add(atcCylinder("router-spindle-collet", 0.033, 0.13, [0, 0.89, 0.12], "steelDark", materials, "woodworking", 20));
  router.add(atcCylinder("router-dust-shoe", 0.14, 0.055, [0, 0.84, 0.12], "black", materials, "woodworking", 32));
  router.add(atcBox("router-workpiece", [2.05, 0.035, 1.08], [0.18, 0.825, -0.15], "plywood", materials, "woodworking", 0.012));

  for (let index = 0; index < 7; index += 1) {
    router.add(atcBox(`router-bed-rib-${index}`, [0.025, 0.018, 1.88], [-1.35 + index * 0.45, 0.814, 0], "steel", materials, "woodworking"));
  }

  for (const x of [-1.32, 1.32]) {
    const foot = atcBox(`router-adjustable-foot-${x}`, [0.2, 0.08, 0.22], [x, 0.04, 0.91], "rubber", materials, "woodworking");
    router.add(foot);
  }

  const brand = addTextPlate(router, "blue-elephant-brand", "BLUE ELEPHANT", "ELECNC1212", [1.78, 0.34], [0, 0.55, 1.235], "#dba62e", "#1b2021", materials, "woodworking");
  if (brand) brand.position.y = 0.56;
  addDuctRibs(router, materials);

  const controller = new THREE.Group();
  controller.name = "cnc-controller-console";
  controller.position.set(2.15, 0, 0.22);
  controller.userData.service = "woodworking";
  controller.add(atcBox("cnc-console-pedestal", [0.54, 0.82, 0.5], [0, 0.42, 0], "steelDark", materials, "woodworking", 0.025));
  controller.add(atcBox("cnc-console-screen-housing", [0.58, 0.47, 0.14], [0, 1.05, -0.08], "white", materials, "woodworking", 0.035));
  controller.add(atcBox("cnc-console-screen", [0.44, 0.3, 0.018], [0, 1.06, 0.0], "screen", materials, "woodworking", 0.012));
  controller.add(atcCylinder("cnc-console-emergency-stop", 0.052, 0.065, [0.2, 0.79, 0.1], "red", materials, "woodworking", 24));
  router.add(controller);

  return router;
}
