import type { ReactNode } from "react";

export function SidePanel({
  ariaLabel,
  children,
  side,
}: {
  ariaLabel: string;
  children: ReactNode;
  side: "left" | "right";
}) {
  return (
    <aside className={`side-panel side-panel--${side}`} aria-label={ariaLabel}>
      {children}
    </aside>
  );
}
