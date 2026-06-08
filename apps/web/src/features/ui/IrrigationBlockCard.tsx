import { Icon } from "../shared/Icon";
import type { FarmBlockSceneDatum } from "../dashboard/sceneData";

function getValueText(block: FarmBlockSceneDatum) {
  const value = block.displayValue ?? block.moisture;
  const unit = block.displayUnit ?? "%";
  return `${value}${unit}`;
}

export function IrrigationBlockCard({
  block,
  className,
  guidance,
  label,
  lead,
  metricLabel,
  title,
}: {
  block: FarmBlockSceneDatum;
  className?: string;
  guidance: string;
  label: string;
  lead: string;
  metricLabel: string;
  title: string;
}) {
  return (
    <article className={`glass-card recommendation-card ${className ?? ""}`.trim()}>
      <div className="card-title">
        <Icon name="drop" />
        <h2>{title}</h2>
      </div>
      <div className="recommendation-body">
        <span className="recommend-icon">
          <Icon name="drop" />
        </span>
        <div>
          <p>{lead}</p>
          <strong>{block.blockId}</strong>
          <small>{label}</small>
          <b>{getValueText(block)}</b>
          <em>{metricLabel}，{guidance}</em>
        </div>
      </div>
    </article>
  );
}
