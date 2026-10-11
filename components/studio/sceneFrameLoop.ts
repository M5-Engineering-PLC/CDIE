// Lucid: Design Studio virtual tour. Geometry: the Three.js room layout modules.
import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* Fix plan 2026-10-11, W2: draw only during motion or invalidation, and pause unseen canvases. */
export function createSceneFrameLoop({ canvas, renderer, scene, camera, controls, step, paused, touring }: {
  canvas: HTMLCanvasElement;
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  controls: OrbitControls;
  step: () => void;
  paused: () => boolean;
  touring: () => boolean;
}) {
  let frame = 0;
  let visible = false;
  let drawing = false;
  let dirty = true;
  let disposed = false;
  const position = camera.position.clone();
  const rotation = camera.quaternion.clone();
  const target = controls.target.clone();
  const canDraw = () => !disposed && visible && !document.hidden && !paused();
  const schedule = () => {
    if (canDraw() && !frame) frame = window.requestAnimationFrame(draw);
  };
  const invalidate = (shadows = false) => {
    dirty = true;
    if (shadows) renderer.shadowMap.needsUpdate = true;
    if (!canDraw()) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    } else if (!drawing) schedule();
  };
  const draw = () => {
    frame = 0;
    if (!canDraw()) return;
    drawing = true;
    position.copy(camera.position);
    rotation.copy(camera.quaternion);
    target.copy(controls.target);
    step();
    const moving = position.distanceToSquared(camera.position) > 1e-10
      || target.distanceToSquared(controls.target) > 1e-10
      || 1 - Math.abs(rotation.dot(camera.quaternion)) > 1e-10;
    if (dirty || moving || touring()) renderer.render(scene, camera);
    dirty = false;
    drawing = false;
    if (moving || touring()) schedule();
  };
  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    renderer.setSize(bounds.width, bounds.height, false);
    camera.aspect = bounds.width / bounds.height;
    camera.updateProjectionMatrix();
    invalidate();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    invalidate();
  });
  intersection.observe(canvas);
  const visibility = () => invalidate();
  const change = () => invalidate();
  document.addEventListener("visibilitychange", visibility);
  controls.addEventListener("change", change);
  controls.addEventListener("start", change);
  controls.addEventListener("end", change);
  return {
    invalidate,
    dispose: () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      controls.removeEventListener("change", change);
      controls.removeEventListener("start", change);
      controls.removeEventListener("end", change);
    },
  };
}
