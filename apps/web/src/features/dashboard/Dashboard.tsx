import { useState } from "react";

import { alertItems, bottomModules, heatmapCells, trendPoints } from "./dashboardData";
import type { BottomModule, RiskLevel } from "./dashboardData";
import { sceneBlocks, sceneTools, type SceneBlock, type SceneToolId } from "./sceneData";

type IconName =
  | BottomModule["icon"]
  | "alert"
  | "calendar"
  | "chart"
  | "chevron"
  | "cloud"
  | "cube"
  | "grid"
  | "info"
  | "layers"
  | "rain"
  | "seedling"
  | "shield"
  | "user"
  | "settings";

const trendPath = trendPoints
  .map((point, index) => {
    const x = 18 + index * 38;
    const y = 18 + (100 - point.value) * 1.26;
    return `${x},${y}`;
  })
  .join(" ");

function Icon({ name, className }: { name: IconName; className?: string }) {
  const commonProps = {
    className: `ui-icon ${className ?? ""}`.trim(),
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (name) {
    case "home":
      return (
        <svg {...commonProps}>
          <path d="M3.4 10.8 12 3.7l8.6 7.1" />
          <path d="M5.7 10.4v9.2h4.8v-5.7h3v5.7h4.8v-9.2" />
        </svg>
      );
    case "drop":
      return (
        <svg {...commonProps}>
          <path d="M12 3.2c3.8 4.9 6 8.3 6 11.4a6 6 0 0 1-12 0c0-3.1 2.2-6.5 6-11.4Z" />
        </svg>
      );
    case "bell":
      return (
        <svg {...commonProps}>
          <path d="M7 10.8a5 5 0 1 1 10 0c0 3.8 1.6 4.9 2.4 5.9H4.6C5.4 15.7 7 14.6 7 10.8Z" />
          <path d="M10 19.1a2.2 2.2 0 0 0 4 0" />
        </svg>
      );
    case "tower":
      return (
        <svg {...commonProps}>
          <path d="M7 4h10v4H7z" />
          <path d="M9 8h6l1.3 11H7.7L9 8Z" />
          <path d="M6 19h12" />
          <path d="M10 12h4" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...commonProps}>
          <path d="M19.5 4.5c-8 .2-12.9 3.8-13.6 9.2-.5 3.6 1.7 5.8 4.9 5.4 5.2-.7 8.4-6.2 8.7-14.6Z" />
          <path d="M6.2 19.2c2.6-3.7 5.1-6 8.6-8" />
        </svg>
      );
    case "alert":
      return (
        <svg {...commonProps}>
          <path d="M12 4.2 21 20H3L12 4.2Z" />
          <path d="M12 9.2v5" />
          <path d="M12 17.2h.01" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...commonProps}>
          <path d="M5 5.8h14v14H5z" />
          <path d="M5 9.4h14" />
          <path d="M8 3.8v4" />
          <path d="M16 3.8v4" />
        </svg>
      );
    case "chart":
      return (
        <svg {...commonProps}>
          <path d="M4.5 19.5h15" />
          <path d="M5.2 17.8 9.1 13l3.1 2.4 5.8-7.7" />
          <path d="M18 7.7h-3" />
          <path d="M18 7.7v3" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...commonProps}>
          <path d="m9 5.5 6.5 6.5L9 18.5" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...commonProps}>
          <path d="M7.3 17.8h9.4a3.2 3.2 0 0 0 .2-6.4 5.2 5.2 0 0 0-10.1-1.2 3.8 3.8 0 0 0 .5 7.6Z" />
          <path d="M8 20.5v-1.7" />
          <path d="M12 20.5v-1.7" />
          <path d="M16 20.5v-1.7" />
        </svg>
      );
    case "cube":
      return (
        <svg {...commonProps}>
          <path d="m12 3.8 7.2 3.9v8.6L12 20.2l-7.2-3.9V7.7L12 3.8Z" />
          <path d="M4.8 7.7 12 11.6l7.2-3.9" />
          <path d="M12 11.6v8.6" />
        </svg>
      );
    case "grid":
      return (
        <svg {...commonProps}>
          <path d="M5 5h5v5H5z" />
          <path d="M14 5h5v5h-5z" />
          <path d="M5 14h5v5H5z" />
          <path d="M14 14h5v5h-5z" />
        </svg>
      );
    case "info":
      return (
        <svg {...commonProps}>
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
          <path d="M12 10v6" />
          <path d="M12 7.2h.01" />
        </svg>
      );
    case "layers":
      return (
        <svg {...commonProps}>
          <path d="m12 4 8 4-8 4-8-4 8-4Z" />
          <path d="m4 12 8 4 8-4" />
          <path d="m4 16 8 4 8-4" />
        </svg>
      );
    case "rain":
      return (
        <svg {...commonProps}>
          <path d="M7.2 14.5h9.7a3.3 3.3 0 0 0 .1-6.6A5.2 5.2 0 0 0 7 6.7a4 4 0 0 0 .2 7.8Z" />
          <path d="M8 18.5v1.7" />
          <path d="M12 18.5v1.7" />
          <path d="M16 18.5v1.7" />
        </svg>
      );
    case "seedling":
      return (
        <svg {...commonProps}>
          <path d="M12 20V9" />
          <path d="M12 11.2C8.4 10.8 6 8.8 5.2 5.3c3.5-.4 6 1.5 6.8 5.9Z" />
          <path d="M12 13.8c3.4-.3 5.6-2.2 6.5-5.4-3.3-.3-5.7 1.4-6.5 5.4Z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...commonProps}>
          <path d="M12 3.8 19 6v5.5c0 4.1-2.6 7.4-7 8.7-4.4-1.3-7-4.6-7-8.7V6l7-2.2Z" />
          <path d="m9.2 12 1.8 1.8 3.8-4.1" />
        </svg>
      );
    case "user":
      return (
        <svg {...commonProps}>
          <path d="M12 12.3a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" />
        </svg>
      );
    case "settings":
      return (
        <svg {...commonProps}>
          <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
          <path d="m19.2 13.6 1.2 1.1-1.7 3-1.6-.5a7.8 7.8 0 0 1-1.8 1l-.3 1.7h-3.4l-.3-1.7a7.8 7.8 0 0 1-1.8-1l-1.6.5-1.7-3 1.2-1.1a7 7 0 0 1 0-2.1l-1.2-1.1 1.7-3 1.6.5a7.8 7.8 0 0 1 1.8-1l.3-1.7H15l.3 1.7a7.8 7.8 0 0 1 1.8 1l1.6-.5 1.7 3-1.2 1.1a7 7 0 0 1 0 2.1Z" />
        </svg>
      );
    default:
      return null;
  }
}

