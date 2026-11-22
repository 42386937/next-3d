"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import * as THREE from "three";
import { CarRig } from "./CarRig";
import { buildRoadPath, sampleRoad } from "@/lib/scene-path";
import type { SceneViewKey } from "@/lib/dashboard-data";

const MODEL_URL = "/dc.glb";

/** Elevated three-quarter view, like the reference's aerial angle. */
const VIEW_DIR = new THREE.Vector3(0.5, 0.95, 1.1).normalize();

/** Driver (hood) camera: forward offset from the car centre, in model units. */
const HOOD_OFFSET = 2.2;

/** Driver (hood) camera height above the asphalt, in model units. */
const EYE_HEIGHT = 2.1;

/** How far down the road the driver looks, in model units. */
const LOOK_AHEAD = 30;

/** Chase-camera offsets behind and above the car, in model units. */
const FOLLOW_BACK = 13;
const FOLLOW_UP = 6.2;

/** Exponential approach rate for camera moves. */
const DAMPING = 7;

function dampingFactor(delta: number): number {
  return 1 - Math.exp(-DAMPING * Math.min(delta, 0.1));
}

/** Look from `eye` at `target` without allocating per frame. */
const lookMatrix = new THREE.Matrix4();
const lookTarget = new THREE.Vector3();
const lookQuat = new THREE.Quaternion();

/** Scratch vector holding the car's world position. */
const carWorld = new THREE.Vector3();

function faceCamera(camera: THREE.PerspectiveCamera, eye: THREE.Vector3, target: THREE.Vector3, alpha: number) {
  lookTarget.copy(target);
  lookMatrix.lookAt(eye, lookTarget, camera.up);
  lookQuat.setFromRotationMatrix(lookMatrix);
  camera.quaternion.slerp(lookQuat, alpha);
}

