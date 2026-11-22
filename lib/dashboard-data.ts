export type IconName = string;

export const header = {
  title: "智慧热电厂数字孪生平台",
  subtitle: "SMART THERMAL POWER PLANT · DIGITAL TWIN",
  brandIcon: "brand" as IconName,
  weatherIcon: "weather" as IconName,
  temperature: "24°C",
  weather: "多云",
  datetime: "2026-11-06 18:42",
  skinButton: "一键换肤",
  bellIcon: "bell" as IconName,
  bellBadge: 3,
  userIcon: "user" as IconName,
};

export const navItems: { key: string; label: string; icon: IconName }[] = [
  { key: "overview", label: "园区总览", icon: "nav-overview" },
  { key: "energy", label: "能源管理", icon: "nav-energy" },
  { key: "device", label: "设备运维", icon: "nav-device" },
  { key: "security", label: "安防监控", icon: "nav-security" },
  { key: "logistics", label: "物流通行", icon: "nav-logistics" },
  { key: "analysis", label: "运营分析", icon: "nav-analysis" },
];

export const operationOverview: {
  label: string;
  value: string;
  unit: string;
  icon: IconName;
}[] = [
  { label: "在岗人员", value: "186", unit: "人", icon: "staff" },
  { label: "在线机组", value: "2/2", unit: "台", icon: "unit" },
  { label: "发电负荷", value: "78.7", unit: "%", icon: "load" },
  { label: "装机容量", value: "150", unit: "MW", icon: "capacity" },
];

export const overviewAvatarIcon: IconName = "avatar";

export const generationTrend = {
  totals: [
    { label: "今日发电", value: "2,640", unit: "MWh", icon: "power" as IconName },
    { label: "今日供热", value: "8,420", unit: "GJ", icon: "heat" as IconName },
  ],
  yMin: 80,
  yMax: 160,
  yTicks: [80, 100, 120, 140, 160],
  xLabels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
  series: [
    { name: "发电", color: "var(--t-cyan)", data: [101, 128, 133, 136, 129, 118] },
    { name: "供热", color: "var(--t-green)", data: [94, 101, 106, 109, 104, 97] },
  ],
};

export const keyEquipment: {
  label: string;
  value: string;
  unit: string;
  status: string;
  icon: IconName;
}[] = [
  { label: "发电机组", value: "2", unit: "台", status: "并网", icon: "gen-set" },
  { label: "主变压器", value: "2", unit: "台", status: "运行", icon: "transformer" },
  { label: "循环泵", value: "3", unit: "台", status: "2用1备", icon: "pump" },
  { label: "摄像头", value: "66", unit: "路", status: "64在线", icon: "camera" },
];

export const deviceOnlineStatus: {
  label: string;
  value: string;
  unit: string;
  icon: IconName;
}[] = [
  { label: "机组", value: "2 / 2", unit: "台", icon: "stat-unit" },
  { label: "摄像头", value: "64 / 66", unit: "路", icon: "stat-camera" },
  { label: "主变", value: "2 / 2", unit: "台", icon: "stat-transformer" },
];

export const alarmHandling = {
  // Colors are CSS vars so every accent follows the active skin.
  segments: [
    { label: "已处理", value: 0, color: "var(--t-green)" },
    { label: "处理中", value: 0, color: "var(--t-cyan)" },
    { label: "未处理", value: 2, color: "var(--t-amber)" },
  ],
  columns: ["已处理", "处理中", "未处理"],
  rows: [
    { label: "监控", total: 1, cells: [0, 0, 1], icon: "alarm-monitor" as IconName },
    { label: "通行", total: 1, cells: [0, 0, 1], icon: "alarm-access" as IconName },
    { label: "其他", total: 0, cells: [0, 0, 0], icon: "alarm-other" as IconName },
  ],
};

export const alarmTrend = {
  yMax: 12,
  yTicks: [0, 3, 6, 9, 12],
  xLabels: ["10/12", "10/17", "10/22", "10/27", "11/01", "11/06"],
  values: [3, 4, 2, 4, 3, 5, 4, 12, 5, 3, 6, 4, 9, 5, 2, 6, 4, 9, 3, 6],
};

export const sceneTag = {
  location: "主生产区",
  mode: "三维总览",
  badge: "DEMO",
};

/** View modes the 3D stage understands, in toolbar order. */
export type SceneViewKey = "reset" | "road" | "orbit" | "follow" | "flythrough";

export const viewToolbar: {
  key: SceneViewKey;
  label: string;
  icon: IconName;
}[] = [
  { key: "reset", label: "恢复总览", icon: "tool-reset" },
  { key: "road", label: "沿道路行驶", icon: "tool-road" },
  { key: "orbit", label: "自动环绕", icon: "tool-orbit" },
  { key: "follow", label: "跟随车辆", icon: "tool-follow" },
  { key: "flythrough", label: "园区穿梭", icon: "tool-flythrough" },
];

/** Position is a percentage of the full 1920x1080 stage, so markers track the scene layout. */
export const sceneMarkers: {
  label: string;
  x: number;
  y: number;
  color: string;
  icon: IconName;
}[] = [
  { label: "生产厂房", x: 57.5, y: 24.5, color: "var(--t-cyan)", icon: "marker-plant" },
  { label: "生产设备", x: 74.2, y: 33.5, color: "var(--t-amber)", icon: "marker-device" },
  { label: "配电区域", x: 50.6, y: 61.5, color: "var(--t-red)", icon: "marker-power" },
];

export const bottomKpis: {
  label: string;
  value: string;
  unit: string;
  icon: IconName;
}[] = [
  { label: "装机容量", value: "150", unit: "MW", icon: "kpi-capacity" },
  { label: "实时发电", value: "118", unit: "MW", icon: "kpi-power" },
  { label: "监测设备", value: "216", unit: "台", icon: "kpi-device" },
  { label: "实时供热", value: "104", unit: "MW", icon: "kpi-heat" },
  { label: "巡检完成率", value: "90.5", unit: "%", icon: "kpi-inspection" },
];
