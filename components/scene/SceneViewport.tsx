"use client";

import { useRef } from "react";

/**
 * Empty stage for the 3D model. It sits behind the whole UI and keeps pointer
 * events, so orbit controls work while the panels float on top of it.
 *
 * Mount your renderer inside the returned div, e.g.
 *   <Canvas camera={{ position: [...], fov: 45 }}><YourModel url="/models/park.glb" /></Canvas>
 * The container is exactly 1920x1080 in design space; read `ref` for its size.
 */
export function SceneViewport() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      data-scene-root
      className="pointer-events-auto absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-8 rounded-[8px] border border-dashed border-twin-edge/30" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-[13px] tracking-[0.3em] text-twin-dim/70">3D 场景占位</p>
        <p className="mt-1 text-[11px] tracking-[0.12em] text-twin-dim/50">
          在 SceneViewport 内挂载模型
        </p>
      </div>
    </div>
  );
}