function DashboardHeader() {
  return (
    <header className="dashboard-header">
      <a className="brand-lockup" href="/" aria-label="四川大学">
        <img src="/assets/sichuan-university-brand.png" alt="" />
        <span>
          <strong>四川大学</strong>
          <small>SICHUAN UNIVERSITY</small>
        </span>
      </a>

      <div className="title-lockup">
        <span className="title-wing title-wing--left" aria-hidden="true" />
        <h1>智 慧 农 业 灌 溉 平 台</h1>
        <span className="title-wing title-wing--right" aria-hidden="true" />
        <button className="base-selector" type="button">
          位山示范基地 A 区 · 数字孪生
          <Icon name="chevron" />
        </button>
      </div>

      <div className="header-actions" aria-label="系统快捷信息">
        <div className="weather-status">
          <span className="sun-cloud" aria-hidden="true" />
          <span>26°C</span>
          <span>晴</span>
          <span>10:00:09</span>
        </div>
        <button className="round-action" type="button" aria-label="用户中心">
          <Icon name="user" />
        </button>
        <button className="round-action round-action--plain" type="button" aria-label="系统设置">
          <Icon name="settings" />
        </button>
        <button className="weather-button" type="button">
          <Icon name="cloud" />
          查看天气
        </button>
      </div>
    </header>
  );
}

function MoistureTrendCard() {
  return (
    <article className="glass-card trend-card">
      <div className="card-title">
        <Icon name="drop" />
        <h2>土壤水分趋势</h2>
        <Icon name="info" className="title-info" />
      </div>
      <p className="chart-label">土壤含水率 (%)</p>
      <div className="trend-chart" aria-label="近 7 天土壤含水率趋势图">
        <svg viewBox="0 0 280 150" role="img">
          <title>土壤含水率从 74% 下降到 32%，阈值 25%</title>
          <g className="chart-grid">
            <path d="M22 16v116M60 16v116M98 16v116M136 16v116M174 16v116M212 16v116M250 16v116" />
            <path d="M22 16h228M22 45h228M22 74h228M22 103h228M22 132h228" />
          </g>
          <path className="threshold-line" d="M22 107h228" />
          <polyline className="trend-line" points={trendPath} />
          {trendPoints.map((point, index) => {
            const x = 18 + index * 38;
            const y = 18 + (100 - point.value) * 1.26;

            return <circle className="trend-dot" cx={x} cy={y} key={point.label} r={4.2} />;
          })}
          <circle className="trend-dot trend-dot--current" cx="246" cy="103.7" r="7.5" />
        </svg>
        <div className="chart-y-axis" aria-hidden="true">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>
      </div>
      <div className="trend-footer">
        <span className="x-axis-labels">
          {trendPoints.map((point) => (
            <small key={point.label}>{point.label}</small>
          ))}
        </span>
        <strong>32%</strong>
        <span className="threshold-text">阈值 25%</span>
        <button className="period-button" type="button">
          近7天
          <Icon name="calendar" />
        </button>
      </div>
    </article>
  );
}

