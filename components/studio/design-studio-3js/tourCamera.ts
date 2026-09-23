/*
  The guided tour's camera driver.

  Change request 2026-09-21, section 4: "let the room rotate slowly,
  constantly, highlighting different parts of the room". While the tour runs
  the camera is driven from here rather than by OrbitControls: a constant, slow
  yaw around whatever is in focus, closing on the highlighted service group and
  pulling back to the whole room when nothing is highlighted.

  Drive and orbit are deliberately not mixed. OrbitControls' own autoRotate
  works by rotating around its target, so lerping the camera toward a new focus
  at the same time makes the two fight and the room judders. While the tour
  runs the controls are off and this owns the camera; the moment it stops,
  controls.target is already where the camera is looking, so handing back is
  seamless.

  Split from useDesignStudioScene so neither file passes the 150-line rule.
*/

import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type { StudioRuntime } from "./createDesignStudioModel";
import type { ServiceId } from "./studioLayout";

/** radians per frame: one full turn in roughly ninety seconds at 60fps */
const YAW_PER_FRAME = 0.0012;
/** how hard the camera chases its mark each frame. Low is slow and smooth. */
const CHASE = 0.045;

const ROOM = { radius: 14.5, phi: 0.92, height: 0.9 };
/** How far from the room centre toward a station the camera stands (0 = centre,
    negative = back past the centre). "zoom out abit": a little behind centre. */
const CENTRE_PULL = -0.15;
/** Standing eye height inside the room, in metres. */
const EYE_HEIGHT = 2.0;
const CLOSE = { radius: 6.4, phi: 1.12 };

/*
  Enhancements 2026-09-22: "on design and cad just zoom in into the monitors".
  The design group spans the door, the screens and the whiteboard, so its
  centre is mid-room. For design the tour looks at the computer stations
  instead (studioLayout 'computer-stations', monitors at about 1.2 m), from a
  standing position just in front of them.
*/
const CLOSE_UPS: Partial<Record<ServiceId, { aim: [number, number, number]; seat: [number, number, number] }>> = {
  design: { aim: [-2.45, 1.15, -3.12], seat: [-2.45, 1.55, -1.35] },
  textiles: { aim: [-4.85, 1.15, 0.8], seat: [-1.6, 1.55, 1.45] },
};

/** Centre of a service group, cached: the geometry never moves. */
function centreOf(runtime: StudioRuntime, service: ServiceId | null, into: THREE.Vector3) {
  if (!service) return into.set(0, ROOM.height, 0);
  const group = runtime.services[service];
  if (!group) return into.set(0, ROOM.height, 0);
  const cached = group.userData.centre as THREE.Vector3 | undefined;
  if (cached) return into.copy(cached);
  const box = new THREE.Box3().setFromObject(group);
  const centre = box.getCenter(new THREE.Vector3());
  group.userData.centre = centre;
  return into.copy(centre);
}

export type TourDrive = {
  tour: boolean;
  interactive: boolean;
  active: ServiceId | null;
};

/**
 * Returns the per-frame step for the render loop. Call it once a frame with
 * the current drive; it either turns the room or hands the camera back to
 * OrbitControls, and keeps the two in step either way.
 */
export function createTourCamera(
  runtime: StudioRuntime,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  still: boolean,
) {
  const mark = new THREE.Vector3();
  const aim = controls.target.clone();
  const seat = new THREE.Vector3();
  let yaw = Math.atan2(camera.position.z, camera.position.x);
  let reach = camera.position.distanceTo(controls.target);

  return function step(drive: TourDrive) {
    if (!drive.tour) {
      controls.enabled = drive.interactive;
      // Stay in step, so starting the tour picks up where the reader left off.
      yaw = Math.atan2(
        camera.position.z - controls.target.z,
        camera.position.x - controls.target.x,
      );
      reach = camera.position.distanceTo(controls.target);
      aim.copy(controls.target);
      controls.update();
      return;
    }

    controls.enabled = false;
    if (!still) yaw += YAW_PER_FRAME;

    const close = drive.active !== null;
    const { radius, phi } = close ? CLOSE : ROOM;

    const closeUp = drive.active ? CLOSE_UPS[drive.active] : undefined;
    if (closeUp) mark.set(...closeUp.aim);
    else centreOf(runtime, drive.active, mark);
    if (!close) mark.y = ROOM.height;
    aim.lerp(mark, CHASE);
    reach += (radius - reach) * CHASE;

    if (close) {
      /* Enhancements 2026-09-22: "let it happen from the centre of the room so
         that the components are on the front view". The camera stands near
         the middle of the room, just back from centre, and faces
         it: the station is seen head-on from inside the room, never from
         behind a wall. A station at the very centre is seen from just in
         front of it. */
      const toward = Math.hypot(aim.x, aim.z);
      if (closeUp) seat.set(...closeUp.seat);
      else if (toward > 0.5) seat.set(aim.x * CENTRE_PULL, EYE_HEIGHT, aim.z * CENTRE_PULL);
      else seat.set(aim.x, EYE_HEIGHT, aim.z + 3.2);
      // Keep the orbit in step, so pulling back to the room starts from here.
      yaw = Math.atan2(camera.position.z - aim.z, camera.position.x - aim.x);
    } else {
      seat.set(
        aim.x + reach * Math.sin(phi) * Math.cos(yaw),
        aim.y + reach * Math.cos(phi),
        aim.z + reach * Math.sin(phi) * Math.sin(yaw),
      );
    }
    camera.position.lerp(seat, CHASE);
    camera.lookAt(aim);
    controls.target.copy(aim);
  };
}
