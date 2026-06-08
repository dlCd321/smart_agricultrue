import type { ReactNode } from "react";

import { Icon, type IconName } from "../shared/Icon";

export function StatusCard({
  children,
  className,
  icon,
  title,
}: {
  children: ReactNode;
  className?: string;
  icon?: IconName;
  title: string;
}) {
  return (
    <article className={`glass-card status-card ${className ?? ""}`.trim()}>
      <div className="card-title">
        {icon ? <Icon name={icon} /> : null}
        <h2>{title}</h2>
      </div>
      {children}
    </article>
  );
}
