# AGENTS.md

## Project Overview

This project is a smart agriculture soil-moisture prediction and irrigation decision platform for Weishan Demonstration Base Area A.

The product centers on a 3D digital-twin farm map, moisture prediction, moisture alerting, irrigation decision simulation, yield visualization, export workflows, device/data anomaly handling, and role-based user access.

Current monorepo structure:

```text
apps/
  web/      React + Vite + TypeScript frontend
  api/      uv + FastAPI backend
packages/
  shared/   shared TypeScript API types
docs/       local product/API/design references, intentionally gitignored
```

Read `docs/` when it exists locally, but do not assume it is committed. Durable implementation rules should live in this file or in tracked source code.

## Product Rules

- The main screen is the actual farm operation interface, not a marketing landing page.
- The farm map has 18 fixed blocks: `B01` through `B18`.
- All map-like API responses must return all 18 blocks unless the endpoint explicitly documents otherwise.
- `fieldId` is legacy compatibility only. New frontend and backend code should use `blockId`, `blockNo`, and `blockName`.
- Map coordinates use `grid.row` and `grid.col`; the origin is the top-left of the logical map.
- The frontend must not recalculate business values that the backend already returns. Use API-provided `displayValue`, `displayUnit`, `heightValue`, `colorToken`, and `colorHex` as the single source of truth.
- The global timeline covers current time through the next 72 hours. Timeline changes must keep the 3D map, panels, charts, and recommendations in the same snapshot state.
- Current-round irrigation is simulation and planning only. Do not implement real hardware command dispatch unless the user explicitly expands scope.

## Core Modules

- `3D Digital Twin`: render block columns, labels, selected states, recommendation highlights, and responsive map views.
- `Moisture Prediction`: show historical and predicted moisture curves, threshold bands, rainfall-delay analysis, model selection, upload support, and prediction task status.
- `Moisture Alerting`: show risk snapshots, severe-risk counts, risk source analysis, key risk blocks, handling suggestions, and risk evolution.
- `Irrigation Decision`: generate prescriptions, recommend water volume and timing, save plans, start frontend/backend simulation tasks, and show risk-reduction results.
- `Yield Visualization`: show yield grade maps, factor weights, model confidence, high/low yield blocks, statistics, suggestions, and report/export actions.
- `Export`: create async export tasks and poll for file availability.
- `Auth and Permissions`: support login/logout/refresh token, admin user management, normal user data view/prediction/export flows.
- `Device/Data Anomalies`: show sensor offline, missing data, irrigation-device offline, and related logs; use fallback estimates where documented.

## API Rules

- API base path is `/api/v1`.
- Follow the common response envelope:

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2026-05-15T22:30:00+08:00",
  "traceId": "req_20260515223000001"
}
```

- Error responses use the same envelope with `data: null`.
- Use ISO 8601 timestamps and default to `Asia/Shanghai`.
- Use schema-first Pydantic models for request and response bodies.
- Validate all user input at API boundaries, especially auth, uploads, IDs, pagination, and simulation parameters.
- Protected routes require `Authorization: Bearer <access_token>`.
- Permission checks should follow the documented permissions: `data:view`, `prediction:analyze`, `irrigation:plan`, `irrigation:view`, `export:result`, `data:manage`, `device:manage`, and `user:manage`.
- Async workflows use task resources and polling. Status values are `pending`, `running`, `completed`, `failed`, and `cancelled`.
- Long-running prediction, report, simulation, and export actions should return task IDs quickly instead of blocking the request.
- Do not hardcode secrets, tokens, device credentials, or external service keys. Read them from environment variables.

## Backend Rules

- Backend stack: uv + FastAPI.
- Source root is `apps/api/src`.
- Keep routers under `agriculture_api/api/v1`.
- Keep application config under `agriculture_api/core`.
- Keep API schemas under `agriculture_api/schemas`.
- Prefer small routers and focused service modules over large endpoint files.
- Preserve raw source data. If a future `raw/` directory exists, never mutate files in it; write cleaned or derived data elsewhere.
- Prediction/model code should record MAE/RMSE when training is introduced.
- If multiple model-depth variants are loaded, use cache-aware loading to avoid memory pressure.
- For upload endpoints, validate file type, schema, and row content before persistence or prediction.
- For simulations, keep current scope as prediction of irrigation effect and plan state changes, not physical actuator control.

## Frontend Rules

- Frontend stack: React + Vite + TypeScript.
- Source root is `apps/web/src`.
- Feature code belongs under `apps/web/src/features/<domain>`.
- Shared browser utilities belong under `apps/web/src/lib`.
- Shared contract types should come from `@agriculture/shared` when available.
- Build the working dashboard as the first screen.
- Important expected components include `Farm3DMap`, `BlockColumn`, `TimeSlider`, prediction charts, alert panels, irrigation prescription panels, and yield summary panels.
- Keep timeline state, selected block state, and current snapshot state synchronized. Use a clear shared state boundary when the workflow grows.
- Avoid deriving risk color, display value, or block height in the browser if the API returns those fields.
- Keep 3D and dense dashboard UI responsive. Labels must not overlap incoherently on desktop or mobile.
- Use the documented color tokens consistently: `blue`, `green`, `yellow`, `orange`, `red`, plus API enum values such as `success`, `cyan`, `sky`, `danger`, and `muted` where returned.
- Debounce high-frequency timeline/map interactions before triggering expensive redraws or network requests.

## Shared Package Rules

- `packages/shared` is for frontend-consumed API types and stable contract helpers.
- Keep shared types aligned with backend Pydantic schemas when API shapes change.
- Prefer adding types here instead of duplicating ad hoc TypeScript types across frontend features.

## Testing And Verification

- Backend tests live under `apps/api/tests`.
- Frontend tests should live near the relevant feature or under an explicit test folder when introduced.
- For backend changes, run:

```bash
cd apps/api
uv run pytest
```

- For frontend changes, run:

```bash
npm run test:web
npm run build:web
```

- For API contract changes, verify that response envelopes, permissions, and async status behavior match this file and the local docs.
- For visible frontend changes, verify the page in a browser at desktop and mobile widths.

## Development Workflow

- Contract first: when changing API behavior, update schema/types before wiring feature UI.
- Keep business logic out of React components when it belongs to API/service code.
- Keep frontend display text and backend enum values consistent with the Chinese product copy in the local docs.
- Use conventional commits when commits are requested: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `perf:`, or `ci:`.
- Record major architecture decisions in the existing project docs structure if the user asks for documentation updates. Since `docs/` is ignored, ask before creating a new tracked top-level documentation file.
