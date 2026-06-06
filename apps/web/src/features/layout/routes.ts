import type { IconName } from "../shared/Icon";

export type AppRoute =
  | "home"
  | "water-prediction"
  | "water-warning"
  | "irrigation-decision"
  | "yield-prediction";

export type AppNavItem = {
  icon: IconName;
  label: string;
  route: AppRoute;
};

export const appNavItems: readonly AppNavItem[] = [
  { icon: "home", label: "返回主页", route: "home" },
  { icon: "drop", label: "水分预测", route: "water-prediction" },
  { icon: "bell", label: "水分预警", route: "water-warning" },
  { icon: "tower", label: "灌溉决策", route: "irrigation-decision" },
  { icon: "leaf", label: "产量预测", route: "yield-prediction" },
];
