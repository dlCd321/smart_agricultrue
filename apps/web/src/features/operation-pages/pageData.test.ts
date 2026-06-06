import { describe, expect, it } from "vitest";

import { makeBlocks, operationPageFallbacks } from "./pageData";

describe("operation page fallback data", () => {
  it("keeps every feature page constrained to the existing 16 farm blocks", () => {
    for (const [route, page] of Object.entries(operationPageFallbacks)) {
      const blockIds = new Set(page.blocks.map((block) => block.blockId));

      expect(page.blocks, route).toHaveLength(16);
      expect(blockIds.has("B17"), route).toBe(false);
      expect(blockIds.has("B18"), route).toBe(false);
      expect(page.highlightedBlockIds.every((blockId) => blockIds.has(blockId)), route).toBe(true);
    }
  });

  it("ignores API-style overrides for blocks outside the 16-block scene", () => {
    const blocks = makeBlocks({
      B01: { displayValue: 88 },
      B17: { displayValue: 99 },
      B18: { displayValue: 100 },
    });
    const blockIds = new Set(blocks.map((block) => block.blockId));

    expect(blocks).toHaveLength(16);
    expect(blockIds.has("B17")).toBe(false);
    expect(blockIds.has("B18")).toBe(false);
    expect(blocks.find((block) => block.blockId === "B01")?.displayValue).toBe(88);
  });
});
