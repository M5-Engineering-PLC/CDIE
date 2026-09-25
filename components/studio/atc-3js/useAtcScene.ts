"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { createAtcModel, type AtcRuntime } from "./createAtcModel";
import { createAtcTourCamera } from "./atcTourCamera";
import type { AtcServiceId } from "./atcLayout";

export type AtcView = "isometric" | "top";

type SceneOptions = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  active: AtcServiceId | null;
  view: AtcView;
  tour?: boolean;
  interactive?: boolean;
  showLabels?: boolean;
  onSelect?: (service: AtcServiceId) => void;
  onReady?: (runtime: AtcRuntime) => void;
  onError?: () => void;
};

const views: Record<AtcView, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  isometric: {
    position: new THREE.Vector3(12.5, 10.5, 12.5),
    target: new THREE.Vector3(0, 0.4, 0),
  },
  top: {
    position: new THREE.Vector3(0.001, 18, 0.001),
    target: new THREE.Vector3(0, 0, 0),
  },
};

function setSelection(runtime: AtcRuntime, active: AtcServiceId | null) {
  runtime.root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      if (material.userData.baseOpacity === undefined) {
        material.userData.baseOpacity = material.opacity;
        material.userData.baseTransparent = material.transparent;
        material.userData.baseEmissive = material.emissive.getHex();
        material.userData.baseEmissiveIntensity = material.emissiveIntensity;
      }

      if (active === null) {
        // No selection: restore all objects to original opacity and visibility
        material.transparent = material.userData.baseTransparent;
        material.opacity = material.userData.baseOpacity;
        material.depthWrite = true;
        material.emissive.setHex(material.userData.baseEmissive);
        material.emissiveIntensity = material.userData.baseEmissiveIntensity;
      } else {
        // Determine if node or any ancestor belongs to the active station
        let service = node.userData.service as AtcServiceId | undefined;
        let parent = node.parent;
        while (!service && parent && parent !== runtime.root) {
          if (parent.userData.service) {
            service = parent.userData.service as AtcServiceId;
          }
          parent = parent.parent;
        }

        const isSelected = service === active;

        if (isSelected) {
          // Selected station: fully solid and visible with natural materials, NO blue highlight
          material.transparent = material.userData.baseTransparent;
          material.opacity = material.userData.baseOpacity;
          material.depthWrite = true;
          material.emissive.setHex(material.userData.baseEmissive);
          material.emissiveIntensity = material.userData.baseEmissiveIntensity;
        } else {
          // The rest of the space becomes transparent so the selected station is prominent
          material.transparent = true;
          material.opacity = 0.08;
          material.depthWrite = false;
          material.emissive.setHex(0x000000);
          material.emissiveIntensity = 0;
        }
      }
    }
  });
}

export function useAtcScene({
  canvasRef,
  active,
  view,
  tour = false,
  interactive = true,
  showLabels = true,
  onSelect,
  onReady,
  onError,
}: SceneOptions) {
  const runtimeRef = useRef<AtcRuntime | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const driveRef = useRef({ tour, interactive, active });
  const selectRef = useRef(onSelect);
  const readyRef = useRef(onReady);
  const errorRef = useRef(onError);

  useEffect(() => {
    selectRef.current = onSelect;
    readyRef.current = onReady;
    errorRef.current = onError;
  }, [onSelect, onReady, onError]);

  useEffect(() => {
    driveRef.current = { tour, interactive, active };
  }, [tour, interactive, active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      errorRef.current?.();
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
    camera.position.copy(views.isometric.position);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(views.isometric.target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 2.5;
    controls.maxDistance = 35;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.screenSpacePanning = true;
    controlsRef.current = controls;

    // Studio Lighting Rig
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe7ec, 1.3));

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    sunLight.position.set(12, 16, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.8);
    fillLight.position.set(-10, 12, -8);
    scene.add(fillLight);

    // Warm interior light inside the shipping container booth
    const containerInteriorLight = new THREE.PointLight(0xfff3db, 16, 8, 2);
    containerInteriorLight.position.set(-4.0, 2.1, 0.2);
    scene.add(containerInteriorLight);

    // Ground shadow receiver
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 36),
      new THREE.ShadowMaterial({ color: 0x334155, opacity: 0.12 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.11;
    ground.receiveShadow = true;
    scene.add(ground);

    // Build ATC model
    const model = createAtcModel();
    const runtime = model.userData.sculptRuntime as AtcRuntime;
    runtimeRef.current = runtime;
    scene.add(model);

    runtime.setLabelsVisible(showLabels);

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      renderer.setSize(bounds.width, bounds.height, false);
      camera.aspect = bounds.width / bounds.height;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const choose = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(runtime.selectable, false)[0];
      const service = hit?.object.userData.service as AtcServiceId | undefined;
      if (service) selectRef.current?.(service);
    };

    const contextLost = () => errorRef.current?.();
    canvas.addEventListener("click", choose);
    canvas.addEventListener("webglcontextlost", contextLost);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = createAtcTourCamera(runtime, camera, controls, still);

    renderer.setAnimationLoop(() => {
      step(driveRef.current);
      renderer.render(scene, camera);
    });

    readyRef.current?.(runtime);

    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      canvas.removeEventListener("click", choose);
      canvas.removeEventListener("webglcontextlost", contextLost);
      controls.dispose();
      model.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        node.geometry.dispose();
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => material.dispose());
      });
      runtime.sprites.forEach((sprite) => sprite.material.dispose());
      runtime.textures.forEach((texture) => texture.dispose());
      runtime.baseMaterials.forEach((material) => material.dispose());
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      renderer.dispose();
      runtimeRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
    };
  }, [canvasRef]);

  useEffect(() => {
    if (runtimeRef.current) setSelection(runtimeRef.current, active);
  }, [active]);

  useEffect(() => {
    if (runtimeRef.current) {
      runtimeRef.current.setLabelsVisible(showLabels);
    }
  }, [showLabels]);

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || tour) return;
    camera.position.copy(views[view].position);
    controls.target.copy(views[view].target);
    controls.update();
  }, [tour, view]);

  return {
    toggleShutter: () => runtimeRef.current?.toggleShutter(),
  };
}
