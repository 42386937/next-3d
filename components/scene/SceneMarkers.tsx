"use client";

import { Icon } from "@/components/ui/Icon";
import { sceneMarkers } from "@/lib/dashboard-data";

/**
 * POI labels anchored in full-stage coordinates, which is the same space a
 * world->screen projection gives you. Update `sceneMarkers` as the layout moves.
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
          <span className="relative flex items-center justify-center">
            <span
              className="absolute h-11 w-11 animate-ping rounded-full opacity-60"
              style={{
                background: `color-mix(in srgb, ${m.color} 18%, transparent)`,
              }}
            />
            <span
              className="relative flex h-9 w-9 items-center justify-center rounded-full border"
              style={{
                color: m.color,
                borderColor: `color-mix(in srgb, ${m.color} 55%, transparent)`,
                background: `color-mix(in srgb, ${m.color} 14%, var(--t-panel))`,
                boxShadow: `0 0 16px color-mix(in srgb, ${m.color} 40%, transparent)`,
              }}
            >
              <Icon name={m.icon} size={17} />
            </span>
          </span>

          <span
            className="h-4 w-px"
            style={{
              background: `linear-gradient(${m.color}, color-mix(in srgb, ${m.color} 20%, transparent))`,
            }}
          />

          <span
            className="rounded-[6px] border px-2.5 py-1 text-[13px] text-twin-text shadow-[var(--t-panel-shadow)] backdrop-blur-md"
            style={{
              borderColor: `color-mix(in srgb, ${m.color} 38%, transparent)`,
              background: `color-mix(in srgb, var(--t-panel) 82%, transparent)`,
            }}
          >
            {m.label}
          </span>
        </div>
      ))}
    </div>
  );
}
