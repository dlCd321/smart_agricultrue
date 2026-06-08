import {
  farmSceneBlocks,
  type FarmBlockSceneDatum,
  type FarmColorToken,
  type FarmRiskLevel,
} from "../dashboard/sceneData";
import type { AppRoute } from "../layout/routes";

export type SceneBlockOverride = Omit<Partial<FarmBlockSceneDatum>, "colorToken" | "risk"> & {
  colorToken?: string;
  displayValue?: number | string;
  displayUnit?: string;
  heightValue?: number;
  risk?: string;
};

export type PageFactor = {
  level?: string;
  meta?: string;
  name: string;
  token?: string;
  value: number | string;
};

export type PageTimelineNode = {
  id: string;
  label: string;
  status?: "pending" | "running" | "completed" | "failed" | "cancelled";
  value?: string;
};

export type WaterPredictionData = {
  title: string;
  icon: "drop";
  blocks: FarmBlockSceneDatum[];
  highlightedBlockIds: string[];
  factors: PageFactor[];
  chartPoints: number[];
  conclusion: string[];
  recommendation: {
    start: string;
    latest: string;
    water: string;
  };
  timeline: PageTimelineNode[];
};

export type WaterWarningData = {
  title: string;
  icon: "alert";
  blocks: FarmBlockSceneDatum[];
  highlightedBlockIds: string[];
  sources: PageFactor[];
  summary: { severe: number; highest: string; riskText: string };
  conclusion: string[];
  risks: { block: string; deficit: string; hours: string; moisture: string }[];
  advice: string[];
  timeline: PageTimelineNode[];
};

export type YieldPredictionData = {
  title: string;
  icon: "seedling";
  blocks: FarmBlockSceneDatum[];
  highlightedBlockIds: string[];
  params: readonly (readonly [string, string])[];
  weights: { name: string; token?: string; value: number }[];
  confidence: string[];
  statistics: { average: string; change: string; quality: string; total: string };
  risks: string[];
  advice: string[];
  workflow: PageTimelineNode[];
};

