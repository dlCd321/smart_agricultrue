export type TimelineNode = {
  id: string;
  label: string;
  status?: "pending" | "running" | "completed" | "failed" | "cancelled";
  value?: string;
};

export function Timeline({
  activeId,
  nodes,
  onSelect,
}: {
  activeId?: string;
  nodes: readonly TimelineNode[];
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="shared-timeline" role="list">
      {nodes.map((node) => {
        const isActive = node.id === activeId;

        return (
          <button
            className={`shared-timeline__node ${isActive ? "shared-timeline__node--active" : ""}`}
            key={node.id}
            onClick={() => onSelect?.(node.id)}
            role="listitem"
            type="button"
          >
            <span className={`shared-timeline__dot shared-timeline__dot--${node.status ?? "pending"}`} />
            <span>{node.label}</span>
            {node.value ? <strong>{node.value}</strong> : null}
          </button>
        );
      })}
    </div>
  );
}
