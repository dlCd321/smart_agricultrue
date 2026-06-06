/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";

import { SidePanel } from "../layout/SidePanel";
import { Icon, type IconName } from "../shared/Icon";
import { ChartCard } from "../ui/ChartCard";
import { StatusCard } from "../ui/StatusCard";
import { Timeline, type TimelineNode } from "../ui/Timeline";
import type { FarmBlockSceneDatum } from "../dashboard/sceneData";
import {
  irrigationDecisionData,
  moisturePredictionData,
  moistureWarningData,
  type IrrigationDecisionData,
  type OperationPageData,
  type OperationRoute,
  type WaterPredictionData,
  type WaterWarningData,
  type YieldPredictionData,
  yieldPredictionData,
} from "./pageData";

export type OperationPageView = {
  blocks: readonly FarmBlockSceneDatum[];
  bottomPanel?: ReactNode;
  centerOverlay?: ReactNode;
  highlightedBlockIds: readonly string[];
  icon: IconName;
  leftPanel: ReactNode;
  pageTitle: string;
  rightPanel: ReactNode;
};

type OperationPageOptions = {
  activeTimelineId?: string;
  onTimelineSelect?: (id: string) => void;
};

function FieldRows({ rows }: { rows: readonly (readonly [string, string])[] }) {
  return (
    <div className="field-row-list">
      {rows.map(([label, value]) => (
        <div className="field-row" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function FactorRows({
  rows,
}: {
  rows: readonly { level?: string; meta?: string; name: string; token?: string; value: number | string }[];
}) {
  return (
    <div className="factor-list">
      {rows.map((row) => (
        <div className="factor-row" key={row.name}>
          <span className={`factor-row__icon factor-row__icon--${row.token ?? "blue"}`} />
          <div>
            <strong>{row.name}</strong>
            <small>{row.meta}</small>
          </div>
          <b>{row.value}</b>
          {row.level ? <em>{row.level}</em> : null}
        </div>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="operation-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function ProgressRows({ rows }: { rows: readonly { name: string; token?: string; value: number }[] }) {
  return (
    <div className="progress-list">
      {rows.map((row) => (
        <div className="progress-row" key={row.name}>
          <span>{row.name}</span>
          <i>
            <b className={`progress-row__bar progress-row__bar--${row.token ?? "green"}`} style={{ width: `${row.value}%` }} />
          </i>
          <strong>{row.value}%</strong>
        </div>
      ))}
    </div>
  );
}

function MoisturePredictionChart({
  activeTimelineId,
  data,
}: {
  activeTimelineId?: string;
  data: WaterPredictionData;
}) {
  const points = data.chartPoints
    .map((value, index) => `${42 + index * 78},${260 - value * 2.2}`)
    .join(" ");
  const activePointIndex = Math.max(
    0,
    data.timeline.findIndex((node) => node.id === activeTimelineId),
  );

  return (
    <section className="center-chart-panel" aria-label="土壤含水率预测曲线">
      <div className="center-chart-panel__header">
        <h2>土壤含水率预测曲线 <span>（0–100%）</span></h2>
        <p><i className="legend-line legend-line--solid" /> 历史 <i className="legend-line legend-line--dash" /> 预测</p>
      </div>
      <svg viewBox="0 0 700 320" role="img">
        <title>土壤含水率预测曲线</title>
        <defs>
          <linearGradient id="moisture-band" x1="0" x2="1">
            <stop offset="0" stopColor="#d9ecff" />
            <stop offset="0.45" stopColor="#e5f7df" />
            <stop offset="0.7" stopColor="#fff1d0" />
            <stop offset="1" stopColor="#ffe0df" />
          </linearGradient>
        </defs>
        <rect x="40" y="24" width="624" height="252" fill="url(#moisture-band)" opacity="0.78" rx="12" />
        <g className="operation-chart-grid">
          <path d="M40 24H664M40 87H664M40 150H664M40 213H664M40 276H664" />
          <path d="M40 24V276M196 24V276M352 24V276M508 24V276M664 24V276" />
        </g>
        <polyline className="operation-chart-line" points={points} />
        {data.chartPoints.map((value, index) => (
          <circle
            className={`operation-chart-dot ${index === activePointIndex ? "operation-chart-dot--active" : ""}`}
            cx={42 + index * 78}
            cy={260 - value * 2.2}
            key={`${value}-${index}`}
            r={index === activePointIndex ? "7" : "5"}
          />
        ))}
      </svg>
      <p className="center-chart-panel__note">预测模型：气象预测 + 土壤模型 + 作物需水模型</p>
    </section>
  );
}

function BottomTimeline({
  activeId,
  nodes,
  onSelect,
  title,
}: {
  activeId?: string;
  nodes: readonly TimelineNode[];
  onSelect?: (id: string) => void;
  title: string;
}) {
  return (
    <section className="operation-bottom-panel">
      <div className="operation-bottom-panel__title">
        <Icon name="calendar" />
        <strong>{title}</strong>
      </div>
      <Timeline activeId={activeId ?? nodes[0]?.id} nodes={nodes} onSelect={onSelect} />
    </section>
  );
}

function WaterPredictionView(
  data: WaterPredictionData = moisturePredictionData,
  options: OperationPageOptions = {},
): OperationPageView {
  return {
    blocks: data.blocks,
    centerOverlay: <MoisturePredictionChart activeTimelineId={options.activeTimelineId} data={data} />,
    highlightedBlockIds: data.highlightedBlockIds,
    icon: "drop",
    pageTitle: data.title,
    leftPanel: (
      <SidePanel ariaLabel="水分预测影响因素" side="left">
        <ChartCard className="operation-card" icon="drop" title="影响因素">
          <FactorRows rows={data.factors} />
        </ChartCard>
      </SidePanel>
    ),
    rightPanel: (
      <SidePanel ariaLabel="水分预测结论和方案" side="right">
        <StatusCard className="operation-card conclusion-card conclusion-card--danger" icon="alert" title="预测结论">
          <h3>未来缺水风险升高</h3>
          <BulletList items={data.conclusion} />
        </StatusCard>
        <StatusCard className="operation-card" icon="seedling" title="建议灌溉方案">
          <div className="plan-metric">
            <span>推荐灌溉时间</span>
            <strong>{data.recommendation.start}</strong>
          </div>
          <FieldRows rows={[["可延迟至", data.recommendation.latest], ["预计灌溉用水量", data.recommendation.water]]} />
          <button className="primary-action" type="button">生成灌溉方案</button>
        </StatusCard>
        <StatusCard className="operation-card" icon="rain" title="降水对缺水的影响">
          <p className="large-copy">约 <strong>18</strong> 小时</p>
        </StatusCard>
      </SidePanel>
    ),
    bottomPanel: (
      <BottomTimeline
        activeId={options.activeTimelineId}
        nodes={data.timeline}
        onSelect={options.onTimelineSelect}
        title="预测时间轴"
      />
    ),
  };
}

function WaterWarningView(
  data: WaterWarningData = moistureWarningData,
  options: OperationPageOptions = {},
): OperationPageView {
  return {
    blocks: data.blocks,
    highlightedBlockIds: data.highlightedBlockIds,
    icon: "alert",
    pageTitle: data.title,
    leftPanel: (
      <SidePanel ariaLabel="水分预警来源" side="left">
        <StatusCard className="operation-card" icon="alert" title="预警来源">
          <FactorRows rows={data.sources} />
        </StatusCard>
      </SidePanel>
    ),
    rightPanel: (
      <SidePanel ariaLabel="水分预警结论" side="right">
        <StatusCard className="operation-card conclusion-card conclusion-card--danger" icon="alert" title="预警结论">
          <h3>未来 48h 缺水风险升高</h3>
          <BulletList items={data.conclusion} />
        </StatusCard>
        <StatusCard className="operation-card" icon="alert" title="重点风险田块 TOP 2">
          <div className="risk-block-list">
            {data.risks.map((risk) => (
              <div className="risk-block-row" key={risk.block}>
                <strong>{risk.block}</strong>
                <span>{risk.moisture}</span>
                <span>{risk.deficit}</span>
                <span>{risk.hours}</span>
              </div>
            ))}
          </div>
        </StatusCard>
        <StatusCard className="operation-card" icon="seedling" title="处理建议">
          <BulletList items={data.advice} />
          <button className="primary-action primary-action--danger" type="button">生成灌溉方案</button>
        </StatusCard>
      </SidePanel>
    ),
    centerOverlay: (
      <section className="floating-summary floating-summary--warning">
        <Icon name="alert" />
        <span>严重缺水田块</span>
        <strong>{data.summary.severe} 个</strong>
        <i />
        <span>最高风险区域</span>
        <b>{data.summary.highest}</b>
      </section>
    ),
    bottomPanel: (
      <BottomTimeline
        activeId={options.activeTimelineId}
        nodes={data.timeline}
        onSelect={options.onTimelineSelect}
        title="风险演化时间轴"
      />
    ),
  };
}

function YieldPredictionView(
  data: YieldPredictionData = yieldPredictionData,
  options: OperationPageOptions = {},
): OperationPageView {
  return {
    blocks: data.blocks,
    highlightedBlockIds: data.highlightedBlockIds,
    icon: "seedling",
    pageTitle: data.title,
    leftPanel: (
      <SidePanel ariaLabel="产量预测参数" side="left">
        <StatusCard className="operation-card" icon="seedling" title="预测输入参数">
          <FieldRows rows={data.params} />
          <button className="primary-action" type="button">重新运行预测</button>
        </StatusCard>
        <StatusCard className="operation-card" icon="chart" title="影响因素权重">
          <ProgressRows rows={data.weights} />
        </StatusCard>
        <StatusCard className="operation-card" icon="shield" title="模型可信度">
          <div className="metric-strip">
            {data.confidence.map((item) => <strong key={item}>{item}</strong>)}
          </div>
        </StatusCard>
      </SidePanel>
    ),
    rightPanel: (
      <SidePanel ariaLabel="产量预测结论" side="right">
        <StatusCard className="operation-card" icon="seedling" title="预测结论">
          <div className="plan-metric">
            <span>预计总产量</span>
            <strong>{data.statistics.total}</strong>
          </div>
          <FieldRows rows={[["平均产量", data.statistics.average], ["平均品质", data.statistics.quality], ["较上周", data.statistics.change]]} />
          <button className="primary-action" type="button">生成预测报告</button>
        </StatusCard>
        <StatusCard className="operation-card conclusion-card" icon="alert" title="低产风险提示">
          <BulletList items={data.risks} />
        </StatusCard>
        <StatusCard className="operation-card" icon="seedling" title="管理建议">
          <BulletList items={data.advice} />
        </StatusCard>
      </SidePanel>
    ),
    bottomPanel: (
      <BottomTimeline
        activeId={options.activeTimelineId}
        nodes={data.workflow}
        onSelect={options.onTimelineSelect}
        title="预测流程"
      />
    ),
  };
}

function IrrigationDecisionView(
  data: IrrigationDecisionData = irrigationDecisionData,
  options: OperationPageOptions = {},
): OperationPageView {
  return {
    blocks: data.blocks,
    highlightedBlockIds: data.highlightedBlockIds,
    icon: "drop",
    pageTitle: data.title,
    leftPanel: (
      <SidePanel ariaLabel="灌溉决策参数" side="left">
        <StatusCard className="operation-card" icon="grid" title="处方生成参数">
          <FieldRows rows={data.params} />
        </StatusCard>
        <StatusCard className="operation-card" icon="drop" title="待灌溉地块队列">
          <div className="queue-list">
            {data.queue.map(([block, water, level], index) => (
              <div className="queue-row" key={block}>
                <b>{index + 1}</b>
                <strong>{block}</strong>
                <span>{water}</span>
                <em>{level}</em>
              </div>
            ))}
          </div>
        </StatusCard>
        <StatusCard className="operation-card" icon="seedling" title="节水评估">
          <div className="metric-strip metric-strip--stacked">
            {data.saving.map((item) => <strong key={item}>{item}</strong>)}
          </div>
        </StatusCard>
      </SidePanel>
    ),
    rightPanel: (
      <SidePanel ariaLabel="推荐灌溉方案" side="right">
        <StatusCard className="operation-card" icon="drop" title="推荐灌溉方案">
          <div className="plan-metric">
            <span>预计总灌水量</span>
            <strong>{data.plan.water}</strong>
          </div>
          <FieldRows rows={[["优先处理地块", data.plan.blocks], ["推荐开始", data.plan.start], ["预计时长", data.plan.duration], ["模拟流速", data.plan.rate], ["较均匀灌溉节水", data.plan.saving]]} />
          <button className="primary-action" type="button">确认并保存方案</button>
        </StatusCard>
        <StatusCard className="operation-card" icon="calendar" title="方案状态">
          <p className="operation-note">本轮仅保存推荐方案，不下发真实设备指令。</p>
          <p className="operation-note">API 口径：POST /irrigation/plans</p>
        </StatusCard>
      </SidePanel>
    ),
    bottomPanel: (
      <BottomTimeline
        activeId={options.activeTimelineId}
        nodes={data.workflow}
        onSelect={options.onTimelineSelect}
        title="方案流程"
      />
    ),
  };
}

export function getOperationPage(
  route: OperationRoute,
  data?: OperationPageData,
  options: OperationPageOptions = {},
): OperationPageView {
  if (route === "water-prediction") return WaterPredictionView(data as WaterPredictionData | undefined, options);
  if (route === "water-warning") return WaterWarningView(data as WaterWarningData | undefined, options);
  if (route === "yield-prediction") return YieldPredictionView(data as YieldPredictionData | undefined, options);
  if (route === "irrigation-decision") return IrrigationDecisionView(data as IrrigationDecisionData | undefined, options);
  return WaterPredictionView();
}
