import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getOperationPage } from "./OperationPages";
import { irrigationDecisionData } from "./pageData";

describe("irrigation decision page", () => {
  it("uses inverse column heights for larger irrigation demand", () => {
    const lowDemandBlock = irrigationDecisionData.blocks.find((block) => block.blockId === "B01");
    const highDemandBlock = irrigationDecisionData.blocks.find((block) => block.blockId === "B15");

    expect(lowDemandBlock?.displayValue).toBe(6);
    expect(highDemandBlock?.displayValue).toBe(34);
    expect((highDemandBlock?.heightValue ?? 0)).toBeLessThan(lowDemandBlock?.heightValue ?? 0);
    expect(lowDemandBlock?.colorToken).toBe("blue");
    expect(highDemandBlock?.colorToken).toBe("red");
  });

  it("renders a reusable irrigation detail card for the selected block", () => {
    const page = getOperationPage("irrigation-decision", irrigationDecisionData, { selectedBlockId: "B03" });
    const markup = renderToStaticMarkup(page.rightPanel);

    expect(markup).toContain("地块灌溉详情");
    expect(markup).toContain("B03");
    expect(markup).toContain("15m³");
    expect(markup).toContain("点击地图地块后同步更新");
    expect(markup).toContain("recommendation-card");
  });
});
