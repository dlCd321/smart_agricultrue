import type { FarmBlockSceneDatum, SceneToolId } from "../dashboard/sceneData";
import { BlockLayer } from "./BlockLayer";

export function FarmScene3D({
  activeTool,
  blocks,
  highlightedBlockIds,
  onSelectBlock,
  selectedBlockId,
}: {
  activeTool: SceneToolId;
  blocks: readonly FarmBlockSceneDatum[];
  highlightedBlockIds: readonly string[];
  onSelectBlock: (blockId: string) => void;
  selectedBlockId: string;
}) {
  return (
    <BlockLayer
      activeTool={activeTool}
      blocks={blocks}
      highlightedBlockIds={highlightedBlockIds}
      onSelectBlock={onSelectBlock}
      selectedBlockId={selectedBlockId}
    />
  );
}
