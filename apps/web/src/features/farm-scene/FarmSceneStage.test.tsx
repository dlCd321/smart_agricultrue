import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { farmSceneBlocks } from "../dashboard/sceneData";
import { FarmSceneStage } from "./FarmSceneStage";

describe("FarmSceneStage", () => {
  it("renders a dedicated collapse handle instead of a full-stage click target", () => {
    const markup = renderToStaticMarkup(
      <FarmSceneStage
        activeTool="layers"
        blocks={farmSceneBlocks}
        highlightedBlockIds={["B15"]}
        onCollapse={vi.fn()}
        onExpand={vi.fn()}
        onSelectBlock={vi.fn()}
        onSelectTool={vi.fn()}
        selectedBlockId="B15"
      />,
    );

    expect(markup).toContain("scene-collapse-handle");
    expect(markup).not.toContain("scene-click-target");
  });
});
