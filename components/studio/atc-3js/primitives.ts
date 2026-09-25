import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import type { AtcMaterialKey, AtcMaterials } from "./materials";

export type AtcServiceId = "woodworking" | "tooling-storage" | "laser-cutting" | "metalworking" | "facility-access";
export type Point3 = readonly [number, number, number];

export function atcBox(
  name: string,
  size: Point3,
  position: Point3,
  material: AtcMaterialKey,
  materials: AtcMaterials,
  service?: AtcServiceId,
  radius = 0,
): THREE.Mesh {
  const geometry = radius > 0
    ? new RoundedBoxGeometry(size[0], size[1], size[2], 3, Math.min(radius, ...size.map((dimension) => dimension / 2)))
    : new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, materials.palette[material].clone());
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (service) mesh.userData.service = service;
  return mesh;
}

export function atcCylinder(
  name: string,
  radius: number,
  height: number,
  position: Point3,
  material: AtcMaterialKey,
  materials: AtcMaterials,
  service?: AtcServiceId,
  radialSegments = 24,
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, radialSegments),
    materials.palette[material].clone(),
  );
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (service) mesh.userData.service = service;
  return mesh;
}

export function atcTube(
  name: string,
  points: readonly Point3[],
  radius: number,
  material: AtcMaterialKey,
  materials: AtcMaterials,
  service?: AtcServiceId,
  tubularSegments = 40,
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false),
    materials.palette[material].clone(),
  );
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (service) mesh.userData.service = service;
  return mesh;
}

export function addTextPlate(
  parent: THREE.Group,
  name: string,
  line1: string,
  line2: string,
  size: readonly [number, number],
  position: Point3,
  background: string,
  foreground: string,
  materials: AtcMaterials,
  service?: AtcServiceId,
): THREE.Mesh | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = foreground;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "bold 78px Arial, sans-serif";
  context.fillText(line1, 512, line2 ? 102 : 128, 960);
  if (line2) {
    context.font = "bold 48px Arial, sans-serif";
    context.fillText(line2, 512, 195, 960);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  materials.textures.push(texture);
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(size[0], size[1]),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7, metalness: 0.06 }),
  );
  plate.name = name;
  plate.position.set(...position);
  plate.castShadow = false;
  plate.receiveShadow = true;
  if (service) plate.userData.service = service;
  parent.add(plate);
  return plate;
}
