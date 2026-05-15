import { describe, expect, it } from "vitest";

import { alertItems, bottomModules, heatmapCells, trendPoints } from "./dashboardData";

describe("dashboard data", () => {
  it("keeps the moisture prediction module selected in the main navigation", () => {
    expect(bottomModules).toHaveLength(5);
    expect(bottomModules.find((module) => module.active)?.label).toBe("水分预测");
  });

  it("provides the seven-day moisture trend shown in the reference dashboard", () => {
    expect(trendPoints).toHaveLength(7);
    expect(trendPoints.at(-1)).toEqual({ label: "今天", value: 32 });
  });

  it("keeps the alert and heatmap surfaces populated", () => {
    expect(alertItems).toHaveLength(3);
    expect(heatmapCells).toHaveLength(70);
    expect(heatmapCells).toContain("red");
  });
});
