"use client";

import { useState } from "react";
import { IconSlot } from "@/components/ui/IconSlot";
import { bottomKpis, sceneTag, viewToolbar } from "@/lib/dashboard-data";

function SceneTag() {
  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-[4px] border border-twin-line/70 bg-twin-panel/85 px-3 py-1.5 shadow-[var(--t-panel-shadow)]">
      <span className="h-1.5 w-1.5 rounded-full bg-twin-green shadow-[0_0_6px_var(--t-green)]" />
      <span className="text-[13px] text-twin-text">
        {sceneTag.location}
        <span className="mx-1.5 text-twin-dim">·</span>
        {sceneTag.mode}
      </span>
      <span className="rounded-[3px] border border-twin-edge/60 px-1.5 py-px text-[10px] tracking-[0.08em] text-twin-dim">
        {sceneTag.badge}
      </span>
    </div>
  );
}

function ViewToolbar({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="pointer-events-auto flex items-center gap-2">
      {viewToolbar.map((tool) => {
        const on = tool.key === active;
        return (
          <button
            key={tool.key}
            type="button"
            onClick={() => onSelect(tool.key)}
            className={`flex h-8 items-center gap-1.5 rounded-[4px] border px-3 text-[13px] backdrop-blur-[2px] transition-colors ${
              on
                ? "border-twin-cyan/55 bg-twin-cyan/12 text-twin-cyan"
                : "border-twin-edge/50 bg-twin-panel/85 text-twin-muted hover:text-twin-text"
            }`}
          >
            <IconSlot name={tool.icon} size={13} />
            <span>{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function KpiBar() {
  return (
    <div className="pointer-events-auto flex items-stretch rounded-[6px] border border-twin-line/80 bg-twin-panel/85 shadow-[var(--t-panel-shadow)] backdrop-blur-[2px]">
      {bottomKpis.map((kpi, i) => (
        <div
          key={kpi.label}
          className={`flex items-center gap-3 px-10 py-3.5 ${
            i > 0 ? "border-l border-twin-line/70" : ""
          }`}
        >
          <IconSlot name={kpi.icon} size={28} />
          <div className="leading-tight">
            <div className="text-[12px] text-twin-muted">{kpi.label}</div>
            <div className="twin-num mt-0.5 text-[26px] font-bold text-twin-text">
              {kpi.value}
              <span className="ml-1 text-[12px] font-normal text-twin-muted">
                {kpi.unit}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CenterStage() {
  const [view, setView] = useState("reset");

  return (
    <div className="pointer-events-none relative flex min-w-0 flex-1 flex-col">
      <div className="flex items-start justify-between">
        <SceneTag />
        <ViewToolbar active={view} onSelect={setView} />
      </div>
      <div className="mt-auto flex justify-center pb-[104px]">
        <KpiBar />
      </div>
    </div>
  );
}
