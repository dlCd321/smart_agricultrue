import { useState } from "react";

import { FarmSceneStage } from "../farm-scene/FarmSceneStage";
import { PageLayout } from "../layout/PageLayout";
import type { AppRoute } from "../layout/routes";
import { SidePanel } from "../layout/SidePanel";
import { Icon, type IconName } from "../shared/Icon";
import { ChartCard } from "../ui/ChartCard";
import { StatusCard } from "../ui/StatusCard";
import { alertItems, heatmapCells, trendPoints } from "./dashboardData";
import type { RiskLevel } from "./dashboardData";
import {
  farmSceneBlocks,
  getPrimaryRecommendedBlock,
  getRecommendedBlockIds,
  type FarmBlockSceneDatum,
  type SceneToolId,
} from "./sceneData";

const trendPath = trendPoints
  .map((point, index) => {
    const x = 18 + index * 38;
    const y = 18 + (100 - point.value) * 1.26;
    return `${x},${y}`;
  })
  .join(" ");

function MoistureTrendCard() {
  return (
    <ChartCard className="trend-card" icon="drop" subtitle="土壤含水率 (%)" title="土壤水分趋势">
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
    </ChartCard>
  );
}

function RainfallCard() {
  return (
    <StatusCard className="rainfall-card" icon="drop" title="今日预测降水量">
      <p className="rainfall-value">
        <strong>12.6</strong>
        <span>mm</span>
      </p>
      <p className="rainfall-probability">
        <Icon name="rain" />
        中雨概率&nbsp; 68%
      </p>
    </StatusCard>
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
    <SidePanel ariaLabel="水分趋势和报警面板" side="left">
      <MoistureTrendCard />
      <RainfallCard />
      <AlertCard />
    </SidePanel>
  );
}

function RecommendationCard({
  recommendedBlock,
  selectedBlock,
}: {
  recommendedBlock: FarmBlockSceneDatum;
  selectedBlock: FarmBlockSceneDatum;
}) {
  const needsIrrigation = selectedBlock.moisture <= 35;
  const guidance = needsIrrigation ? "土壤偏干，建议优先安排灌溉。" : "当前含水率处于可控区间，建议持续观察。";

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
          <p>优先建议 {recommendedBlock.blockId}</p>
          <strong>{selectedBlock.blockId}</strong>
          <small>{selectedBlock.blockName} 当前土壤含水率</small>
          <b>{selectedBlock.moisture}%</b>
          <em>{guidance}</em>
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
    <StatusCard className="simulation-card" icon="drop" title="灌溉预测控制">
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
    </StatusCard>
  );
}

function RightPanel({
  recommendedBlock,
  selectedBlock,
}: {
  recommendedBlock: FarmBlockSceneDatum;
  selectedBlock: FarmBlockSceneDatum;
}) {
  return (
    <SidePanel ariaLabel="灌溉建议和功能面板" side="right">
      <RecommendationCard recommendedBlock={recommendedBlock} selectedBlock={selectedBlock} />
      <YieldHeatmapCard />
      <SimulationCard />
    </SidePanel>
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

export function Dashboard({ onNavigate }: { onNavigate?: (route: AppRoute) => void }) {
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
  const selectedBlock = farmSceneBlocks.find((block) => block.blockId === selectedBlockId) ?? farmSceneBlocks[0];
  const recommendedBlock = getPrimaryRecommendedBlock(farmSceneBlocks);
  const highlightedBlockIds = getRecommendedBlockIds(farmSceneBlocks);

  return (
    <PageLayout
      activeRoute="home"
      isExpanded={panelsOpen}
      leftPanel={<LeftPanel />}
      onNavigate={onNavigate}
      rightPanel={<RightPanel recommendedBlock={recommendedBlock} selectedBlock={selectedBlock} />}
    >
      <FarmSceneStage
        activeTool={activeTool}
        blocks={farmSceneBlocks}
        highlightedBlockIds={highlightedBlockIds}
        onCollapse={collapsePanels}
        onExpand={openPanels}
        onSelectBlock={setSelectedBlockId}
        onSelectTool={setActiveTool}
        selectedBlockId={selectedBlock.blockId}
      />
      <SidePeek badge="3" icon="bell" label="查看报警详情" onOpen={openPanels} side="left" />
      <SidePeek icon="grid" label="查看功能面板" onOpen={openPanels} side="right" />
    </PageLayout>
  );
}
