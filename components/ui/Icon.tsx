"use client";

import type { ComponentType } from "react";
import {
  Activity,
  Bell,
  Boxes,
  Building2,
  CarFront,
  ChartColumn,
  ChartLine,
  CircuitBoard,
  ClipboardCheck,
  CloudSun,
  DoorOpen,
  Factory,
  Fan,
  Flag,
  Flame,
  Gauge,
  Home,
  Layers,
  Maximize,
  Orbit,
  RefreshCw,
  Route,
  Server,
  Settings,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sun,
  TrendingUp,
  Truck,
  UserRound,
  Users,
  Video,
  Waypoints,
  Wrench,
  Zap,
  type LucideProps,
} from "lucide-react";

/** Names come from `lib/dashboard-data.ts`; every one of them is a real glyph. */
const ICONS: Record<string, ComponentType<LucideProps>> = {
  brand: Factory,
  weather: CloudSun,
  bell: Bell,
  user: UserRound,

  "nav-overview": Home,
  "nav-energy": Zap,
  "nav-device": Settings,
  "nav-security": ShieldCheck,
  "nav-logistics": Truck,
  "nav-analysis": ChartLine,

  "panel-overview": Activity,
  "panel-trend": TrendingUp,
  "panel-equipment": Boxes,
  "panel-device": Server,
  "panel-alarm": ShieldAlert,
  "panel-alarm-trend": ChartColumn,

  staff: Users,
  unit: Settings2,
  load: Gauge,
  capacity: Boxes,
  avatar: UserRound,

  power: Zap,
  heat: Flame,

  "gen-set": Fan,
  transformer: CircuitBoard,
  pump: RefreshCw,
  camera: Video,

  "stat-unit": Zap,
  "stat-camera": Video,
  "stat-transformer": Layers,

  "alarm-monitor": Video,
  "alarm-access": DoorOpen,
  "alarm-other": Flag,

  "tool-reset": Maximize,
  "tool-road": Route,
  "tool-orbit": Orbit,
  "tool-follow": CarFront,
  "tool-flythrough": Waypoints,

  "marker-plant": Factory,
  "marker-device": Wrench,
  "marker-power": Zap,

  "kpi-capacity": Building2,
  "kpi-power": Zap,
  "kpi-device": Layers,
  "kpi-heat": Sun,
  "kpi-inspection": ClipboardCheck,
};

export type IconTone = "accent" | "green" | "amber" | "red" | "neutral";

const TONE_COLOR: Record<IconTone, string> = {
  accent: "var(--t-cyan)",
  green: "var(--t-green)",
  amber: "var(--t-amber)",
  red: "var(--t-red)",
  neutral: "var(--t-muted)",
};

export function Icon({
  name,
  size = 16,
  strokeWidth = 1.9,
  className = "",
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const Glyph = ICONS[name];

  if (!Glyph) {
    return (
      <span
        data-icon={name}
        aria-hidden
        className={`inline-block shrink-0 rounded-[4px] border border-dashed border-twin-edge/50 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <Glyph
      data-icon={name}
      aria-hidden
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      className={`shrink-0 ${className}`}
    />
  );
}

/** Tinted rounded square behind a glyph, the accent treatment used across the reference design. */
export function IconChip({
  name,
  size = 34,
  iconSize,
  tone = "accent",
  round = false,
  className = "",
}: {
  name: string;
  size?: number;
  iconSize?: number;
  tone?: IconTone;
  round?: boolean;
  className?: string;
}) {
  const color = TONE_COLOR[tone];

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center border ${
        round ? "rounded-full" : "rounded-[9px]"
      } ${className}`}
      style={{
        width: size,
        height: size,
        color,
        borderColor: `color-mix(in srgb, ${color} 24%, transparent)`,
        background: `linear-gradient(150deg, color-mix(in srgb, ${color} 20%, transparent), color-mix(in srgb, ${color} 6%, transparent))`,
      }}
    >
      <Icon name={name} size={iconSize ?? Math.round(size * 0.55)} />
    </span>
  );
}
