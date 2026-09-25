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
    position: new THREE.Vector3(13, 9.2, 12.5),
    target: new THREE.Vector3(0, 1.3, 0),
  },
  top: {
    position: new THREE.Vector3(0.001, 19, 0.001),
    target: new THREE.Vector3(0, 0, 0),
  },
};

function setSelection(runtime: AtcRuntime, active: AtcServiceId | null) {
  for (const [id, group] of Object.entries(runtime.services) as [AtcServiceId, THREE.Group][]) {
    group.traverse((node) => {
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
        const selected = active === id || (active === 'metalworking' && id === 'tooling-storage');
        const muted = active !== null && !selected;
        material.transparent = muted || material.userData.baseTransparent;
        material.opacity = muted ? 0.28 : material.userData.baseOpacity;
        material.depthWrite = !muted;
        material.emissive.setHex(selected ? 0x0b78c0 : material.userData.baseEmissive);
        material.emissiveIntensity = selected ? 0.2 : material.userData.baseEmissiveIntensity;
      }
    });
  }
}

export function useAtcScene({
  canvasRef,
  active,
  view,
  tour = false,
  interactive = true,
  showLabels = false,
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
    renderer.toneMappingExposure = 1.14;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdce2df);

    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 90);
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

    // Diffuse daylight enters through the high workshop windows.
    scene.add(new THREE.HemisphereLight(0xf5f7f2, 0x747d78, 1.55));

    const sunLight = new THREE.DirectionalLight(0xfff0d7, 2.8);
    sunLight.position.set(-8, 13, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.bias = -0.00035;
    sunLight.shadow.normalBias = 0.025;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xe1eff5, 1.05);
    fillLight.position.set(8, 7, -9);
    scene.add(fillLight);

    const warmShopLight = new THREE.PointLight(0xffe3b1, 22, 10, 2);
    warmShopLight.position.set(-2.8, 3.35, 0.4);
    scene.add(warmShopLight);
    const coolShopLight = new THREE.PointLight(0xdcecff, 16, 9, 2);
    coolShopLight.position.set(3.1, 3.2, -1.4);
    scene.add(coolShopLight);

    // Ground shadow receiver
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 36),
      new THREE.ShadowMaterial({ color: 0x26302d, opacity: 0.14 }),
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
    toggleRoof: () => runtimeRef.current?.toggleRoof(),
  };
}
