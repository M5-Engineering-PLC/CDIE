/*
  The guided tour camera driver for the ATC Engineering & Prototyping Workshop.
  Controls a slow room orbit and flies to the selected workstation or storage area.
*/

import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type { AtcRuntime } from "./createAtcModel";
import type { AtcServiceId } from "./atcLayout";

/** Radians per frame: one gentle revolution in ~85 seconds */
const YAW_PER_FRAME = 0.0015;
/** Camera lerp factor. Smooth, elegant easing. */
const CHASE = 0.045;

const ROOM = { radius: 16.5, phi: 0.94, height: 1.6 };

export type AtcTourDrive = {
  tour: boolean;
  interactive: boolean;
  active: AtcServiceId | null;
};

export type StationCameraPose = {
  seat: THREE.Vector3;
  target: THREE.Vector3;
};

export const STATION_POSES: Record<AtcServiceId, StationCameraPose> = {
  woodworking: {
    // Front view looking into the container: frames CNC router and operator desk in their entirety
    seat: new THREE.Vector3(-4.0, 1.85, 3.8),
    target: new THREE.Vector3(-4.0, 0.95, 0.6),
  },
  "laser-cutting": {
    // Front view looking directly at the Blue Elephant laser cutter
    seat: new THREE.Vector3(2.2, 1.8, -0.4),
    target: new THREE.Vector3(2.2, 0.85, -2.9),
  },
  metalworking: {
    // Front view looking at the metalworking & fabrication benches
    seat: new THREE.Vector3(1.2, 2.4, 4.2),
    target: new THREE.Vector3(1.2, 0.9, 0.8),
  },
  "tooling-storage": {
    // Front view looking into the 4-tier storage shelves inside container
    seat: new THREE.Vector3(-2.2, 1.7, -0.5),
    target: new THREE.Vector3(-4.8, 1.25, -0.5),
  },
  "facility-access": {
    seat: new THREE.Vector3(3.2, 1.6, 0.2),
    target: new THREE.Vector3(6.0, 1.1, 0.2),
  },
};

export const OVERVIEW_POSE: StationCameraPose = {
  seat: new THREE.Vector3(12.5, 10.5, 12.5),
  target: new THREE.Vector3(0, 0.4, 0),
};

export function createAtcTourCamera(
  runtime: AtcRuntime,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  still: boolean,
) {
  const aim = controls.target.clone();
  const seat = new THREE.Vector3();
  let yaw = Math.atan2(camera.position.z, camera.position.x);
  let reach = camera.position.distanceTo(controls.target);

  let lastActive: AtcServiceId | null = null;
  let isTransitioning = false;
  const targetSeat = OVERVIEW_POSE.seat.clone();
  const targetAim = OVERVIEW_POSE.target.clone();

  return function step(drive: AtcTourDrive) {
    if (!drive.tour) {
      controls.enabled = drive.interactive;

      if (drive.active !== lastActive) {
        lastActive = drive.active;
        isTransitioning = true;
        if (drive.active && STATION_POSES[drive.active]) {
          targetSeat.copy(STATION_POSES[drive.active].seat);
          targetAim.copy(STATION_POSES[drive.active].target);
        } else {
          targetSeat.copy(OVERVIEW_POSE.seat);
          targetAim.copy(OVERVIEW_POSE.target);
        }
      }

      if (isTransitioning) {
        // Yield to user manual interaction if dragging
        // @ts-expect-error OrbitControls internal state
        if (controls.state !== undefined && controls.state !== -1) {
          isTransitioning = false;
        } else {
          camera.position.lerp(targetSeat, CHASE * 1.5);
          controls.target.lerp(targetAim, CHASE * 1.5);
          controls.update();
          if (
            camera.position.distanceTo(targetSeat) < 0.05 &&
            controls.target.distanceTo(targetAim) < 0.05
          ) {
            isTransitioning = false;
          }
        }
      } else {
        controls.update();
      }

      yaw = Math.atan2(
        camera.position.z - controls.target.z,
        camera.position.x - controls.target.x,
      );
      reach = camera.position.distanceTo(controls.target);
      return;
    }

    controls.enabled = false;
    if (!still) yaw += YAW_PER_FRAME;

    const close = drive.active !== null;
    if (close && drive.active && STATION_POSES[drive.active]) {
      const pose = STATION_POSES[drive.active];
      camera.position.lerp(pose.seat, CHASE);
      aim.lerp(pose.target, CHASE);
      camera.lookAt(aim);
      controls.target.copy(aim);
      return;
    }

    const { radius, phi } = ROOM;
    aim.lerp(OVERVIEW_POSE.target, CHASE);
    reach += (radius - reach) * CHASE;
    seat.set(
      aim.x + reach * Math.sin(phi) * Math.cos(yaw),
      aim.y + reach * Math.cos(phi),
      aim.z + reach * Math.sin(phi) * Math.sin(yaw),
    );
    camera.position.lerp(seat, CHASE);
    camera.lookAt(aim);
    controls.target.copy(aim);
  };
}
