"use client";

import { useState } from "react";
import { Icon, IconChip } from "@/components/ui/Icon";
import { bottomKpis, sceneTag, viewToolbar } from "@/lib/dashboard-data";

function SceneTag() {
  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-[8px] border border-twin-line/70 bg-twin-panel/80 px-3 py-2 shadow-[var(--t-panel-shadow)] backdrop-blur-md">
      <span className="h-1.5 w-1.5 rounded-full bg-twin-green shadow-[0_0_6px_var(--t-green)]" />
      <span className="text-[13px] text-twin-text">
        {sceneTag.location}
        <span className="mx-1.5 text-twin-dim">·</span>
        {sceneTag.mode}
      </span>
      <span className="rounded-[4px] border border-twin-edge/60 px-1.5 py-px text-[10px] tracking-[0.08em] text-twin-dim">
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
            className={`flex h-9 items-center gap-2 rounded-[7px] border px-3.5 text-[13px] backdrop-blur-md transition-colors ${
              on
                ? "border-twin-cyan/50 bg-twin-cyan/12 text-twin-cyan shadow-[var(--t-active-shadow)]"
                : "border-twin-line/70 bg-twin-panel/80 text-twin-muted hover:text-twin-text"
            }`}
          >
            <Icon name={tool.icon} size={14} />
            <span>{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function KpiBar() {
  return (
    <div className="pointer-events-auto flex w-full items-stretch rounded-[10px] border border-twin-line/80 bg-twin-panel/80 shadow-[var(--t-panel-shadow)] backdrop-blur-md">
      {bottomKpis.map((kpi, i) => (
        <div
          key={kpi.label}
          className={`flex min-w-0 flex-1 items-center gap-3 px-7 py-4 ${
            i > 0 ? "border-l border-twin-line/70" : ""
          }`}
        >
          <IconChip name={kpi.icon} size={36} iconSize={19} />
          <div className="leading-tight">
            <div className="text-[12px] text-twin-muted">{kpi.label}</div>
            <div className="twin-num mt-1 text-[26px] font-bold text-twin-text">
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
      <div className="mt-auto">
        <KpiBar />
      </div>
    </div>
  );
}
