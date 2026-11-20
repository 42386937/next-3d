"use client";

import { IconSlot } from "@/components/ui/IconSlot";
import { sceneMarkers } from "@/lib/dashboard-data";

/**
 * POI labels anchored in full-stage coordinates, which is the same space a
 * world->screen projection gives you. Update `sceneMarkers` (or feed it from
 * your scene) as the camera moves.
 */
export function SceneMarkers() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {sceneMarkers.map((m) => (
        <div
          key={m.label}
          className="pointer-events-auto absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
        >
          <span
            className="flex h-[26px] w-[26px] rotate-45 items-center justify-center rounded-[6px] border bg-twin-deep/80"
            style={{
              borderColor: `color-mix(in srgb, ${m.color} 60%, transparent)`,
              boxShadow: `0 0 12px color-mix(in srgb, ${m.color} 45%, transparent)`,
            }}
          >
            <span className="-rotate-45">
              <IconSlot name={m.icon} size={14} />
            </span>
          </span>
          <span className="h-3.5 w-px" style={{ background: m.color }} />
          <span
            className="-mt-0.5 rounded-[4px] border bg-twin-panel/85 px-2.5 py-1 text-[13px] text-twin-text"
            style={{
              borderColor: `color-mix(in srgb, ${m.color} 40%, transparent)`,
            }}
          >
            {m.label}
          </span>
        </div>
      ))}
    </div>
  );
}