export type IrrigationDecisionData = {
  title: string;
  icon: "drop";
  blocks: FarmBlockSceneDatum[];
  highlightedBlockIds: string[];
  params: readonly (readonly [string, string])[];
  queue: readonly (readonly [string, string, string])[];
  saving: string[];
  plan: { blocks: string; duration: string; rate: string; saving: string; start: string; water: string };
  workflow: PageTimelineNode[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const colorMap: Record<string, FarmColorToken> = {
  blue: "blue",
  cyan: "cyan",
  danger: "danger",
  green: "green",
  muted: "muted",
  orange: "orange",
  red: "red",
  sky: "sky",
  success: "success",
  yellow: "yellow",
};

const riskMap: Record<string, FarmRiskLevel> = {
  critical_low: "high",
  danger: "high",
  high: "high",
  low: "low",
  low_warning: "medium",
  medium: "medium",
  normal: "low",
  severe: "severe",
};

function normalizeHeight(value: number | undefined, fallback: number) {
  if (value === undefined) return fallback;
  return value <= 1 ? Math.round(value * 100) : value;
}

export function getIrrigationWaterDemand(moisture: number) {
  return clamp(Math.round(6 + Math.max(0, 60 - moisture) * 0.67), 6, 34);
}

export function getIrrigationSeverityByWater(waterDemand: number): FarmRiskLevel {
  if (waterDemand >= 28) return "severe";
  if (waterDemand >= 18) return "medium";
  return "low";
}

export function getIrrigationColorToken(waterDemand: number): FarmColorToken {
  const severity = getIrrigationSeverityByWater(waterDemand);

  if (severity === "severe") return "red";
  if (severity === "medium") return "yellow";
  return "blue";
}

export function getIrrigationHeightValue(waterDemand: number) {
  return clamp(Math.round(92 - waterDemand * 1.6), 34, 86);
}

export function makeBlocks(overrides: Record<string, SceneBlockOverride>): FarmBlockSceneDatum[] {
  return farmSceneBlocks.map((block) => {
    const override = overrides[block.blockId];
    if (!override) return block;

    return {
      ...block,
      ...override,
      colorToken: override.colorToken ? colorMap[override.colorToken] ?? block.colorToken : block.colorToken,
      heightValue: normalizeHeight(override.heightValue, block.heightValue),
      risk: override.risk ? riskMap[override.risk] ?? block.risk : block.risk,
    };
  });
}

export function buildIrrigationDecisionBlocks() {
  return makeBlocks(
    Object.fromEntries(
      farmSceneBlocks.map((block) => {
        const waterDemand = getIrrigationWaterDemand(block.moisture);

        return [
          block.blockId,
          {
            colorToken: getIrrigationColorToken(waterDemand),
            displayUnit: "m³",
            displayValue: waterDemand,
            heightValue: getIrrigationHeightValue(waterDemand),
            risk: getIrrigationSeverityByWater(waterDemand),
          } satisfies SceneBlockOverride,
        ];
      }),
    ),
  );
}

export const moisturePredictionData: WaterPredictionData = {
  title: "水分预测",
  icon: "drop",
  blocks: makeBlocks({
    B15: { colorToken: "orange", displayValue: 28, displayUnit: "%", heightValue: 0.28, moisture: 28, risk: "high" },
    B11: { colorToken: "danger", displayValue: 18, displayUnit: "%", heightValue: 0.18, moisture: 18, risk: "severe" },
    B13: { colorToken: "danger", displayValue: 12, displayUnit: "%", heightValue: 0.12, moisture: 12, risk: "severe" },
  }),
  highlightedBlockIds: ["B15", "B11", "B13"],
  factors: [
    { name: "降水预测", value: "12.6 mm", meta: "未来 24h 累计", level: "中等", token: "blue" },
    { name: "气温预测", value: "+2.3℃", meta: "未来 24h 平均", level: "偏高", token: "orange" },
    { name: "蒸发强度", value: "中等", meta: "未来 24h 预估", level: "中等", token: "green" },
    { name: "风速预测", value: "1.8 m/s", meta: "未来 24h 平均", level: "较低", token: "cyan" },
  ],
  chartPoints: [76, 70, 64, 72, 68, 52, 28, 18, 12],
  conclusion: ["24h 后部分地块进入低风险区", "48h 后大部分地块进入高风险区", "72h 后将出现严重缺水风险"],
  recommendation: {
    start: "今天 20:00",
    latest: "明天 06:00 前",
    water: "230 m³",
  },
  timeline: [
    { id: "now", label: "现在", value: "68%", status: "completed" },
    { id: "6h", label: "6h后", value: "62%", status: "completed" },
    { id: "12h", label: "12h后", value: "52%", status: "running" },
    { id: "24h", label: "24h后", value: "28%", status: "pending" },
    { id: "48h", label: "48h后", value: "18%", status: "failed" },
    { id: "72h", label: "72h后", value: "12%", status: "failed" },
  ],
};

export const moistureWarningData: WaterWarningData = {
  title: "水分预警",
  icon: "alert",
  blocks: makeBlocks({
    B15: { colorToken: "yellow", displayValue: 58, displayUnit: "%", heightValue: 0.58, moisture: 58, risk: "medium" },
    B16: { colorToken: "danger", displayValue: 18, displayUnit: "%", heightValue: 0.18, moisture: 18, risk: "severe" },
    B11: { colorToken: "danger", displayValue: 18, displayUnit: "%", heightValue: 0.18, moisture: 18, risk: "severe" },
    B13: { colorToken: "danger", displayValue: 18, displayUnit: "%", heightValue: 0.18, moisture: 18, risk: "severe" },
  }),
  highlightedBlockIds: ["B15", "B16", "B11", "B13"],
  sources: [
    { name: "降雨不足", value: "12.6 mm", meta: "状态：偏低", token: "blue" },
    { name: "蒸发强度", value: "0.78", meta: "状态：高", token: "orange" },
    { name: "高温风险", value: "32 ℃", meta: "趋势：持续升高", token: "red" },
    { name: "风速影响", value: "3.2 m/s", meta: "状态：较强", token: "green" },
  ],
  summary: { severe: 5, highest: "Block 15（B 区）", riskText: "风险等级：严重" },
  conclusion: ["3 个田块进入危险区", "Block 15 风险最高", "连续干旱预计超过 72 小时"],
  risks: [
    { block: "Block 15", moisture: "18%", deficit: "0.72", hours: "48 h" },
    { block: "Block 16", moisture: "18%", deficit: "0.69", hours: "40 h" },
  ],
  advice: ["建议今晚 20:00 进行灌溉", "优先处理 B15、B16 田块", "预计需水量约 230 m³"],
  timeline: [
    { id: "now", label: "现在", value: "较低", status: "completed" },
    { id: "6h", label: "6h后", value: "较低", status: "completed" },
    { id: "12h", label: "12h后", value: "中等", status: "running" },
    { id: "24h", label: "24h后", value: "较高", status: "pending" },
    { id: "48h", label: "48h后", value: "高", status: "failed" },
    { id: "72h", label: "72h后", value: "严重", status: "failed" },
  ],
};

export const yieldPredictionData: YieldPredictionData = {
  title: "产量预测",
  icon: "seedling",
  blocks: makeBlocks({
    B09: { colorToken: "green", displayValue: 930, displayUnit: "kg/亩", heightValue: 0.94, risk: "low" },
    B12: { colorToken: "green", displayValue: 940, displayUnit: "kg/亩", heightValue: 0.94, risk: "low" },
    B15: { colorToken: "yellow", displayValue: 720, displayUnit: "kg/亩", heightValue: 0.72, risk: "medium" },
    B16: { colorToken: "orange", displayValue: 650, displayUnit: "kg/亩", heightValue: 0.65, risk: "high" },
    B13: { colorToken: "yellow", displayValue: 770, displayUnit: "kg/亩", heightValue: 0.77, risk: "medium" },
  }),
  highlightedBlockIds: ["B09", "B12", "B15", "B16", "B13"],
  params: [
    ["预测模型", "CNN-LSTM"],
    ["作物类型", "夏玉米"],
    ["生育期", "灌浆期"],
    ["预测范围", "未来 7 天"],
  ] as const,
  weights: [
    { name: "土壤水分", value: 36, token: "blue" },
    { name: "温度积累", value: 24, token: "green" },
    { name: "光照时长", value: 18, token: "cyan" },
    { name: "氮素水平", value: 14, token: "blue" },
    { name: "降雨修正", value: 8, token: "sky" },
  ],
  confidence: ["R² 0.91", "MAPE 6.8%", "数据完整度 94%"],
  statistics: { total: "16840 kg", average: "842 kg/亩", quality: "91%", change: "+3.2%" },
  risks: ["B15：720 kg/亩，品质 75%", "B16：650 kg/亩，品质 68%", "B13：770 kg/亩，品质 82%"],
  advice: ["高产区保持当前灌溉策略", "B15 / B16 优先检查土壤含水与氮素水平", "48h 后重新运行产量品质预测"],
  workflow: [
    { id: "model", label: "选择模型", value: "已完成", status: "completed" },
    { id: "run", label: "运行预测", value: "已完成", status: "completed" },
    { id: "conclusion", label: "生成结论", value: "进行中", status: "running" },
    { id: "export", label: "导出报告", value: "待开始", status: "pending" },
  ] as const,
};

export const irrigationDecisionData: IrrigationDecisionData = {
  title: "灌溉决策",
  icon: "drop",
  blocks: buildIrrigationDecisionBlocks(),
  highlightedBlockIds: ["B15", "B11", "B13", "B08", "B14"],
  params: [
    ["决策模型", "缺水度优先"],
    ["目标含水率", "60%"],
    ["灌溉窗口", "今天 20:00–22:00"],
    ["约束条件", "避开强降雨"],
  ] as const,
  queue: [
    ["Block 15", "34m³", "优先灌溉"],
    ["Block 11", "30m³", "优先灌溉"],
    ["Block 13", "27m³", "中等灌溉"],
    ["Block 08", "25m³", "中等灌溉"],
  ],
  saving: ["预计节水 18%", "覆盖面积 12.4 亩", "处方图 PRE-0523"],
  plan: { water: "230 m³", blocks: "B15 / B11 / B13", start: "今天 20:00", duration: "90 分钟", rate: "0.50 m³/min", saving: "18%" },
  workflow: [
    { id: "generate", label: "生成处方", value: "已完成", status: "completed" },
    { id: "confirm", label: "方案确认", value: "待操作", status: "running" },
    { id: "wait", label: "等待执行", value: "未开始", status: "pending" },
    { id: "archive", label: "完成归档", value: "未开始", status: "pending" },
  ] as const,
};

export const operationPageFallbacks = {
  "water-prediction": moisturePredictionData,
  "water-warning": moistureWarningData,
  "yield-prediction": yieldPredictionData,
  "irrigation-decision": irrigationDecisionData,
} as const satisfies Record<Exclude<AppRoute, "home">, unknown>;

export type OperationRoute = Exclude<AppRoute, "home">;

export type OperationPageDataByRoute = {
  "water-prediction": WaterPredictionData;
  "water-warning": WaterWarningData;
  "yield-prediction": YieldPredictionData;
  "irrigation-decision": IrrigationDecisionData;
};

export type OperationPageData = OperationPageDataByRoute[OperationRoute];
