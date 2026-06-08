import type { ApiResponse } from "@agriculture/shared";

import type { FarmBlockSceneDatum } from "../dashboard/sceneData";
import {
  getIrrigationColorToken,
  getIrrigationHeightValue,
  getIrrigationSeverityByWater,
  getIrrigationWaterDemand,
  irrigationDecisionData,
  makeBlocks,
  moisturePredictionData,
  moistureWarningData,
  operationPageFallbacks,
  type IrrigationDecisionData,
  type OperationPageDataByRoute,
  type OperationRoute,
  type PageFactor,
  type PageTimelineNode,
  type SceneBlockOverride,
  type WaterPredictionData,
  type WaterWarningData,
  type YieldPredictionData,
  yieldPredictionData,
} from "./pageData";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
const BASE_ID = "BASE_A";
const knownBlockIds = new Set(moisturePredictionData.blocks.map((block) => block.blockId));
const unknownBlockPattern = /\s*(?:[、/,，]\s*)?B(?:17|18)\b\s*(?:[、/,，]\s*)?/g;

type LoadResult<Route extends OperationRoute> = {
  data: OperationPageDataByRoute[Route];
  error: string | null;
  source: "api" | "fallback";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function readNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function formatValue(value: unknown, unit?: unknown, fallback = "--") {
  if (typeof value === "number") {
    return `${value}${typeof unit === "string" ? ` ${unit}` : ""}`;
  }

  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return fallback;
}

function isKnownBlockId(value: unknown): value is string {
  return typeof value === "string" && knownBlockIds.has(value);
}

function readKnownBlockIds(items: unknown[]): string[] {
  return items.map((item) => readString(item)).filter(isKnownBlockId);
}

function sanitizeBlockReferences(value: string) {
  return value
    .replace(unknownBlockPattern, (match) => {
      if (match.trim().startsWith("B")) return "";
      return match.trimEnd().endsWith("、") || match.trimEnd().endsWith(",") || match.trimEnd().endsWith("，") ? "" : " ";
    })
    .replace(/\s*[/、,，]\s*(?=优先|的|缺水|风险|$)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function readTextList(items: unknown[]): string[] {
  return items
    .map((item) => sanitizeBlockReferences(readString(item)))
    .filter(Boolean);
}

function normalizeStatus(value: unknown): PageTimelineNode["status"] {
  if (
    value === "pending" ||
    value === "running" ||
    value === "completed" ||
    value === "failed" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "pending";
}

function adaptTimelineNode(item: unknown): PageTimelineNode {
  const node = asRecord(item);
  return {
    id: readString(node.key, readString(node.id, "node")),
    label: readString(node.label, readString(node.key, "节点")),
    status: node.active === true ? "running" : normalizeStatus(node.status),
    value: readString(node.riskText, formatValue(node.moisture, "%", readString(node.value))),
  };
}

function adaptFactors(items: unknown[], fallback: PageFactor[]): PageFactor[] {
  if (items.length === 0) return fallback;

  return items.map((item, index) => {
    const factor = asRecord(item);
    return {
      name: readString(factor.factorName, readString(factor.sourceName, fallback[index]?.name ?? "影响因素")),
      value: readString(factor.valueText, formatValue(factor.value, factor.unit, String(fallback[index]?.value ?? "--"))),
      meta: readString(factor.periodText, readString(factor.subtitle, fallback[index]?.meta)),
      level: readString(factor.levelText, readString(factor.statusText, fallback[index]?.level)),
      token: readString(factor.colorToken, readString(factor.status, fallback[index]?.token)),
    };
  });
}

function adaptBlocks(items: unknown[], fallbackBlocks: readonly FarmBlockSceneDatum[]): FarmBlockSceneDatum[] {
  if (items.length === 0) return [...fallbackBlocks];

  const existingBlockIds = new Set(fallbackBlocks.map((block) => block.blockId));
  const overrides: Record<string, SceneBlockOverride> = {};

  for (const item of items) {
    const block = asRecord(item);
    const blockId = readString(block.blockId);
    if (!existingBlockIds.has(blockId)) continue;

    const displayValue = block.displayValue ?? block.estimatedYield ?? block.recommendedWaterM3 ?? block.currentMoisture;
    const displayUnit = readString(block.displayUnit, readString(block.yieldUnit, block.recommendedWaterM3 ? "m³" : "%"));

    overrides[blockId] = {
      colorHex: readString(block.colorHex, undefined),
      colorToken: readString(block.colorToken, undefined),
      displayUnit,
      displayValue: typeof displayValue === "number" || typeof displayValue === "string" ? displayValue : undefined,
      heightValue: readNumber(block.heightValue, undefined),
      moisture: readNumber(block.currentMoisture, readNumber(block.displayValue, undefined)),
      risk: readString(block.riskLevel, readString(block.yieldLevel, undefined)),
    };
  }

  return makeBlocks(overrides);
}

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, init);
  if (!response.ok) {
    throw new Error(`接口请求失败：${response.status}`);
  }

  const envelope = (await response.json()) as ApiResponse<T>;
  if (envelope.code !== 200 || envelope.data == null) {
    throw new Error(envelope.message || "接口未返回有效数据");
  }

  return envelope.data;
}

function adaptWaterPrediction(raw: unknown): WaterPredictionData {
  const data = asRecord(raw);
  const chart = asRecord(data.chart);
  const series = asArray(chart.series);
  const points = series
    .flatMap((item) => asArray(asRecord(item).points))
    .map((item) => readNumber(asRecord(item).value, NaN))
    .filter((value) => Number.isFinite(value));
  const recommendation = asRecord(data.irrigationRecommendation);
  const timeline = asRecord(data.timeline);

  return {
    ...moisturePredictionData,
    blocks: adaptBlocks(asArray(data.blocks), moisturePredictionData.blocks),
    chartPoints: points.length > 0 ? points : moisturePredictionData.chartPoints,
    conclusion: readTextList(
      asArray(asRecord(data.predictionConclusion).items).map((item) => asRecord(item).description),
    ),
    factors: adaptFactors(asArray(data.influenceFactors), moisturePredictionData.factors),
    highlightedBlockIds: moisturePredictionData.highlightedBlockIds,
    recommendation: {
      latest: readString(recommendation.latestStartText, moisturePredictionData.recommendation.latest),
      start: readString(recommendation.recommendedStartText, moisturePredictionData.recommendation.start),
      water: formatValue(recommendation.estimatedWaterM3, "m³", moisturePredictionData.recommendation.water),
    },
    timeline: asArray(timeline.nodes).length > 0
      ? asArray(timeline.nodes).map(adaptTimelineNode)
      : moisturePredictionData.timeline,
  };
}

function adaptWaterWarning(raw: unknown): WaterWarningData {
  const data = asRecord(raw);
  const summary = asRecord(data.summary);
  const riskMap = asRecord(data.riskMap);
  const conclusion = asRecord(data.alertConclusion);
  const treatmentAdvice = asRecord(data.treatmentAdvice);
  const timeline = asRecord(data.riskTimeline);

  return {
    ...moistureWarningData,
    blocks: adaptBlocks(asArray(riskMap.blocks), moistureWarningData.blocks),
    conclusion: readTextList(asArray(conclusion.items)),
    highlightedBlockIds: moistureWarningData.highlightedBlockIds,
    risks: asArray(data.topRiskBlocks).filter((item) => isKnownBlockId(asRecord(item).blockId)).map((item) => {
      const risk = asRecord(item);
      return {
        block: readString(risk.blockName, readString(risk.blockId, "Block")),
        deficit: String(readNumber(risk.deficitDegree, 0)),
        hours: `${readNumber(risk.continuousDryHours, 0)} h`,
        moisture: formatValue(risk.currentMoisture, "%", "--"),
      };
    }),
    advice: readTextList(asArray(treatmentAdvice.items)),
    sources: adaptFactors(asArray(data.warningSources), moistureWarningData.sources),
    summary: {
      highest: readString(asRecord(summary.highestRiskBlock).blockName, moistureWarningData.summary.highest),
      riskText: readString(summary.riskLevelText, moistureWarningData.summary.riskText),
      severe: readNumber(summary.forecastSevereBlockCount, moistureWarningData.summary.severe),
    },
    timeline: asArray(timeline.nodes).length > 0
      ? asArray(timeline.nodes).map(adaptTimelineNode)
      : moistureWarningData.timeline,
  };
}

function adaptYieldPrediction(raw: unknown): YieldPredictionData {
  const data = asRecord(raw);
  const input = asRecord(data.inputParameters);
  const confidence = asRecord(data.modelConfidence);
  const map = asRecord(data.map);
  const statistics = asRecord(data.statistics);

  return {
    ...yieldPredictionData,
    blocks: adaptBlocks(asArray(map.blocks), yieldPredictionData.blocks),
    highlightedBlockIds: yieldPredictionData.highlightedBlockIds,
    params: [
      ["预测模型", readString(input.modelName, yieldPredictionData.params[0][1])],
      ["作物类型", readString(input.cropType, yieldPredictionData.params[1][1])],
      ["生育期", readString(input.growthStage, yieldPredictionData.params[2][1])],
      ["预测范围", readString(input.predictionRangeText, yieldPredictionData.params[3][1])],
    ],
    weights: asArray(data.factorWeights).length > 0
      ? asArray(data.factorWeights).map((item) => {
          const factor = asRecord(item);
          return {
            name: readString(factor.factorName, "因素"),
            token: readString(factor.colorToken, "green"),
            value: readNumber(factor.weight, 0),
          };
        })
      : yieldPredictionData.weights,
    confidence: [
      `R² ${readNumber(confidence.r2, 0.91)}`,
      `MAPE ${readNumber(confidence.mape, 6.8)}%`,
      `数据完整度 ${readNumber(confidence.dataCompleteness, 94)}%`,
    ],
    statistics: {
      average: formatValue(statistics.averageYield, statistics.averageYieldUnit, yieldPredictionData.statistics.average),
      change: formatValue(statistics.weekOverWeekChange, "%", yieldPredictionData.statistics.change),
      quality: formatValue(statistics.averageQuality, "%", yieldPredictionData.statistics.quality),
      total: formatValue(statistics.estimatedTotalYield, statistics.totalYieldUnit, yieldPredictionData.statistics.total),
    },
    risks: asArray(data.riskHints).filter((item) => isKnownBlockId(asRecord(item).blockId)).map((item) => {
      const hint = asRecord(item);
      return `${readString(hint.blockId)}：${formatValue(hint.estimatedYield, hint.yieldUnit)}，品质 ${readNumber(hint.qualityScore, 0)}%`;
    }).filter((item) => item.length > 4),
    advice: readTextList(asArray(data.managementAdvice)),
    workflow: asArray(data.workflow).length > 0
      ? asArray(data.workflow).map(adaptTimelineNode)
      : yieldPredictionData.workflow,
  };
}

function adaptIrrigationDecision(raw: unknown): IrrigationDecisionData {
  const data = asRecord(raw);
  const input = asRecord(data.inputParameters);
  const window = asRecord(input.irrigationWindow);
  const summary = asRecord(data.summary);
  const waterSaving = asRecord(data.waterSavingEvaluation);
  const queues = asRecord(data.blockQueues);
  const priority = asRecord(queues.priority);

  return {
    ...irrigationDecisionData,
    blocks: makeBlocks(
      Object.fromEntries(
        irrigationDecisionData.blocks.map((fallbackBlock) => {
          const rawBlock = asArray(data.zones).find((item) => readString(asRecord(item).blockId) === fallbackBlock.blockId);
          const block = asRecord(rawBlock);
          const moisture = readNumber(block.currentMoisture, fallbackBlock.moisture);
          const rawWaterDemand = readNumber(block.recommendedWaterM3, getIrrigationWaterDemand(moisture));
          const waterDemand = rawWaterDemand > 0 ? rawWaterDemand : getIrrigationWaterDemand(moisture);

          return [
            fallbackBlock.blockId,
            {
              colorHex: readString(block.colorHex, undefined),
              colorToken: readString(block.colorToken, getIrrigationColorToken(waterDemand)),
              displayUnit: "m³",
              displayValue: waterDemand,
              heightValue: readNumber(block.heightValue, getIrrigationHeightValue(waterDemand)),
              moisture,
              risk: readString(block.riskLevel, getIrrigationSeverityByWater(waterDemand)),
            } satisfies SceneBlockOverride,
          ];
        }),
      ),
    ),
    highlightedBlockIds: readKnownBlockIds(asArray(summary.priorityBlocks)),
    params: [
      ["决策模型", readString(input.decisionModelName, irrigationDecisionData.params[0][1])],
      ["目标含水率", formatValue(input.targetMoisturePercent, "%", irrigationDecisionData.params[1][1])],
      ["灌溉窗口", readString(window.displayText, irrigationDecisionData.params[2][1])],
      ["约束条件", asArray(input.constraints).length > 0 ? `${asArray(input.constraints).length} 项` : irrigationDecisionData.params[3][1]],
    ],
    queue: asArray(priority.blocks).length > 0
      ? asArray(priority.blocks).filter((item) => isKnownBlockId(asRecord(item).blockId)).map((item) => {
          const block = asRecord(item);
          return [
            readString(block.blockName, readString(block.blockId, "Block")),
            formatValue(asRecord(block).recommendedWaterM3 ?? block.currentMoisture, "m³", "--"),
            readString(priority.label, "优先灌溉"),
          ] as const;
        })
      : irrigationDecisionData.queue,
    saving: [
      formatValue(waterSaving.expectedSavingPercent, "%", irrigationDecisionData.saving[0]),
      formatValue(waterSaving.coveredAreaMu, "亩", irrigationDecisionData.saving[1]),
      readString(waterSaving.prescriptionCode, irrigationDecisionData.saving[2]),
    ],
    plan: {
      blocks: readKnownBlockIds(asArray(summary.priorityBlocks)).slice(0, 3).join(" / ") || irrigationDecisionData.plan.blocks,
      duration: formatValue(summary.estimatedDurationMinutes, "分钟", irrigationDecisionData.plan.duration),
      rate: formatValue(asRecord(summary.simulatedFlowRate).value, asRecord(summary.simulatedFlowRate).unit, irrigationDecisionData.plan.rate),
      saving: formatValue(summary.waterSavingVsUniform, "%", irrigationDecisionData.plan.saving),
      start: readString(summary.recommendedStartText, irrigationDecisionData.plan.start),
      water: formatValue(summary.estimatedWaterM3, "m³", irrigationDecisionData.plan.water),
    },
    workflow: asArray(data.workflow).length > 0
      ? asArray(data.workflow).map(adaptTimelineNode)
      : irrigationDecisionData.workflow,
  };
}

export async function loadOperationPage<Route extends OperationRoute>(route: Route): Promise<LoadResult<Route>> {
  try {
    if (route === "water-prediction") {
      const data = await requestApi(`/prediction/moisture/page?baseId=${BASE_ID}&horizonHours=72`);
      return { data: adaptWaterPrediction(data) as OperationPageDataByRoute[Route], error: null, source: "api" };
    }

    if (route === "water-warning") {
      const data = await requestApi(`/alerts/moisture/page?baseId=${BASE_ID}&horizonHours=72`);
      return { data: adaptWaterWarning(data) as OperationPageDataByRoute[Route], error: null, source: "api" };
    }

    if (route === "yield-prediction") {
      const data = await requestApi(`/prediction/yield/page?baseId=${BASE_ID}`);
      return { data: adaptYieldPrediction(data) as OperationPageDataByRoute[Route], error: null, source: "api" };
    }

    const data = await requestApi("/irrigation/prescription", {
      body: JSON.stringify({
        baseId: BASE_ID,
        decisionModel: "deficit_priority",
        source: "manual",
        targetMoisturePercent: 60,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    return { data: adaptIrrigationDecision(data) as OperationPageDataByRoute[Route], error: null, source: "api" };
  } catch (error) {
    const fallback = operationPageFallbacks[route] as OperationPageDataByRoute[Route];
    return {
      data: fallback,
      error: error instanceof Error ? error.message : "接口请求失败",
      source: "fallback",
    };
  }
}
