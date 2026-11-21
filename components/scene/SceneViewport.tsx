"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import * as THREE from "three";

const MODEL_URL = "/dc.glb";

/** Elevated three-quarter view, like the reference's aerial angle. */
const VIEW_DIR = new THREE.Vector3(0.5, 0.95, 1.1).normalize();

function ParkScene({ onReady }: { onReady: () => void }) {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  const rootRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const envRef = useRef<{
    target: THREE.WebGLRenderTarget;
    pmrem: THREE.PMREMGenerator;
  } | null>(null);
  const fitted = useRef(false);
  const [dist, setDist] = useState(120);

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
  useFrame(() => controlsRef.current?.update());

  // Image-based lighting so PBR materials on the park don't render flat.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(new RoomEnvironment(), 0.04);
    envRef.current = { target, pmrem };
    const s = sceneRef.current;
    if (s) s.environment = target.texture;
    return () => {
      if (sceneRef.current) sceneRef.current.environment = null;
      target.dispose();
      pmrem.dispose();
      envRef.current = null;
    };
  }, [gl]);

  // Fit the camera to the park bounds once, then leave orbiting to the user.
  useEffect(() => {
    const root = rootRef.current;
    const cam = cameraRef.current;
    const controls = controlsRef.current;
    if (!root || !cam || !controls || fitted.current) return;

    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    root.position.set(-center.x, -center.y, -center.z);

    const radius = Math.max(size.x, size.y, size.z) * 0.5;
    const fov = THREE.MathUtils.degToRad(cam.fov);
    const distance = radius / Math.sin(fov / 2);

    cam.position.copy(VIEW_DIR).multiplyScalar(distance);
    cam.near = distance / 100;
    cam.far = distance * 10;
    cam.updateProjectionMatrix();

    controls.minDistance = distance * 0.2;
    controls.maxDistance = distance * 3;
    controls.target.set(0, 0, 0);
    controls.update();

    fitted.current = true;
    setDist(distance);
    onReady();
  }, [onReady]);

  return (
    <>
      <group ref={rootRef}>
        <primitive object={gltf.scene} />
      </group>
      <directionalLight
        position={[dist * 0.6, dist * 1.1, dist * 0.9]}
        intensity={1.35}
      />
    </>
  );
}

export function SceneViewport() {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <div
      data-scene-root
      className="pointer-events-auto absolute inset-0 z-0 overflow-hidden"
    >
      <Canvas
        camera={{ fov: 42, near: 1, far: 4000, position: [90, 90, 90] }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <hemisphereLight args={[0xcfe3ff, 0x1d2a3d, 0.9]} />
        <Suspense fallback={null}>
          <ParkScene onReady={onReady} />
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
