"use client";

import { useId } from "react";

type Pt = { x: number; y: number };

/** Catmull-Rom converted to cubic beziers, so the trend lines curve like the reference. */
function smoothPath(pts: Pt[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) * 0.2;
    const c1y = p1.y + (p2.y - p0.y) * 0.2;
    const c2x = p2.x - (p3.x - p1.x) * 0.2;
    const c2y = p2.y - (p3.y - p1.y) * 0.2;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// SVG color attributes can't resolve var(), so every themed color goes through `style`.
const AXIS = { fill: "var(--t-dim)" } as const;
const GRID = { stroke: "var(--t-grid)" } as const;

export function LineChart({
  width,
  height,
  yMin,
  yMax,
  yTicks,
  xLabels,
  series,
}: {
  width: number;
  height: number;
  yMin: number;
  yMax: number;
  yTicks: number[];
  xLabels: string[];
  series: { name: string; color: string; data: number[] }[];
}) {
  const uid = useId().replace(/:/g, "");
  const padL = 32;
  const padR = 6;
  const padT = 10;
  const padB = 20;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const toX = (i: number, n: number) =>
    padL + (n <= 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const toY = (v: number) => padT + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
  const baseline = padT + innerH;

  return (
    <svg width={width} height={height} className="block">
      <defs>
        {series.map((s, i) => (
          <linearGradient
            key={s.name}
            id={`${uid}-area-${i}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" style={{ stopColor: s.color, stopOpacity: 0.32 }} />
            <stop offset="100%" style={{ stopColor: s.color, stopOpacity: 0.02 }} />
          </linearGradient>
        ))}
      </defs>

      {yTicks.map((t) => {
        const y = toY(t);
        return (
          <g key={t}>
            <line
              x1={padL}
              x2={width - padR}
              y1={y}
              y2={y}
              style={GRID}
            />
            <text x={padL - 7} y={y + 3.5} textAnchor="end" fontSize={10} style={AXIS}>
              {t}
            </text>
          </g>
        );
      })}

      {xLabels.map((label, i) => (
        <text
          key={label}
          x={toX(i, xLabels.length)}
          y={height - 5}
          textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"}
          fontSize={10}
          style={AXIS}
        >
          {label}
        </text>
      ))}

      {series.map((s, si) => {
        const pts = s.data.map((v, i) => ({ x: toX(i, s.data.length), y: toY(v) }));
        const line = smoothPath(pts);
        const area = `${line} L ${pts[pts.length - 1].x.toFixed(2)} ${baseline} L ${pts[0].x.toFixed(2)} ${baseline} Z`;
        return (
          <g key={s.name}>
            <path d={area} fill={`url(#${uid}-area-${si})`} />
            <path
              d={line}
              fill="none"
              strokeWidth={1.8}
              strokeLinecap="round"
              style={{ stroke: s.color }}
            />
            {pts.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={2.4}
                strokeWidth={1.4}
                style={{ fill: "var(--t-dot-fill)", stroke: s.color }}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function DonutChart({
  size,
  segments,
  thickness = 10,
}: {
  size: number;
  segments: { label: string; value: number; color: string }[];
  thickness?: number;
}) {
  const c = size / 2;
  const r = c - thickness / 2 - 5;
  const circumference = 2 * Math.PI * r;

  // Zeros would collapse the ring, so every category keeps a visible sliver.
  const MIN_SHARE = 0.09;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const raw = segments.map((s) =>
    total > 0 ? s.value / total : 1 / segments.length,
  );
  const boosted = raw.map((v) => Math.max(v, MIN_SHARE));
  const boostTotal = boosted.reduce((a, b) => a + b, 0);
  const lengths = boosted.map((v) => (v / boostTotal) * circumference);

  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={c}
        cy={c}
        r={c - 1}
        fill="none"
        strokeWidth={1}
        strokeDasharray="2 4"
        style={{ stroke: "var(--t-ring-dash)" }}
      />
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        strokeWidth={thickness}
        style={{ stroke: "var(--t-ring-track)" }}
      />
      {segments.map((s, i) => (
        <circle
          key={s.label}
          cx={c}
          cy={c}
          r={r}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="butt"
          strokeDasharray={`${lengths[i].toFixed(2)} ${(circumference - lengths[i]).toFixed(2)}`}
          strokeDashoffset={-lengths.slice(0, i).reduce((a, b) => a + b, 0)}
          transform={`rotate(-90 ${c} ${c})`}
          style={{
            stroke: s.color,
            filter: `drop-shadow(0 0 4px color-mix(in srgb, ${s.color} 45%, transparent))`,
          }}
        />
      ))}
      <circle
        cx={c}
        cy={c}
        r={r - thickness / 2 - 4}
        fill="none"
        strokeWidth={1}
        style={{ stroke: "var(--t-ring-inner)" }}
      />
      <circle cx={c} cy={c} r={3} style={{ fill: "var(--t-cyan)" }} />
    </svg>
  );
}

export function BarChart({
  width,
  height,
  yMax,
  yTicks,
  xLabels,
  values,
}: {
  width: number;
  height: number;
  yMax: number;
  yTicks: number[];
  xLabels: string[];
  values: number[];
}) {
  const uid = useId().replace(/:/g, "");
  const padL = 22;
  const padR = 4;
  const padT = 8;
  const padB = 20;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const baseline = padT + innerH;
  const band = innerW / values.length;
  const barW = Math.max(3, band * 0.38);

  return (
    <svg width={width} height={height} className="block">
      <defs>
        <linearGradient id={`${uid}-bar`} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            style={{ stopColor: "var(--t-bar-top)", stopOpacity: 0.95 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "var(--t-bar-bottom)", stopOpacity: 0.55 }}
          />
        </linearGradient>
      </defs>

      {yTicks.map((t) => {
        const y = padT + innerH - (t / yMax) * innerH;
        return (
          <g key={t}>
            <line x1={padL} x2={width - padR} y1={y} y2={y} style={GRID} />
            <text
              x={padL - 6}
              y={y + 3.5}
              textAnchor="end"
              fontSize={10}
              style={AXIS}
            >
              {t}
            </text>
          </g>
        );
      })}

      {xLabels.map((label, i) => {
        const x = padL + (i / (xLabels.length - 1)) * innerW;
        return (
          <g key={label}>
            <line
              x1={x}
              x2={x}
              y1={padT}
              y2={baseline}
              style={{ stroke: "var(--t-grid-soft)" }}
            />
            <text
              x={x}
              y={height - 5}
              textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"}
              fontSize={10}
              style={AXIS}
            >
              {label}
            </text>
          </g>
        );
      })}

      {values.map((v, i) => {
        const h = (v / yMax) * innerH;
        return (
          <rect
            key={i}
            x={padL + i * band + (band - barW) / 2}
            y={baseline - h}
            width={barW}
            height={h}
            fill={`url(#${uid}-bar)`}
          />
        );
      })}
    </svg>
  );
}
