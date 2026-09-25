/* Source: the LASER station in the supplied hand-drawn ATC floor plan. */

import * as THREE from "three";

import type { AtcMaterials } from "./materials";
import { atcBox, atcTube } from "./primitives";

export function createAtcLaser(materials: AtcMaterials): THREE.Group {
  const laser = new THREE.Group();
  laser.name = "laser-cutting-workstation";
  laser.position.set(4.65, 0, -2.72);
  laser.userData.service = "laser-cutting";

  laser.add(atcBox("laser-base-cabinet", [1.82, 0.42, 1.5], [0, 0.28, 0], "steelDark", materials, "laser-cutting", 0.035));
  laser.add(atcBox("laser-machine-shell", [1.8, 0.92, 1.5], [0, 0.9, 0], "white", materials, "laser-cutting", 0.055));
  laser.add(atcBox("laser-front-door-frame", [1.34, 0.56, 0.075], [-0.1, 1.14, 0.77], "steel", materials, "laser-cutting", 0.025));
  laser.add(atcBox("laser-view-window", [1.12, 0.37, 0.018], [-0.1, 1.15, 0.82], "darkGlass", materials, "laser-cutting", 0.015));
  laser.add(atcBox("laser-cutting-bed", [1.28, 0.045, 0.78], [0, 0.81, 0.05], "steelDark", materials, "laser-cutting"));
  laser.add(atcBox("laser-bed-insert", [1.12, 0.018, 0.65], [0, 0.844, 0.05], "chrome", materials, "laser-cutting"));
  laser.add(atcBox("laser-control-panel", [0.26, 0.42, 0.08], [0.78, 1.05, 0.77], "blue", materials, "laser-cutting", 0.025));
  laser.add(atcBox("laser-touch-screen", [0.16, 0.13, 0.02], [0.78, 1.1, 0.825], "screen", materials, "laser-cutting"));
  laser.add(atcBox("laser-handle", [0.05, 0.18, 0.045], [0.53, 1.12, 0.83], "steelDark", materials, "laser-cutting", 0.018));
  laser.add(atcBox("laser-safety-trim", [1.55, 0.035, 0.04], [0, 0.46, 0.77], "yellow", materials, "laser-cutting"));
  const exhaustPoints = [
    [-0.65, 1.35, -0.55],
    [-0.7, 1.76, -0.8],
    [-0.8, 2.24, -1.05],
    [-0.8, 2.72, -1.32],
  ] as const;
  const exhaustCurve = new THREE.CatmullRomCurve3(exhaustPoints.map((point) => new THREE.Vector3(...point)));
  laser.add(atcTube("laser-exhaust-duct", exhaustPoints, 0.095, "duct", materials, "laser-cutting", 30));
  for (let index = 0; index < 16; index += 1) {
    const t = index / 15;
    const point = exhaustCurve.getPointAt(t);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.098, 0.008, 5, 14), materials.palette.steelDark.clone());
    ring.name = `laser-duct-rib-${index}`;
    ring.position.copy(point);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), exhaustCurve.getTangentAt(t));
    ring.castShadow = true;
    ring.userData.service = "laser-cutting";
    laser.add(ring);
  }

  return laser;
}
