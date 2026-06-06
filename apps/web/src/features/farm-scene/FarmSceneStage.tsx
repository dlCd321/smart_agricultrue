import { sceneTools, type FarmBlockSceneDatum, type SceneToolId } from "../dashboard/sceneData";
import { Icon } from "../shared/Icon";
import { FarmScene3D } from "./FarmScene3D";
import { SceneControl } from "./SceneControl";

export function FarmSceneStage({
  activeTool,
  blocks,
  highlightedBlockIds,
  onCollapse,
  onExpand,
  onSelectBlock,
  onSelectTool,
  selectedBlockId,
}: {
  activeTool: SceneToolId;
  blocks: readonly FarmBlockSceneDatum[];
  highlightedBlockIds: readonly string[];
  onCollapse: () => void;
  onExpand: () => void;
  onSelectBlock: (blockId: string) => void;
  onSelectTool: (toolId: SceneToolId) => void;
  selectedBlockId: string;
}) {
  return (
    <section className="twin-stage" aria-label="位山示范基地 A 区数字孪生地图">
      <button className="scene-click-target" onClick={onCollapse} type="button" aria-label="收起侧边面板" />
      <div className="scene-shell">
        <FarmScene3D
          activeTool={activeTool}
          blocks={blocks}
          highlightedBlockIds={highlightedBlockIds}
          onSelectBlock={(blockId) => {
            onSelectBlock(blockId);
            onExpand();
          }}
          selectedBlockId={selectedBlockId}
        />

        <div className="scene-overlay">
          <div className="scene-tool-column" aria-label="中间地图工具栏" role="toolbar">
            {sceneTools.map((tool) => (
              <SceneControl
                activeTool={activeTool}
                key={tool.id}
                label={tool.label}
                onSelect={(toolId) => {
                  onSelectTool(toolId);
                  onExpand();
                }}
                toolId={tool.id}
              />
            ))}
          </div>

          <div className="scene-shortcuts scene-shortcuts--left">
            <button aria-label="查看现场快照" className="scene-floating-button scene-floating-button--small" type="button">
              <Icon name="calendar" />
            </button>
            <button aria-label="查看地块编组" className="scene-floating-button scene-floating-button--small" type="button">
              <Icon name="user" />
            </button>
          </div>

          <div className="scene-shortcuts scene-shortcuts--right">
            <button aria-label="查看防护概况" className="scene-floating-button scene-floating-button--small" type="button">
              <Icon name="shield" />
            </button>
            <button aria-label="查看运维席位" className="scene-floating-button scene-floating-button--small" type="button">
              <Icon name="user" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
