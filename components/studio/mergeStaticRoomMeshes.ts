// Geometry source: the Three.js room layout modules. No positions are authored here.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/* Fix plan 2026-10-11, W2: merge static background geometry without touching capability pick or highlight meshes. */
export function mergeStaticRoomMeshes(root: THREE.Group) {
  const parents: THREE.Object3D[] = [];
  root.traverse((node) => { if (node.children.length) parents.push(node); });
  for (const parent of parents) {
    let serviceOwner: THREE.Object3D | null = parent;
    while (serviceOwner && !serviceOwner.userData.service) serviceOwner = serviceOwner.parent;
    if (serviceOwner) continue;
    const batches = new Map<string, THREE.Mesh[]>();
    for (const node of parent.children) {
      if (!(node instanceof THREE.Mesh) || node.children.length || node.userData.service || node.userData.alsoService) continue;
      if (node instanceof THREE.SkinnedMesh || node instanceof THREE.InstancedMesh) continue;
      if (Array.isArray(node.material) || node.material.transparent || node.geometry.morphAttributes.position) continue;
      if (node.geometry.drawRange.count !== Infinity || !node.visible) continue;
      // The builders clone palette materials. Identical clones can use one material within this static parent.
      const material = Object.fromEntries(Object.entries(node.material.toJSON()).filter(([key]) => key !== "uuid" && key !== "metadata"));
      const attributes = Object.entries((node.geometry as THREE.BufferGeometry).attributes).map(([name, attribute]) => [name, attribute.itemSize, attribute.normalized]).sort();
      const key = JSON.stringify([material, attributes, node.castShadow, node.receiveShadow, node.renderOrder, node.layers.mask]);
      const batch = batches.get(key) ?? [];
      batch.push(node);
      batches.set(key, batch);
    }
    for (const meshes of batches.values()) {
      if (meshes.length < 2) continue;
      const geometries = meshes.map((mesh) => {
        mesh.updateMatrix();
        const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
        return geometry.applyMatrix4(mesh.matrix);
      });
      const geometry = mergeGeometries(geometries, false);
      geometries.forEach((item) => item.dispose());
      if (!geometry) continue;
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      const first = meshes[0];
      const merged = new THREE.Mesh(geometry, first.material);
      merged.name = `${parent.name || "room"}-static-${first.name}`;
      merged.castShadow = first.castShadow;
      merged.receiveShadow = first.receiveShadow;
      merged.renderOrder = first.renderOrder;
      merged.layers.mask = first.layers.mask;
      parent.add(merged);
      for (const mesh of meshes) {
        parent.remove(mesh);
        mesh.geometry.dispose();
        if (mesh.material !== first.material) (mesh.material as THREE.Material).dispose();
      }
    }
  }
}
