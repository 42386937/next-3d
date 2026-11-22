"use client";

import { useEffect, useState } from "react";
import { TopHeader } from "./TopHeader";
import { LeftColumn } from "./LeftColumn";
import { RightColumn } from "./RightColumn";
import { CenterStage } from "./CenterStage";
import { SceneMarkers } from "@/components/scene/SceneMarkers";
import { SceneViewport } from "@/components/scene/SceneViewport";
import type { SceneViewKey } from "@/lib/dashboard-data";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

export function Dashboard() {
  const [scale, setScale] = useState(1);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [view, setView] = useState<SceneViewKey>("reset");

  useEffect(() => {
    const fit = () => {
      const next = Math.min(
        window.innerWidth / DESIGN_WIDTH,
        window.innerHeight / DESIGN_HEIGHT,
      );
      // A hidden surface reports a 0x0 viewport; keep the design size there.
      if (next > 0) setScale(next);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <main
      data-theme={theme}
      className="relative h-full w-full overflow-hidden bg-twin-void"
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <div className="twin-backdrop absolute inset-0" />
        <SceneViewport view={view} />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-twin-void/30" />
        {/* POI labels are pinned to the overview layout, so they sit out rig views. */}
        {view === "reset" || view === "orbit" ? <SceneMarkers /> : null}

        <div className="pointer-events-none relative z-10 flex h-full flex-col">
          <TopHeader
            theme={theme}
            onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
          <div className="flex min-h-0 flex-1 gap-4 px-4 pb-9 pt-1 mt-[24px]">
            <LeftColumn />
            <CenterStage view={view} onViewChange={setView} />
            <RightColumn />
          </div>
        </div>
      </div>
    </main>
  );
}
