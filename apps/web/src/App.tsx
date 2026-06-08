import { useEffect, useMemo, useState } from "react";

import { Dashboard } from "./features/dashboard/Dashboard";
import { farmSceneBlocks, type SceneToolId } from "./features/dashboard/sceneData";
import { FarmSceneStage } from "./features/farm-scene/FarmSceneStage";
import { PageLayout } from "./features/layout/PageLayout";
import type { AppRoute } from "./features/layout/routes";
import { loadOperationPage } from "./features/operation-pages/api";
import { getOperationPage } from "./features/operation-pages/OperationPages";
import {
  operationPageFallbacks,
  type OperationPageData,
  type OperationRoute,
} from "./features/operation-pages/pageData";

const routeSet = new Set<AppRoute>([
  "home",
  "water-prediction",
  "water-warning",
  "irrigation-decision",
  "yield-prediction",
]);

function getRouteFromHash(): AppRoute {
  if (typeof window === "undefined") return "home";
  const route = window.location.hash.replace(/^#\/?/, "") as AppRoute;
  return routeSet.has(route) ? route : "home";
}

function FeatureShell({
  onNavigate,
  route,
}: {
  onNavigate: (route: AppRoute) => void;
  route: OperationRoute;
}) {
  const [data, setData] = useState<OperationPageData>(() => operationPageFallbacks[route] as OperationPageData);
  const [dataError, setDataError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"api" | "fallback">("fallback");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTimelineId, setActiveTimelineId] = useState<string | undefined>(undefined);
  const [selectedBlockId, setSelectedBlockId] = useState(
    () => operationPageFallbacks[route].highlightedBlockIds[0] ?? "B15",
  );
  const page = useMemo(
    () =>
      getOperationPage(route, data, {
        activeTimelineId,
        onTimelineSelect: setActiveTimelineId,
        selectedBlockId,
      }),
    [activeTimelineId, data, route, selectedBlockId],
  );
  const [activeTool, setActiveTool] = useState<SceneToolId>("layers");
  const [panelsOpen, setPanelsOpen] = useState(true);

  const selectedBlock =
    page.blocks.find((block) => block.blockId === selectedBlockId) ??
    page.blocks[0] ??
    farmSceneBlocks[0];

  useEffect(() => {
    if (!page.blocks.some((block) => block.blockId === selectedBlockId)) {
      setSelectedBlockId(page.highlightedBlockIds[0] ?? page.blocks[0]?.blockId ?? "B15");
    }
  }, [page.blocks, page.highlightedBlockIds, selectedBlockId]);

  useEffect(() => {
    if (!activeTimelineId) return;
    setSelectedBlockId(page.highlightedBlockIds[0] ?? page.blocks[0]?.blockId ?? "B15");
  }, [activeTimelineId, page.blocks, page.highlightedBlockIds]);

  useEffect(() => {
    let cancelled = false;
    setData(operationPageFallbacks[route] as OperationPageData);
    setDataError(null);
    setDataSource("fallback");
    setIsLoading(true);
    setActiveTimelineId(undefined);
    setSelectedBlockId(operationPageFallbacks[route].highlightedBlockIds[0] ?? "B15");

    void loadOperationPage(route).then((result) => {
      if (cancelled) return;
      setData(result.data as OperationPageData);
      setDataError(result.error);
      setDataSource(result.source);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [route]);

  return (
    <PageLayout
      activeRoute={route}
      isExpanded={panelsOpen}
      leftPanel={page.leftPanel}
      onNavigate={onNavigate}
      pageIcon={page.icon}
      pageTitle={page.pageTitle}
      rightPanel={page.rightPanel}
    >
      <FarmSceneStage
        activeTool={activeTool}
        blocks={page.blocks}
        highlightedBlockIds={page.highlightedBlockIds}
        onCollapse={() => setPanelsOpen(false)}
        onExpand={() => setPanelsOpen(true)}
        onSelectBlock={setSelectedBlockId}
        onSelectTool={setActiveTool}
        selectedBlockId={selectedBlock.blockId}
      />
      <DataStateBadge
        blockCount={page.blocks.length}
        error={dataError}
        isLoading={isLoading}
        source={dataSource}
      />
      {page.centerOverlay}
      {page.bottomPanel}
    </PageLayout>
  );
}

function DataStateBadge({
  blockCount,
  error,
  isLoading,
  source,
}: {
  blockCount: number;
  error: string | null;
  isLoading: boolean;
  source: "api" | "fallback";
}) {
  if (isLoading) {
    return <div className="data-state-badge data-state-badge--loading">数据加载中...</div>;
  }

  if (blockCount === 0) {
    return <div className="data-state-badge data-state-badge--empty">暂无地块数据</div>;
  }

  if (source === "fallback") {
    return (
      <div className="data-state-badge data-state-badge--warning">
        API 未就绪，使用本地示例数据{error ? `：${error}` : ""}
      </div>
    );
  }

  return <div className="data-state-badge data-state-badge--success">API 数据已同步</div>;
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => getRouteFromHash());

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (nextRoute: AppRoute) => {
    window.history.pushState(null, "", `#/${nextRoute}`);
    setRoute(nextRoute);
  };

  if (route === "home") {
    return <Dashboard onNavigate={navigate} />;
  }

  return <FeatureShell route={route} onNavigate={navigate} />;
}