function RainfallCard() {
  return (
    <article className="glass-card rainfall-card">
      <div className="card-title">
        <Icon name="drop" />
        <h2>今日预测降水量</h2>
      </div>
      <p className="rainfall-value">
        <strong>12.6</strong>
        <span>mm</span>
      </p>
      <p className="rainfall-probability">
        <Icon name="rain" />
        中雨概率&nbsp; 68%
      </p>
    </article>
  );
}

function AlertBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`alert-badge alert-badge--${level}`} aria-hidden="true">
      <Icon name="alert" />
    </span>
  );
}

function AlertCard() {
  return (
    <article className="glass-card alert-card">
      <div className="card-title card-title--with-count">
        <span>
          <Icon name="bell" />
          <h2>关键报警</h2>
        </span>
        <b>3</b>
      </div>
      <div className="alert-list">
        {alertItems.map((item) => (
          <div className="alert-row" key={`${item.blockId}-${item.message}`}>
            <AlertBadge level={item.level} />
            <span className="alert-message">
              <strong>{item.blockId}</strong>
              {item.message}
            </span>
            <time>{item.time}</time>
          </div>
        ))}
      </div>
      <button className="more-alerts" type="button">
        查看更多报警
        <Icon name="chevron" />
      </button>
    </article>
  );
}

function LeftPanel() {
  return (
    <aside className="side-panel side-panel--left" aria-label="水分趋势和报警面板">
      <MoistureTrendCard />
      <RainfallCard />
      <AlertCard />
    </aside>
  );
}

function RecommendationCard() {
  return (
    <article className="glass-card recommendation-card">
      <div className="card-title">
        <Icon name="drop" />
        <h2>建议灌溉地块</h2>
      </div>
      <div className="recommendation-body">
        <span className="recommend-icon">
          <Icon name="drop" />
        </span>
        <div>
          <p>建议灌溉</p>
          <strong>Block 15</strong>
          <small>当前土壤含水率</small>
          <b>18%</b>
          <em>土壤硬旱，建议灌溉</em>
        </div>
      </div>
    </article>
  );
}

function YieldHeatmapCard() {
  return (
    <article className="glass-card heatmap-card">
      <div className="card-title">
        <Icon name="seedling" />
        <h2>作物产量热力预测</h2>
      </div>
      <div className="heatmap-grid" aria-label="作物产量热力图">
        {heatmapCells.map((token, index) => (
          <span className={`heatmap-cell heatmap-cell--${token}`} key={`${token}-${index}`} />
        ))}
      </div>
      <div className="heatmap-legend">
        <span>低产</span>
        <i aria-hidden="true" />
        <span>高产</span>
      </div>
      <div className="heatmap-stats">
        <span>
          高产区 <strong>62%</strong>
        </span>
        <span>
          低产区 <strong>14%</strong>
        </span>
      </div>
    </article>
  );
}

function SimulationCard() {
  return (
    <article className="glass-card simulation-card">
      <div className="card-title card-title--with-status">
        <span>
          <Icon name="drop" />
          <h2>灌溉预测控制</h2>
        </span>
        <b>未开始</b>
      </div>
      <div className="simulation-copy">
        <p>预报状态：尚未开始灌溉预测</p>
        <p>请先选择模拟方案并启动预测。</p>
      </div>
      <div className="simulation-metrics">
        <span>
          预计灌溉时长
          <strong>-- 分钟</strong>
        </span>
        <span>
          预计用水量
          <strong>-- m³</strong>
        </span>
      </div>
      <button className="simulate-button" type="button">开始模拟</button>
    </article>
  );
}

function RightPanel() {
  return (
    <aside className="side-panel side-panel--right" aria-label="灌溉建议和功能面板">
      <RecommendationCard />
      <YieldHeatmapCard />
      <SimulationCard />
    </aside>
  );
}

function SidePeek({
  badge,
  icon,
  label,
  side,
  onOpen,
}: {
  badge?: string;
  icon: IconName;
  label: string;
  side: "left" | "right";
  onOpen: () => void;
}) {
  return (
    <button
      className={`side-peek side-peek--${side}`}
      onClick={onOpen}
      onFocus={onOpen}
      onMouseEnter={onOpen}
      type="button"
    >
      <span className="peek-icon">
        <Icon name={icon} />
        {badge ? <b>{badge}</b> : null}
      </span>
      <span className="peek-copy">
        <i aria-hidden="true" />
        悬停展开
        <small>{label}</small>
      </span>
    </button>
  );
}

