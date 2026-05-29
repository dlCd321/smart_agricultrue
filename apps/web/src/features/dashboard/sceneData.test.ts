import { describe, expect, it } from "vitest";

import {
  farmSceneBlocks,
  getColorToken,
  getHeightValue,
  getPrimaryRecommendedBlock,
  getRecommendedBlockIds,
  getRiskLevel,
  sceneTools,
} from "./sceneData";

describe("digital twin scene data", () => {
  it("defines all 16 blocks with stable block ids and a complete grid layout", () => {
    expect(farmSceneBlocks).toHaveLength(16);
    expect(farmSceneBlocks.map((block) => block.blockId)).toEqual(
      Array.from({ length: 16 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`),
    );
    expect(new Set(farmSceneBlocks.map((block) => `${block.grid.row}-${block.grid.col}`)).size).toBe(16);
  });

  it("keeps color and height mappings deterministic for moisture-risk states", () => {
    expect(getRiskLevel(63)).toBe("low");
    expect(getRiskLevel(44)).toBe("medium");
    expect(getRiskLevel(28)).toBe("high");

    expect(getColorToken(63, "low")).toBe("blue");
    expect(getColorToken(44, "medium")).toBe("yellow");
    expect(getColorToken(28, "high")).toBe("red");

    // Higher moisture should produce a taller column (larger heightValue).
    expect(getHeightValue(72)).toBeGreaterThan(getHeightValue(24));
    expect(farmSceneBlocks.every((block) => block.heightValue >= 20 && block.heightValue <= 100)).toBe(true);
  });

  it("keeps irrigation recommendation ranking anchored on the driest high-risk blocks", () => {
    expect(getRecommendedBlockIds(farmSceneBlocks)).toEqual(["B15", "B11", "B13"]);
    expect(getPrimaryRecommendedBlock(farmSceneBlocks).blockId).toBe("B15");
  });

  it("keeps the three left-side scene tools in the expected order", () => {
    expect(sceneTools.map((tool) => tool.id)).toEqual(["layers", "cube", "chart"]);
  });
});
