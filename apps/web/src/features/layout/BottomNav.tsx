import { Icon } from "../shared/Icon";
import { appNavItems, type AppRoute } from "./routes";

export function BottomNav({
  activeRoute,
  onNavigate,
}: {
  activeRoute: AppRoute;
  onNavigate?: (route: AppRoute) => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="主业务导航">
      {appNavItems.map((module) => {
        const isActive = module.route === activeRoute;

        return (
          <a
            className={`bottom-tab ${isActive ? "bottom-tab--active" : ""}`}
            href={`#/${module.route}`}
            key={module.route}
            onClick={(event) => {
              if (!onNavigate) return;
              event.preventDefault();
              onNavigate(module.route);
            }}
          >
            <Icon name={module.icon} />
            <span>{module.label}</span>
          </a>
        );
      })}
      <a className="bottom-tab bottom-tab--status" href="#/home">
        <span className="system-dot" aria-hidden="true" />
        <span>系统状态：运行良好</span>
        <Icon name="chevron" />
      </a>
    </nav>
  );
}
