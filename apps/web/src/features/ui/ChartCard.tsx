import type { ReactNode } from "react";

import { Icon, type IconName } from "../shared/Icon";

export function ChartCard({
  children,
  className,
  icon,
  subtitle,
  title,
}: {
  children: ReactNode;
  className?: string;
  icon?: IconName;
  subtitle?: string;
  title: string;
}) {
  return (
    <article className={`glass-card chart-card ${className ?? ""}`.trim()}>
      <div className="card-title">
        {icon ? <Icon name={icon} /> : null}
        <h2>{title}</h2>
      </div>
      {subtitle ? <p className="chart-label">{subtitle}</p> : null}
      {children}
    </article>
  );
}
