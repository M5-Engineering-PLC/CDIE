"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { createAtcModel, type AtcRuntime } from "./createAtcModel";
import type { AtcServiceId } from "./atcLayout";

export type AtcView = "isometric" | "top";

type SceneOptions = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  active: AtcServiceId | null;
  view: AtcView;
  showLabels?: boolean;
  onSelect?: (service: AtcServiceId) => void;
  onReady?: (runtime: AtcRuntime) => void;
  onError?: () => void;
};

const views: Record<AtcView, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  isometric: {
    position: new THREE.Vector3(12.5, 11.0, 13.0),
    target: new THREE.Vector3(0, 0.4, 0),
  },
  top: {
    position: new THREE.Vector3(0.001, 18.0, 0.001),
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
        const selected = active === id;
        const muted = active !== null && !selected;
        material.transparent = muted || material.userData.baseTransparent;
        material.opacity = muted ? 0.25 : material.userData.baseOpacity;
        material.emissive.setHex(selected ? 0x0b78c0 : material.userData.baseEmissive);
        material.emissiveIntensity = selected ? 0.35 : material.userData.baseEmissiveIntensity;
      }
    });
  }
}

export function useAtcScene({
  canvasRef,
  active,
  view,
  showLabels = true,
  onSelect,
  onReady,
  onError,
}: SceneOptions) {
  const runtimeRef = useRef<AtcRuntime | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const selectRef = useRef(onSelect);
  const readyRef = useRef(onReady);
  const errorRef = useRef(onError);

  useEffect(() => {
    selectRef.current = onSelect;
    readyRef.current = onReady;
    errorRef.current = onError;
  }, [onSelect, onReady, onError]);

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
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    // Clean studio presentation background matching the design studio palette
    scene.background = new THREE.Color(0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.copy(views.isometric.position);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(views.isometric.target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 4;
    controls.maxDistance = 32;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.screenSpacePanning = true;
    controlsRef.current = controls;

    // Workshop Studio Lighting
    scene.add(new THREE.HemisphereLight(0xffffff, 0x475569, 1.4));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(12, 18, 14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.85);
    fillLight.position.set(-12, 14, -10);
    scene.add(fillLight);

    // Ground shadow receiver
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 36),
      new THREE.ShadowMaterial({ color: 0x334155, opacity: 0.12 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.11;
    ground.receiveShadow = true;
    scene.add(ground);

    // Build and add ATC model
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

    renderer.setAnimationLoop(() => {
      controls.update();
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
    if (!camera || !controls) return;
    camera.position.copy(views[view].position);
    controls.target.copy(views[view].target);
    controls.update();
  }, [view]);

  return {
    toggleShutter: () => runtimeRef.current?.toggleShutter(),
  };
}
