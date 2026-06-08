import { Icon } from "../shared/Icon";
import type { SceneToolId } from "../dashboard/sceneData";

export function SceneControl({
  activeTool,
  label,
  onSelect,
  toolId,
}: {
  activeTool: SceneToolId;
  label: string;
  onSelect: (toolId: SceneToolId) => void;
  toolId: SceneToolId;
}) {
  const isActive = activeTool === toolId;

  return (
    <button
      aria-label={label}
      className={`scene-floating-button ${isActive ? "scene-floating-button--active" : ""}`}
      onClick={() => onSelect(toolId)}
      type="button"
    >
      <Icon name={toolId} />
    </button>
  );
}
