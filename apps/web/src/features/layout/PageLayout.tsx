import type { ReactNode } from "react";

import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import type { AppRoute } from "./routes";
import { Icon, type IconName } from "../shared/Icon";

export function PageLayout({
  activeRoute,
  children,
  isExpanded,
  leftPanel,
  onNavigate,
  pageIcon,
  pageTitle,
  rightPanel,
}: {
  activeRoute: AppRoute;
  children: ReactNode;
  isExpanded: boolean;
  leftPanel: ReactNode;
  onNavigate?: (route: AppRoute) => void;
  pageIcon?: IconName;
  pageTitle?: string;
  rightPanel: ReactNode;
}) {
  return (
    <main className={`irrigation-dashboard ${isExpanded ? "is-expanded" : "is-collapsed"}`}>
      <Header />
      {pageTitle ? (
        <div className="module-title">
          {pageIcon ? <Icon name={pageIcon} /> : null}
          <strong>{pageTitle}</strong>
        </div>
      ) : null}
      <div className="dashboard-workspace">
        {leftPanel}
        {children}
        {rightPanel}
      </div>
      <BottomNav activeRoute={activeRoute} onNavigate={onNavigate} />
    </main>
  );
}
