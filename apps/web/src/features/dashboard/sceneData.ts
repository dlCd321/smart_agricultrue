export type SceneToolId = "layers" | "cube" | "chart";

export type SceneTool = {
  id: SceneToolId;
  label: string;
};

export type FarmRiskLevel = "low" | "medium" | "high" | "severe";

export type FarmColorToken =
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "danger"
  | "muted"
  | "cyan"
  | "sky"
  | "success";

export type FarmBlockSceneDatum = {
  blockId: string;
  blockNo: string;
  blockName: string;
  grid: {
    row: number;
    col: number;
  };
  moisture: number;
  displayValue?: number | string;
  displayUnit?: string;
  risk: FarmRiskLevel;
  colorToken: FarmColorToken;
  colorHex?: string;
  heightValue: number;
};

const BLOCK_MOISTURE = [62, 58, 47, 39, 71, 52, 45, 31, 36, 49, 24, 44, 28, 33, 18, 41] as const;
const FARM_GRID_COLUMNS = 4;

export const sceneTools: SceneTool[] = [
  { id: "layers", label: "图层视图" },
  { id: "cube", label: "柱体模式" },
  { id: "chart", label: "趋势分析" },
];

export function getRiskLevel(moisture: number): FarmRiskLevel {
  if (moisture <= 20) {
    return "severe";
  }

  if (moisture <= 35) {
    return "high";
  }

  if (moisture <= 50) {
    return "medium";
  }

  return "low";
}

export function getColorToken(moisture: number, risk: FarmRiskLevel): FarmColorToken {
  if (risk === "severe") {
    return "red";
  }

  if (risk === "high") {
    return "orange";
  }

  if (risk === "medium") {
    return "yellow";
  }

  return "blue";
}

export function getHeightValue(moisture: number): number {
  // Higher moisture → taller column; lower moisture → shorter column.
  // Maps moisture [0, 100] linearly to heightValue [20, 100].
  return Math.max(20, Math.min(100, Math.round(20 + moisture * 0.8)));
}

export const farmSceneBlocks: FarmBlockSceneDatum[] = BLOCK_MOISTURE.map((moisture, index) => {
  const blockNumber = index + 1;
  const risk = getRiskLevel(moisture);

  return {
    blockId: `B${String(blockNumber).padStart(2, "0")}`,
    blockNo: `Block ${String(blockNumber).padStart(2, "0")}`,
    blockName: `${blockNumber} 号田`,
    grid: {
      row: Math.floor(index / FARM_GRID_COLUMNS),
      col: index % FARM_GRID_COLUMNS,
    },
    moisture,
    risk,
    colorToken: getColorToken(moisture, risk),
    heightValue: getHeightValue(moisture),
  };
});

export function getRecommendedBlockIds(blocks: readonly FarmBlockSceneDatum[], limit = 3): string[] {
  const riskScore: Record<FarmRiskLevel, number> = {
    low: 0,
    medium: 1,
    high: 2,
    severe: 3,
  };

  return [...blocks]
    .sort((left, right) => {
      const riskDelta = riskScore[right.risk] - riskScore[left.risk];

      if (riskDelta !== 0) {
        return riskDelta;
      }

      const moistureDelta = left.moisture - right.moisture;

      if (moistureDelta !== 0) {
        return moistureDelta;
      }

      return left.blockId.localeCompare(right.blockId);
    })
    .slice(0, limit)
    .map((block) => block.blockId);
}

export function getPrimaryRecommendedBlock(blocks: readonly FarmBlockSceneDatum[]): FarmBlockSceneDatum {
  const recommendedBlockId = getRecommendedBlockIds(blocks, 1)[0];
  const matchedBlock = blocks.find((block) => block.blockId === recommendedBlockId);

  if (!matchedBlock) {
    throw new Error("Expected at least one block when calculating irrigation recommendations.");
  }

  return matchedBlock;
}