function ParkScene({
  onReady,
  view,
}: {
  onReady: () => void;
  view: SceneViewKey;
}) {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  const rootRef = useRef<THREE.Group>(null);
  const carRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const fitted = useRef(false);
  const [dist, setDist] = useState(120);

  /** Overview pose, restored by 恢复总览 and reused by 自动环绕. */
  const overviewPos = useRef(new THREE.Vector3());
  const overviewTarget = useRef(new THREE.Vector3());
  /** True while the camera glides back from a rig view to the overview. */
  const returning = useRef(false);
  /** Distance travelled along the ring road, kept so the car parks in place. */
  const distanceRef = useRef(0);
  const pathRef = useRef(buildRoadPath());

  const driving = view === "road" || view === "follow";
  const rigged = view === "road" || view === "follow";

  // The react-hooks immutability rule forbids mutating hook results directly,
  // so every render-scoped three object is reached through a ref.
  useEffect(() => {
    cameraRef.current = camera;
    return () => {
      cameraRef.current = null;
    };
  }, [camera]);

  useEffect(() => {
    sceneRef.current = scene;
    return () => {
      sceneRef.current = null;
    };
  }, [scene]);

  useEffect(() => {
    const c = new OrbitControls(camera, gl.domElement);
    c.enableDamping = true;
    c.dampingFactor = 0.08;
    c.rotateSpeed = 0.5;
    c.maxPolarAngle = Math.PI / 2.15;
    controlsRef.current = c;
    return () => {
      controlsRef.current = null;
      c.dispose();
    };
  }, [camera, gl]);

  // Image-based lighting so PBR materials on the plant don't render flat.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(new RoomEnvironment(), 0.04);
    const s = sceneRef.current;
    if (s) s.environment = target.texture;
    return () => {
      if (sceneRef.current) sceneRef.current.environment = null;
      target.dispose();
      pmrem.dispose();
    };
  }, [gl]);

  // Fit the camera to the plant once, then remember the pose as the overview.
  useEffect(() => {
    const root = rootRef.current;
    const cam = cameraRef.current;
    const controls = controlsRef.current;
    if (!root || !cam || !controls || fitted.current) return;

    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    root.position.set(-center.x, -center.y, -center.z);
    root.updateMatrixWorld(true);

    const radius = Math.max(size.x, size.y, size.z) * 0.5;
    const fov = THREE.MathUtils.degToRad(cam.fov);
    const distance = radius / Math.sin(fov / 2);

    cam.position.copy(VIEW_DIR).multiplyScalar(distance);
    // The driver view sits ~1.6 units above the road, so `near` must be small;
    // the far plane still has to cover a campus measured in hundreds of units.
    cam.near = 0.1;
    cam.far = distance * 12;
    cam.updateProjectionMatrix();

    controls.minDistance = distance * 0.2;
    controls.maxDistance = distance * 3;
    controls.target.set(0, 0, 0);
    controls.update();

    overviewPos.current.copy(cam.position);
    overviewTarget.current.set(0, 0, 0);

    fitted.current = true;
    setDist(distance);
    onReady();
  }, [onReady]);

  // Hand the camera to the rig when a rig view starts, and back to the orbit
  // controls when it ends.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (rigged) {
      controls.enabled = false;
      controls.autoRotate = false;
    } else {
      returning.current = true;
    }
  }, [rigged]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.autoRotate = view === "orbit";
    controls.autoRotateSpeed = 0.45;
  }, [view]);

  useFrame((_, delta) => {
    const cam = cameraRef.current;
    const controls = controlsRef.current;
    const car = carRef.current;
    if (!cam || !controls) return;

    const k = dampingFactor(delta);

    if (rigged && car) {
      // The car lives inside the root group, so its local position has to be
      // lifted into world space before it can drive the camera.
      car.getWorldPosition(carWorld);
      const roadY = carWorld.y;

      const sample = sampleRoad(pathRef.current, distanceRef.current);

      const desired = new THREE.Vector3();
      const lookAt = new THREE.Vector3();

      if (view === "road") {
        // Hood camera: just past the windscreen, above the bonnet. From inside
        // the cabin the body shell would fill the frame, so the eye rides the
        // hood instead and the bonnet edge stays in view.
        desired.set(
          carWorld.x + sample.dirX * HOOD_OFFSET,
          roadY + EYE_HEIGHT,
          carWorld.z + sample.dirZ * HOOD_OFFSET,
        );
        lookAt.set(
          carWorld.x + sample.dirX * LOOK_AHEAD,
          roadY + EYE_HEIGHT * 0.55,
          carWorld.z + sample.dirZ * LOOK_AHEAD,
        );
      } else {
        // Chase camera trailing the car.
        desired.set(
          carWorld.x - sample.dirX * FOLLOW_BACK,
          roadY + FOLLOW_UP,
          carWorld.z - sample.dirZ * FOLLOW_BACK,
        );
        lookAt.set(
          carWorld.x + sample.dirX * 4,
          roadY + 1.6,
          carWorld.z + sample.dirZ * 4,
        );
      }

      cam.position.lerp(desired, view === "road" ? 1 : k);
      faceCamera(cam, cam.position, lookAt, view === "road" ? 1 : k);
      return;
    }

    if (returning.current) {
      cam.position.lerp(overviewPos.current, k);
      faceCamera(cam, cam.position, overviewTarget.current, k);

      if (cam.position.distanceTo(overviewPos.current) < 0.8) {
        cam.position.copy(overviewPos.current);
        controls.target.copy(overviewTarget.current);
        controls.enabled = true;
        controls.update();
        returning.current = false;
      }
      return;
    }

    controls.enabled = true;
    controls.update();
  });

  // Read-only snapshot of the rig. The browser check uses it to confirm the car
  // rests on the asphalt and that the driver camera really is at eye height.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const readSnapshot = () => {
      const cam = cameraRef.current;
      const car = carRef.current;
      if (!cam || !car) return { ready: false };
      car.getWorldPosition(carWorld);
      return {
        ready: true,
        view,
        camera: {
          x: +cam.position.x.toFixed(2),
          y: +cam.position.y.toFixed(2),
          z: +cam.position.z.toFixed(2),
        },
        carWorld: {
          x: +carWorld.x.toFixed(3),
          y: +carWorld.y.toFixed(3),
          z: +carWorld.z.toFixed(3),
        },
        carLocalY: +car.position.y.toFixed(4),
        yawDeg: +THREE.MathUtils.radToDeg(car.rotation.y).toFixed(1),
        visible: car.visible,
        distance: +distanceRef.current.toFixed(2),
        roadTotal: +pathRef.current.total.toFixed(2),
      };
    };
    (window as unknown as { __twinScene: unknown }).__twinScene = readSnapshot;
    return () => {
      delete (window as unknown as { __twinScene?: unknown }).__twinScene;
    };
  }, [view]);

  return (
    <>
      <group ref={rootRef}>
        <primitive object={gltf.scene} />
        <Suspense fallback={null}>
          <CarRig
            driving={driving}
            carRef={carRef}
            distanceRef={distanceRef}
            driverView={view === "road"}
          />
        </Suspense>
      </group>
      <directionalLight
        position={[dist * 0.6, dist * 1.1, dist * 0.9]}
        intensity={1.35}
      />
    </>
  );
}

export function SceneViewport({ view }: { view: SceneViewKey }) {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <div
      data-scene-root
      className="pointer-events-auto absolute inset-0 z-0 overflow-hidden"
    >
      <Canvas
        camera={{ fov: 42, near: 0.1, far: 4000, position: [90, 90, 90] }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          // The driver view needs a sub-metre near plane next to a far plane
          // measured in thousands of units, hence logarithmic depth.
          logarithmicDepthBuffer: true,
        }}
      >
        <hemisphereLight args={[0xcfe3ff, 0x1d2a3d, 0.9]} />
        <Suspense fallback={null}>
          <ParkScene onReady={onReady} view={view} />
        </Suspense>
      </Canvas>

      {!ready && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[8px] border border-twin-line/70 bg-twin-panel/80 px-5 py-3 text-[13px] tracking-[0.1em] text-twin-muted backdrop-blur-md">
          三维场景加载中…
        </div>
      )}
    </div>
  );
}