function SceneToolButton({
  isActive,
  label,
  toolId,
  onSelect,
}: {
  isActive: boolean;
  label: string;
  toolId: SceneToolId;
  onSelect: (toolId: SceneToolId) => void;
}) {
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

function SceneBlockHotspot({
  block,
  isSelected,
  onSelect,
}: {
  block: SceneBlock;
  isSelected: boolean;
  onSelect: (blockId: string) => void;
}) {
  return (
    <button
      aria-label={`查看 ${block.label}`}
      className={`scene-block-hotspot ${isSelected ? "scene-block-hotspot--selected" : ""}`}
      onClick={() => onSelect(block.id)}
      style={{ left: `${block.x}%`, top: `${block.y}%` }}
      type="button"
    >
      <span className="scene-block-dot" aria-hidden="true" />
      <span className="scene-block-tag">
        <strong>{block.label}</strong>
        <small>{block.id}</small>
      </span>
    </button>
  );
}

function DigitalTwinScene({
  activeTool,
  onCollapse,
  onExpand,
  onSelectBlock,
  onSelectTool,
  selectedBlock,
}: {
  activeTool: SceneToolId;
  onCollapse: () => void;
  onExpand: () => void;
  onSelectBlock: (blockId: string) => void;
  onSelectTool: (toolId: SceneToolId) => void;
  selectedBlock: SceneBlock;
}) {
  return (
    <section className="twin-stage" aria-label="位山示范基地 A 区数字孪生地图">
      <button className="scene-click-target" onClick={onCollapse} type="button" aria-label="收起侧边面板" />
      <div className="scene-shell">
        <img className="farm-scene" src="/assets/farm-twin-scene.png" alt="18 个田块的 3D 数字孪生地图" />

        <div className="scene-overlay">
          <div className="scene-tool-column" aria-label="中间地图工具栏" role="toolbar">
            {sceneTools.map((tool) => (
              <SceneToolButton
                isActive={activeTool === tool.id}
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

          <div className="scene-focus-card" aria-live="polite">
            <span className="scene-focus-pill">当前焦点</span>
            <strong>{selectedBlock.label}</strong>
            <small>{selectedBlock.id} · 叠层热区已开启</small>
          </div>

          <div className="scene-block-layer" aria-label="18 个田块交互热区">
            {sceneBlocks.map((block) => (
              <SceneBlockHotspot
                block={block}
                isSelected={selectedBlock.id === block.id}
                key={block.id}
                onSelect={(blockId) => {
                  onSelectBlock(blockId);
                  onExpand();
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="主业务导航">
      {bottomModules.map((module) => (
        <a className={`bottom-tab ${module.active ? "bottom-tab--active" : ""}`} href="/" key={module.label}>
          <Icon name={module.icon} />
          <span>{module.label}</span>
        </a>
      ))}
      <a className="bottom-tab bottom-tab--status" href="/">
        <span className="system-dot" aria-hidden="true" />
        <span>系统状态：运行良好</span>
        <Icon name="chevron" />
      </a>
    </nav>
  );
}

export function Dashboard() {
  const [activeTool, setActiveTool] = useState<SceneToolId>("layers");
  const [panelsOpen, setPanelsOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return new URLSearchParams(window.location.search).get("view") === "expanded";
  });
  const [selectedBlockId, setSelectedBlockId] = useState("B15");

  const openPanels = () => setPanelsOpen(true);
  const collapsePanels = () => setPanelsOpen(false);
  const selectedBlock = sceneBlocks.find((block) => block.id === selectedBlockId) ?? sceneBlocks[0];

  return (
    <main className={`irrigation-dashboard ${panelsOpen ? "is-expanded" : "is-collapsed"}`}>
      <DashboardHeader />
      <div className="dashboard-workspace">
        <LeftPanel />
        <DigitalTwinScene
          activeTool={activeTool}
          onCollapse={collapsePanels}
          onExpand={openPanels}
          onSelectBlock={setSelectedBlockId}
          onSelectTool={setActiveTool}
          selectedBlock={selectedBlock}
        />
        <RightPanel />
        <SidePeek badge="3" icon="bell" label="查看报警详情" onOpen={openPanels} side="left" />
        <SidePeek icon="grid" label="查看功能面板" onOpen={openPanels} side="right" />
      </div>
      <BottomNavigation />
    </main>
  );
}
