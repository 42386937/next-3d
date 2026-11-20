"use client";

import { Panel } from "@/components/ui/Panel";
import { IconSlot } from "@/components/ui/IconSlot";
import { LineChart } from "@/components/ui/charts";
import {
  generationTrend,
  keyEquipment,
  operationOverview,
  overviewAvatarIcon,
} from "@/lib/dashboard-data";

const PANEL_INNER_WIDTH = 372;

function StatCell({
  icon,
  label,
  value,
  unit,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <IconSlot name={icon} size={26} round />
      <div className="leading-tight">
        <div className="text-[12px] text-twin-muted">{label}</div>
        <div className="twin-num mt-0.5 text-[21px] font-semibold text-twin-text">
          {value}
          <span className="ml-1 text-[11px] font-normal text-twin-muted">{unit}</span>
        </div>
      </div>
    </div>
  );
}

function OperationOverview() {
  return (
    <Panel title="生产运行概况" icon="panel-overview">
      <div className="relative grid grid-cols-2 gap-x-[104px] gap-y-4 py-1">
        {operationOverview.map((item) => (
          <StatCell key={item.label} {...item} />
        ))}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-[104px] w-[104px]">
            <span className="absolute inset-0 animate-[spin_14s_linear_infinite] rounded-full border border-dashed border-twin-cyan/35" />
            <span className="absolute inset-[11px] rounded-full border border-twin-cyan/20" />
            <span className="absolute inset-[23px] flex items-center justify-center rounded-full border border-twin-cyan/45 bg-twin-blue/15">
              <IconSlot name={overviewAvatarIcon} size={26} round />
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function GenerationTrendPanel() {
  return (
    <Panel title="发电供热趋势" icon="panel-trend">
      <div className="grid grid-cols-2 gap-2">
        {generationTrend.totals.map((t) => (
          <div
            key={t.label}
            className="flex items-center gap-2 rounded-[4px] border border-twin-line/70 bg-twin-deep/55 px-2.5 py-2"
          >
            <IconSlot name={t.icon} size={26} />
            <div className="leading-tight">
              <div className="text-[12px] text-twin-muted">{t.label}</div>
              <div className="twin-num mt-0.5 text-[20px] font-semibold text-twin-text">
                {t.value}
                <span className="ml-1 text-[11px] font-normal text-twin-muted">
                  {t.unit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex items-center gap-4">
        {generationTrend.series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5 text-[12px]">
            <span
              className="h-[3px] w-3.5 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-twin-muted">{s.name}</span>
          </span>
        ))}
      </div>

      <div className="mt-1">
        <LineChart
          width={PANEL_INNER_WIDTH}
          height={152}
          yMin={generationTrend.yMin}
          yMax={generationTrend.yMax}
          yTicks={generationTrend.yTicks}
          xLabels={generationTrend.xLabels}
          series={generationTrend.series}
        />
      </div>
    </Panel>
  );
}

function KeyEquipmentPanel() {
  return (
    <Panel title="重点设备" icon="panel-equipment">
      <div className="divide-y divide-twin-line/60">
        {keyEquipment.map((row) => (
          <div key={row.label} className="flex items-center gap-2 py-[9px]">
            <IconSlot name={row.icon} size={15} />
            <span className="text-[13px] text-twin-muted">{row.label}</span>
            <span className="twin-num ml-auto text-[16px] font-semibold text-twin-text">
              {row.value}
              <span className="ml-1 text-[11px] font-normal text-twin-muted">
                {row.unit}
              </span>
            </span>
            <span className="w-[62px] text-right text-[11px] text-twin-dim">
              {row.status}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function LeftColumn() {
  return (
    <div className="pointer-events-none flex w-[400px] shrink-0 flex-col gap-3">
      <OperationOverview />
      <GenerationTrendPanel />
      <KeyEquipmentPanel />
    </div>
  );
}
