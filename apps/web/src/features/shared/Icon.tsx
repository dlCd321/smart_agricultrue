import type { BottomModule } from "../dashboard/dashboardData";
import type { SceneToolId } from "../dashboard/sceneData";

export type IconName =
  | BottomModule["icon"]
  | SceneToolId
  | "alert"
  | "calendar"
  | "chart"
  | "chevron"
  | "cloud"
  | "grid"
  | "info"
  | "rain"
  | "seedling"
  | "shield"
  | "user"
  | "settings";

export function Icon({ name, className }: { name: IconName; className?: string }) {
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
