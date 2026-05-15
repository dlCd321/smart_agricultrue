export type RiskLevel = "success" | "warning" | "danger";

export type BottomModule = {
  icon: "home" | "drop" | "bell" | "tower" | "leaf";
  label: string;
  active?: boolean;
};

export type AlertItem = {
  blockId: string;
  message: string;
  time: string;
  level: RiskLevel;
};

export type TrendPoint = {
  label: string;
  value: number;
};

export const bottomModules: readonly BottomModule[] = [
  { icon: "home", label: "返回主页" },
  { icon: "drop", label: "水分预测", active: true },
  { icon: "bell", label: "水分预警" },
  { icon: "tower", label: "灌溉决策" },
  { icon: "leaf", label: "产量预测" },
] as const;

export const trendPoints: readonly TrendPoint[] = [
  { label: "05-18", value: 74 },
  { label: "05-19", value: 72 },
  { label: "05-20", value: 81 },
  { label: "05-21", value: 69 },
  { label: "05-22", value: 58 },
  { label: "05-23", value: 40 },
  { label: "今天", value: 32 },
] as const;

export const alertItems: readonly AlertItem[] = [
  { blockId: "Block 15", message: "干旱预警", time: "10 分钟前", level: "danger" },
  { blockId: "Block 6", message: "土壤湿度过高", time: "25 分钟前", level: "danger" },
  { blockId: "灌溉设备 56 号", message: "离线", time: "1 小时前", level: "warning" },
] as const;

export const heatmapCells = Array.from({ length: 14 * 5 }, (_, index) => {
  const row = Math.floor(index / 14);
  const col = index % 14;
  const intenseBand = row >= 1 && row <= 3 && col >= 5 && col <= 11;
  const redCore = (row === 2 && col >= 7 && col <= 9) || (row === 3 && col >= 5 && col <= 7);
  const greenEdge = col >= 10 && row <= 3;
  const yellowPatch = (row <= 1 && col >= 9 && col <= 12) || (row === 4 && col === 12);

  if (redCore) {
    return "red";
  }

  if (yellowPatch || intenseBand) {
    return "yellow";
  }

  if (greenEdge) {
    return "green";
  }

  return "muted";
});
