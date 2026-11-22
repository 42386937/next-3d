"use client";

import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { buildRoadPath, sampleRoad, ROAD_SURFACE_Y } from "@/lib/scene-path";
const CAR_URL = "/car.glb";

/**
 * car.glb is ~4.4 units long with its nose on +Z and its tyre contact patch on
 * y = 0, so the root group only needs the road surface height and the heading.
 * The ring road is ~14.6 units wide, which makes a 1:1 car too small to read in
 * the overview; this keeps it visible while it stays comfortably on the asphalt.
 */
export const CAR_SCALE = 1.5;

/** Model units per second while driving; one lap of the ring road takes ~66 s. */
const DRIVE_SPEED = 11;

/** Wheel radius in car-local units, taken from the wheel mesh bounds. */
const WHEEL_RADIUS = 0.31;

/** Mesh names inside car.glb, used for the wheel spin and the driver view. */
const WHEEL_NAMES = [
  "1990s-sports-car_wheel_fl",
  "1990s-sports-car_wheel_fr",
  "1990s-sports-car_wheel_rl",
  "1990s-sports-car_wheel_rr",
] as const;

const GLASS_NAME = "1990s-sports-car_windows";

export type CarRigProps = {
  /** Advance the car along the road; when false it holds its current position. */
  driving: boolean;
  /** Car transform, read by the camera controller. */
  carRef: React.RefObject<THREE.Group | null>;
  /** Distance along the loop, kept in the parent so the car parks where it stopped. */
  distanceRef: React.MutableRefObject<number>;
  /**
   * True in the driver view. The camera then rides above the bonnet, so the
   * glass is hidden while the bonnet itself stays visible to sell the viewpoint.
   */
  driverView: boolean;
};

/** Soft contact shadow so the car reads as sitting on the road, not floating. */
function makeShadowTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  gradient.addColorStop(0.55, "rgba(0, 0, 0, 0.24)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Loads car.glb, keeps its tyres on the asphalt and drives it around the ring
 * road. The scene is cloned so the loader cache stays untouched; wheels and
 * glass are looked up through the mounted group each frame, which keeps every
 * mutation on ref-owned objects.
 */
export function CarRig({
  driving,
  carRef,
  distanceRef,
  driverView,
}: CarRigProps) {
  const gltf = useLoader(GLTFLoader, CAR_URL);
  const path = useMemo(() => buildRoadPath(), []);
  const spin = useRef(0);
  const shadowTexture = useMemo(() => makeShadowTexture(), []);

  const model = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    return root;
  }, [gltf]);

  useFrame((_, delta) => {
    const car = carRef.current;
    if (!car) return;

    // Cap the step so a stalled tab doesn't teleport the car across the map.
    const dt = Math.min(delta, 0.05);

    if (driving) {
      const advance = DRIVE_SPEED * dt;
      distanceRef.current += advance;
      spin.current -= advance / (WHEEL_RADIUS * CAR_SCALE);
      for (const name of WHEEL_NAMES) {
        const wheel = car.getObjectByName(name);
        if (wheel) wheel.rotation.x = spin.current;
      }
    }

    const sample = sampleRoad(path, distanceRef.current);

    // Nose up into the heading and sit exactly on the asphalt.
    car.position.set(sample.x, ROAD_SURFACE_Y, sample.z);
    car.rotation.set(0, Math.atan2(sample.dirX, sample.dirZ), 0);

    // Glass would fill the driver view with the inside of the windscreen.
    const glassPart = car.getObjectByName(GLASS_NAME);
    if (glassPart) glassPart.visible = !driverView;
  });

  return (
    <group ref={carRef} scale={CAR_SCALE}>
      <primitive object={model} />
      {shadowTexture ? (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 5.6]} />
          <meshBasicMaterial
            map={shadowTexture}
            transparent
            depthWrite={false}
            opacity={0.85}
            toneMapped={false}
          />
        </mesh>
      ) : null}
    </group>
  );
}
