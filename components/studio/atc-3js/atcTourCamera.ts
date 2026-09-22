/*
  The guided tour camera driver for the ATC Engineering & Prototyping Workshop.
  Controls smooth continuous turntable yaw and flies directly to the active station
  (Woodworking/CNC, Metalworking/Benches, Laser Cutting, Tooling/Storage).
*/

import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type { AtcRuntime } from "./createAtcModel";
import type { AtcServiceId } from "./atcLayout";

/** Radians per frame: one gentle revolution in ~85 seconds */
const YAW_PER_FRAME = 0.0015;
/** Camera lerp factor. Smooth, elegant easing. */
const CHASE = 0.045;

const ROOM = { radius: 15.5, phi: 0.95, height: 0.5 };
/** How far from the room centre toward a station the camera stands (0 = centre). */
const CENTRE_PULL = 0.2;
/** Standing eye height inside the room, in metres. */
const EYE_HEIGHT = 1.6;
const CLOSE = { radius: 5.8, phi: 1.05 };

function centreOf(runtime: AtcRuntime, service: AtcServiceId | null, into: THREE.Vector3) {
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

export type AtcTourDrive = {
  tour: boolean;
  interactive: boolean;
  active: AtcServiceId | null;
};

export function createAtcTourCamera(
  runtime: AtcRuntime,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  still: boolean,
) {
  const mark = new THREE.Vector3();
  const aim = controls.target.clone();
  const seat = new THREE.Vector3();
  let yaw = Math.atan2(camera.position.z, camera.position.x);
  let reach = camera.position.distanceTo(controls.target);

  return function step(drive: AtcTourDrive) {
    if (!drive.tour) {
      controls.enabled = drive.interactive;
      if (drive.active) {
        centreOf(runtime, drive.active, mark);
        aim.lerp(mark, CHASE);
        controls.target.copy(aim);
      }
      yaw = Math.atan2(
        camera.position.z - controls.target.z,
        camera.position.x - controls.target.x,
      );
      reach = camera.position.distanceTo(controls.target);
      controls.update();
      return;
    }

    controls.enabled = false;
    if (!still) yaw += YAW_PER_FRAME;

    const close = drive.active !== null;
    const { radius, phi } = close ? CLOSE : ROOM;

    centreOf(runtime, drive.active, mark);
    if (!close) mark.y = ROOM.height;
    aim.lerp(mark, CHASE);
    reach += (radius - reach) * CHASE;

    if (close) {
      /* Enhancements 2026-09-22: "let it happen from the centre of the room so
         that the components are on the front view". The camera stands near
         the middle of the room, a little way toward the station, and faces
         it: the station is seen head-on from inside the room, never from
         behind a wall. A station at the very centre is seen from just in
         front of it. */
      const toward = Math.hypot(aim.x, aim.z);
      if (toward > 0.5) seat.set(aim.x * CENTRE_PULL, EYE_HEIGHT, aim.z * CENTRE_PULL);
      else seat.set(aim.x, EYE_HEIGHT, aim.z + 2.5);
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
