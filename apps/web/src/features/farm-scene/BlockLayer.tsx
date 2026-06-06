import { Farm3DMap } from "../dashboard/Farm3DMap";
import type { FarmBlockSceneDatum, SceneToolId } from "../dashboard/sceneData";

export type Block3D = FarmBlockSceneDatum;

export function BlockLayer({
  activeTool,
  blocks,
  highlightedBlockIds,
  onSelectBlock,
  selectedBlockId,
}: {
  activeTool: SceneToolId;
  blocks: readonly Block3D[];
  highlightedBlockIds: readonly string[];
  onSelectBlock: (blockId: string) => void;
  selectedBlockId: string;
}) {
  return (
    <Farm3DMap
      activeTool={activeTool}
      blocks={blocks}
      highlightedBlockIds={highlightedBlockIds}
      onSelectBlock={onSelectBlock}
      selectedBlockId={selectedBlockId}
    />
  );
}
