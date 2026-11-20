"use client";

import { Panel } from "@/components/ui/Panel";
import { IconSlot } from "@/components/ui/IconSlot";
import { BarChart, DonutChart } from "@/components/ui/charts";
import {
  alarmHandling,
  alarmTrend,
  deviceOnlineStatus,
} from "@/lib/dashboard-data";

const PANEL_INNER_WIDTH = 372;

function DeviceOnlineStatusPanel() {
  return (
    <Panel title="设备在线状态" icon="panel-device">
      <div className="grid grid-cols-3 gap-2">
        {deviceOnlineStatus.map((tile) => (
          <div
            key={tile.label}
            className="rounded-[4px] border border-twin-line/80 bg-twin-deep/60 px-2 py-2.5 text-center"
          >
            <IconSlot name={tile.icon} size={30} className="mx-auto" />
            <div className="mt-2 text-[12px] text-twin-muted">{tile.label}</div>
            <div className="twin-num mt-0.5 text-[17px] font-semibold text-twin-text">
              {tile.value}
              <span className="ml-1 text-[11px] font-normal text-twin-muted">
                {tile.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AlarmHandlingPanel() {
  const total = alarmHandling.segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <Panel title="告警处置" icon="panel-alarm">
      <div className="flex items-center gap-3">
        <DonutChart size={118} segments={alarmHandling.segments} thickness={11} />

        <div className="flex-1 space-y-2.5 pt-1">
          {alarmHandling.segments.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span
                className="h-2.5 w-[3px] rounded-full"
                style={{ background: s.color }}
              />
              <span className="text-[12px] text-twin-muted">{s.label}</span>
              <span className="twin-dash-rule mx-1 h-px flex-1" />
              <span className="twin-num text-[15px] font-semibold" style={{ color: s.color }}>
                {s.value}
              </span>
              <span className="twin-num w-[38px] text-right text-[11px] text-twin-dim">
                {total > 0 ? Math.round((s.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-[4px] border border-twin-line/70 bg-twin-deep/45 px-2.5">
        <div className="flex items-center pt-1.5 text-[10px] text-twin-dim">
          <span className="w-[70px]">类型</span>
          <span className="w-[30px]">总数</span>
          {alarmHandling.columns.map((c) => (
            <span key={c} className="flex-1 text-center">
              {c}
            </span>
          ))}
        </div>

        {alarmHandling.rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center border-t border-twin-line/60 py-[7px]"
          >
            <IconSlot name={row.icon} size={14} />
            <span className="ml-1.5 w-[52px] text-[13px] text-twin-text">
              {row.label}
            </span>
            <span className="twin-num w-[30px] text-[15px] font-semibold text-twin-text">
              {row.total}
            </span>
            {row.cells.map((value, i) => (
              <span
                key={i}
                className="flex flex-1 items-center justify-center gap-1 border-l border-dashed border-twin-line/60 text-[13px]"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: alarmHandling.segments[i].color }}
                />
                <span className="twin-num text-twin-muted">{value}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AlarmTrendPanel() {
  return (
    <Panel title="告警趋势" icon="panel-alarm-trend">
      <BarChart
        width={PANEL_INNER_WIDTH}
        height={168}
        yMax={alarmTrend.yMax}
        yTicks={alarmTrend.yTicks}
        xLabels={alarmTrend.xLabels}
        values={alarmTrend.values}
      />
    </Panel>
  );
}

export function RightColumn() {
  return (
    <div className="pointer-events-none flex w-[400px] shrink-0 flex-col gap-3">
      <DeviceOnlineStatusPanel />
      <AlarmHandlingPanel />
      <AlarmTrendPanel />
    </div>
  );
}
