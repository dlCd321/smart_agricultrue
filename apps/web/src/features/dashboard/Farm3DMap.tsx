import { useEffect, useRef, useState, type RefObject } from "react";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

import type {
  FarmBlockSceneDatum,
  FarmColorToken,
  SceneToolId,
} from "./sceneData";

const PLATFORM_TOP_Y = 0;

const BLOCK_WIDTH = 2.9;
const BLOCK_DEPTH = 2.35;
const BLOCK_HEIGHT = 0.16;

const BLOCK_SPACING_X = 3.75;
const BLOCK_SPACING_Z = 3.75;
const BLOCK_ROW_OFFSET_X = 0.35;

const GRID_CENTER_COL = 1.5;
const GRID_CENTER_ROW = 1.5;
const GRID_Z_OFFSET = 0;

const COLUMN_MIN_HEIGHT = 1.1;
const COLUMN_HEIGHT_RANGE = 3.8;

const COLUMN_MODEL_WIDTH = 1.55;
const COLUMN_MODEL_DEPTH = 1.55;
const COLUMN_HEIGHT_SCALE = 1.12;
const COLUMN_MODEL_PATH = "/assets/column-outlined.glb";

const GRID_OFFSET_X = 0;
const GRID_OFFSET_Z = 4;

const BLOCK_SURFACE_COLORS: Record<FarmColorToken, string> = {
  blue: "#8fd2ff",
  green: "#9edc8c",
  yellow: "#d8d18b",
  orange: "#d9a079",
  red: "#d7b08b",
  danger: "#d7b08b",
  muted: "#d8dee8",
  cyan: "#8fd2ff",
  sky: "#8fd2ff",
  success: "#9edc8c",
};

const COLUMN_FILL_COLORS: Record<FarmColorToken, string> = {
  blue: "#0076d9",
  green: "#009b4e",
  yellow: "#d59a00",
  orange: "#e9691d",
  red: "#d92c1f",
  danger: "#d92c1f",
  muted: "#94a3b8",
  cyan: "#0891b2",
  sky: "#0284c7",
  success: "#009b4e",
};

const COLUMN_EMISSIVE_COLORS: Record<FarmColorToken, string> = {
  blue: "#10a9ff",
  green: "#23d36b",
  yellow: "#ffc928",
  orange: "#ff8a2b",
  red: "#ff5038",
  danger: "#ff5038",
  muted: "#cbd5e1",
  cyan: "#22d3ee",
  sky: "#38bdf8",
  success: "#23d36b",
};

const COLUMN_OUTLINE_COLORS: Record<FarmColorToken, string> = {
  blue: "#aee6ff",
  green: "#a9f5c8",
  yellow: "#ffdf66",
  orange: "#ffbf7a",
  red: "#ffad9f",
  danger: "#ffad9f",
  muted: "#e2e8f0",
  cyan: "#a5f3fc",
  sky: "#bae6fd",
  success: "#a9f5c8",
};

const COLUMN_RIM_COLORS: Record<FarmColorToken, string> = {
  blue: "#004b94",
  green: "#075f35",
  yellow: "#7a5400",
  orange: "#8a340d",
  red: "#8b160f",
  danger: "#8b160f",
  muted: "#64748b",
  cyan: "#155e75",
  sky: "#075985",
  success: "#075f35",
};

type BlockVisuals = {
  block: FarmBlockSceneDatum;
  accent: THREE.Mesh;
  column: THREE.Group;
  columnHeight: number;
  ground: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  hitArea: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
  label: CSS2DObject;
  labelBody: HTMLSpanElement;
  labelRoot: HTMLDivElement;
};

type TooltipState = {
  block: FarmBlockSceneDatum;
  x: number;
  y: number;
} | null;

type SceneContext = {
  blockVisuals: Map<string, BlockVisuals>;
  camera: THREE.OrthographicCamera;
  columnModelTemplate: THREE.Object3D | null;
  frameId: number | null;
  labelRenderer: CSS2DRenderer;
  raycaster: THREE.Raycaster;
  renderer: THREE.WebGLRenderer;
  resizeObserver: ResizeObserver | null;
  scene: THREE.Scene;
  selectables: THREE.Object3D[];
};

function requestRender(contextRef: RefObject<SceneContext | null>) {
  const context = contextRef.current;

  if (!context || context.frameId !== null) return;

  context.frameId = window.requestAnimationFrame(() => {
    const latestContext = contextRef.current;
    if (!latestContext) return;

    latestContext.frameId = null;
    latestContext.renderer.render(latestContext.scene, latestContext.camera);
    latestContext.labelRenderer.render(
      latestContext.scene,
      latestContext.camera,
    );
  });
}

function getWorldPositionForBlock(block: FarmBlockSceneDatum) {
  const offsetX = (block.grid.row - GRID_CENTER_ROW) * BLOCK_ROW_OFFSET_X;

  return {
    x: (block.grid.col - GRID_CENTER_COL) * BLOCK_SPACING_X + offsetX + GRID_OFFSET_X,
    z:
      (block.grid.row - GRID_CENTER_ROW) * BLOCK_SPACING_Z +
      GRID_Z_OFFSET + GRID_OFFSET_Z,
  };
}

function createRoundedBox(width: number, height: number, depth: number) {
  return new THREE.BoxGeometry(width, height, depth, 5, 1, 5);
}

function setCameraFrustum(
  camera: THREE.OrthographicCamera,
  width: number,
  height: number,
) {
  const aspect = width / Math.max(height, 1);
  const verticalSize = 8;

  camera.left = -verticalSize * aspect;
  camera.right = verticalSize * aspect;
  camera.top = verticalSize;
  camera.bottom = -verticalSize;
  camera.near = 0.1;
  camera.far = 120;
  camera.updateProjectionMatrix();
}

function buildLabel(block: FarmBlockSceneDatum) {
  const root = document.createElement("div");
  root.className = "farm3d-label";

  const title = document.createElement("strong");
  title.textContent = String(Number(block.blockId.replace("B", "")));

  const value = document.createElement("span");
  value.textContent = `${block.displayValue ?? block.moisture}${block.displayUnit ?? "%"}`;

  root.append(title, value);

  return { root, value };
}

function buildStaticScene(scene: THREE.Scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.6);

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
  sunLight.position.set(10, 20, 8);

  const fillLight = new THREE.DirectionalLight(0xb8d4ff, 0.7);
  fillLight.position.set(-8, 8, -10);

  scene.add(ambientLight, sunLight, fillLight);
}

function fitModelToColumn(
  model: THREE.Object3D,
  targetWidth: number,
  targetHeight: number,
  targetDepth: number,
) {
  const bounds = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  bounds.getSize(size);

  if (size.x <= 0 || size.y <= 0 || size.z <= 0) return;

  model.scale.set(
    targetWidth / size.x,
    targetHeight / size.y,
    targetDepth / size.z,
  );
  model.updateMatrixWorld(true);

  const scaledBounds = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  const scaledSize = new THREE.Vector3();

  scaledBounds.getCenter(center);
  scaledBounds.getSize(scaledSize);

  model.position.set(
    model.position.x - center.x,
    model.position.y - (scaledBounds.min.y + scaledSize.y / 2),
    model.position.z - center.z,
  );
}

function customizeColumnModel(
  model: THREE.Object3D,
  block: FarmBlockSceneDatum,
) {
  const fillColor = new THREE.Color(COLUMN_FILL_COLORS[block.colorToken]);
  const emissiveColor = new THREE.Color(
    COLUMN_EMISSIVE_COLORS[block.colorToken],
  );

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const childName = child.name.toLowerCase();
    if (
      childName.includes("dashboard outline") ||
      childName.includes("inner glow grid") ||
      childName.includes("top sheen") ||
      childName.includes("base contact")
    ) {
      child.visible = false;
      return;
    }

    const sourceMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    child.material = sourceMaterials.map((material) => {
      const nextMaterial = material.clone();

      if (
        nextMaterial instanceof THREE.MeshStandardMaterial ||
        nextMaterial instanceof THREE.MeshPhysicalMaterial
      ) {
        nextMaterial.color.copy(fillColor);
        nextMaterial.emissive.copy(emissiveColor);
        nextMaterial.emissiveIntensity = 0.07;
        nextMaterial.opacity = 0.92;
        nextMaterial.transparent = true;
        nextMaterial.depthWrite = true;
        nextMaterial.roughness = 0.74;
      }

      if (nextMaterial instanceof THREE.MeshBasicMaterial) {
        nextMaterial.color.copy(fillColor);
        nextMaterial.opacity = 0.6;
        nextMaterial.transparent = true;
        nextMaterial.depthWrite = true;
      }

      return nextMaterial;
    });

    child.renderOrder = 2;
  });
}

function buildColumnOverlay(
  width: number,
  height: number,
  depth: number,
  colorToken: FarmColorToken,
) {
  const overlay = new THREE.Group();
  const fillColor = COLUMN_FILL_COLORS[colorToken];
  const outlineColor = COLUMN_OUTLINE_COLORS[colorToken];
  const glowColor = COLUMN_EMISSIVE_COLORS[colorToken];
  const rimColor = COLUMN_RIM_COLORS[colorToken];

  const shell = new THREE.Mesh(
    createRoundedBox(width * 0.92, height * 0.98, depth * 0.92),
    new THREE.MeshPhysicalMaterial({
      color: fillColor,
      emissive: glowColor,
      emissiveIntensity: 0.05,
      metalness: 0,
      opacity: 0.86,
      roughness: 0.76,
      transparent: true,
      transmission: 0,
      depthWrite: true,
    }),
  );
  shell.renderOrder = 2;

  const edgePoints = [
    new THREE.Vector3(-width / 2, height / 2, -depth / 2),
    new THREE.Vector3(width / 2, height / 2, -depth / 2),
    new THREE.Vector3(width / 2, height / 2, -depth / 2),
    new THREE.Vector3(width / 2, height / 2, depth / 2),
    new THREE.Vector3(width / 2, height / 2, depth / 2),
    new THREE.Vector3(-width / 2, height / 2, depth / 2),
    new THREE.Vector3(-width / 2, height / 2, depth / 2),
    new THREE.Vector3(-width / 2, height / 2, -depth / 2),
    new THREE.Vector3(-width / 2, -height / 2, -depth / 2),
    new THREE.Vector3(-width / 2, height / 2, -depth / 2),
    new THREE.Vector3(width / 2, -height / 2, -depth / 2),
    new THREE.Vector3(width / 2, height / 2, -depth / 2),
    new THREE.Vector3(width / 2, -height / 2, depth / 2),
    new THREE.Vector3(width / 2, height / 2, depth / 2),
    new THREE.Vector3(-width / 2, -height / 2, depth / 2),
    new THREE.Vector3(-width / 2, height / 2, depth / 2),
  ];
  const edges = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(edgePoints),
    new THREE.LineBasicMaterial({
      color: rimColor,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    }),
  );
  edges.renderOrder = 4;

  const highlightPoints = [
    new THREE.Vector3(-width / 2 + 0.04, height / 2 + 0.006, -depth / 2),
    new THREE.Vector3(width / 2 - 0.04, height / 2 + 0.006, -depth / 2),
    new THREE.Vector3(-width / 2, -height / 2 + 0.08, -depth / 2 - 0.02),
    new THREE.Vector3(-width / 2, height / 2 - 0.04, -depth / 2 - 0.02),
  ];
  const highlights = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(highlightPoints),
    new THREE.LineBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
    }),
  );
  highlights.renderOrder = 5;

  const sideShade = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.92, height * 0.94),
    new THREE.MeshBasicMaterial({
      color: rimColor,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  sideShade.position.z = depth / 2 + 0.006;
  sideShade.renderOrder = 3;

  const faceLineMaterial = new THREE.LineBasicMaterial({
    color: outlineColor,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });
  const faceLineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -height / 2 + 0.08, -depth / 2 - 0.018),
    new THREE.Vector3(0, height / 2 - 0.08, -depth / 2 - 0.018),
    new THREE.Vector3(0, -height / 2 + 0.08, depth / 2 + 0.018),
    new THREE.Vector3(0, height / 2 - 0.08, depth / 2 + 0.018),
    new THREE.Vector3(-width / 2 - 0.018, -height / 2 + 0.08, 0),
    new THREE.Vector3(-width / 2 - 0.018, height / 2 - 0.08, 0),
    new THREE.Vector3(width / 2 + 0.018, -height / 2 + 0.08, 0),
    new THREE.Vector3(width / 2 + 0.018, height / 2 - 0.08, 0),
  ]);
  const faceLines = new THREE.LineSegments(faceLineGeometry, faceLineMaterial);
  faceLines.renderOrder = 5;

  const topSheen = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.78, depth * 0.78),
    new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  topSheen.rotation.x = -Math.PI / 2;
  topSheen.position.y = height / 2 + 0.012;
  topSheen.renderOrder = 3;

  const baseGlow = new THREE.Mesh(
    new THREE.TorusGeometry(Math.min(width, depth) * 0.48, 0.026, 8, 52),
    new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    }),
  );
  baseGlow.rotation.x = Math.PI / 2;
  baseGlow.position.y = -height / 2 + 0.045;
  baseGlow.renderOrder = 1;

  overlay.add(baseGlow, shell, sideShade, edges, faceLines, highlights, topSheen);

  return overlay;
}

function getColumnHeight(block: FarmBlockSceneDatum) {
  return COLUMN_MIN_HEIGHT + (block.heightValue / 100) * COLUMN_HEIGHT_RANGE;
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  const materials = Array.isArray(material) ? material : [material];
  for (const item of materials) {
    item.dispose();
  }
}

function clearColumn(column: THREE.Group) {
  column.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    disposeMaterial(child.material);
  });
  column.clear();
}

function renderColumnVisual(
  visuals: BlockVisuals,
  modelTemplate: THREE.Object3D | null,
) {
  clearColumn(visuals.column);

  const targetHeight = visuals.columnHeight * COLUMN_HEIGHT_SCALE;

  if (modelTemplate) {
    const model = modelTemplate.clone(true);

    fitModelToColumn(
      model,
      COLUMN_MODEL_WIDTH,
      targetHeight,
      COLUMN_MODEL_DEPTH,
    );

    customizeColumnModel(model, visuals.block);
    visuals.column.add(model);
  }

  visuals.column.add(
    buildColumnOverlay(
      COLUMN_MODEL_WIDTH,
      targetHeight,
      COLUMN_MODEL_DEPTH,
      visuals.block.colorToken,
    ),
  );
}

function syncBlockVisuals(
  context: SceneContext,
  blocks: readonly FarmBlockSceneDatum[],
) {
  for (const block of blocks) {
    const visuals = context.blockVisuals.get(block.blockId);
    if (!visuals) continue;

    visuals.block = block;
    visuals.columnHeight = getColumnHeight(block);
    visuals.ground.material.color.set(BLOCK_SURFACE_COLORS[block.colorToken]);
    visuals.hitArea.geometry.dispose();
    visuals.hitArea.geometry = new THREE.BoxGeometry(
      Math.max(BLOCK_WIDTH, COLUMN_MODEL_WIDTH),
      visuals.columnHeight + 0.8,
      Math.max(BLOCK_DEPTH, COLUMN_MODEL_DEPTH),
    );
    renderColumnVisual(visuals, context.columnModelTemplate);
  }
}

/** Traverse a column Group and set emissiveIntensity on all standard meshes. */
function setColumnEmissive(column: THREE.Group, intensity: number) {
  column.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of mats) {
      if (
        mat instanceof THREE.MeshStandardMaterial ||
        mat instanceof THREE.MeshPhysicalMaterial
      ) {
        mat.emissiveIntensity = intensity;
      }
    }
  });
}

function applyVisualState(
  context: SceneContext,
  _activeTool: SceneToolId,
  highlightedIds: ReadonlySet<string>,
  hoveredBlockId: string | null,
  selectedBlockId: string,
) {
  for (const visuals of context.blockVisuals.values()) {
    const isHovered = hoveredBlockId === visuals.block.blockId;
    const isSelected = selectedBlockId === visuals.block.blockId;
    const isHighlighted = highlightedIds.has(visuals.block.blockId);
    const lift = isSelected ? 0.1 : isHovered ? 0.05 : 0;

    visuals.ground.position.y = PLATFORM_TOP_Y + BLOCK_HEIGHT / 2 + lift;
    visuals.ground.material.color.set(
      isSelected
        ? "#d5f0df"
        : BLOCK_SURFACE_COLORS[visuals.block.colorToken],
    );

    visuals.column.position.y =
      visuals.ground.position.y +
      BLOCK_HEIGHT / 2 +
      visuals.columnHeight / 2;

    visuals.column.scale.x = isSelected ? 1.06 : isHovered ? 1.03 : 1;
    visuals.column.scale.z = visuals.column.scale.x;
    // Brighten emissive on hover/select so the column visibly glows.
    setColumnEmissive(
      visuals.column,
      isSelected ? 0.36 : isHovered ? 0.26 : 0.07,
    );

    visuals.accent.visible = isHighlighted || isSelected || isHovered;
    visuals.accent.position.y = visuals.ground.position.y + 0.01;
    (visuals.accent.material as THREE.MeshBasicMaterial).opacity = isSelected
      ? 0.96
      : isHovered
        ? 0.52
        : 0.62;

    visuals.hitArea.position.y =
      visuals.ground.position.y +
      BLOCK_HEIGHT / 2 +
      visuals.columnHeight / 2;

    visuals.label.position.y =
      visuals.column.position.y + visuals.columnHeight * 0.22;
    visuals.label.position.z = visuals.block.grid.row >= 2
      ? visuals.column.position.z + 0.36
      : visuals.column.position.z + 0.52;

    visuals.labelRoot.classList.toggle("is-selected", isSelected);
    visuals.labelRoot.classList.toggle("is-hovered", isHovered);
    visuals.labelRoot.classList.toggle("is-highlighted", isHighlighted);

    visuals.labelBody.textContent = `${visuals.block.displayValue ?? visuals.block.moisture}${visuals.block.displayUnit ?? "%"}`;
  }
}

function getIntersectedBlockId(
  camera: THREE.Camera,
  pointer: THREE.Vector2,
  raycaster: THREE.Raycaster,
  selectables: THREE.Object3D[],
  clientX: number,
  clientY: number,
  target: HTMLElement,
) {
  const bounds = target.getBoundingClientRect();

  pointer.x = ((clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((clientY - bounds.top) / bounds.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const hit = raycaster
    .intersectObjects(selectables, false)
    .find((item) => item.object.userData.blockId);

  return typeof hit?.object.userData.blockId === "string"
    ? hit.object.userData.blockId
    : null;
}

const RISK_LABELS: Record<string, string> = {
  low: "正常",
  medium: "注意",
  high: "危险",
};

const RISK_COLORS: Record<string, string> = {
  low: "#34d399",
  medium: "#fbbf24",
  high: "#f87171",
};

function BlockTooltip({ tooltip }: { tooltip: TooltipState }) {
  if (!tooltip) return null;
  const { block, x, y } = tooltip;
  const riskLabel = RISK_LABELS[block.risk] ?? block.risk;
  const riskColor = RISK_COLORS[block.risk] ?? "#94a3b8";

  return (
    <div
      className="farm3d-tooltip"
      style={{ left: x, top: y }}
      aria-hidden="true"
    >
      <div className="farm3d-tooltip__header">
        <span className="farm3d-tooltip__id">{block.blockId}</span>
        <span className="farm3d-tooltip__name">{block.blockName}</span>
      </div>
      <div className="farm3d-tooltip__rows">
        <div className="farm3d-tooltip__row">
          <span className="farm3d-tooltip__label">展示值</span>
          <span className="farm3d-tooltip__value">{block.displayValue ?? block.moisture}{block.displayUnit ?? "%"}</span>
        </div>
        <div className="farm3d-tooltip__row">
          <span className="farm3d-tooltip__label">风险等级</span>
          <span className="farm3d-tooltip__value" style={{ color: riskColor }}>
            {riskLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Farm3DMap({
  activeTool,
  blocks,
  highlightedBlockIds,
  onSelectBlock,
  selectedBlockId,
}: {
  activeTool: SceneToolId;
  blocks: readonly FarmBlockSceneDatum[];
  highlightedBlockIds: readonly string[];
  onSelectBlock: (blockId: string) => void;
  selectedBlockId: string;
}) {
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const labelHostRef = useRef<HTMLDivElement | null>(null);

  const contextRef = useRef<SceneContext | null>(null);
  const hoveredBlockIdRef = useRef<string | null>(null);

  const activeToolRef = useRef(activeTool);
  const highlightedIdsRef = useRef(new Set(highlightedBlockIds));
  const initialBlocksRef = useRef(blocks);
  const onSelectBlockRef = useRef(onSelectBlock);
  const selectedBlockIdRef = useRef(selectedBlockId);
  const blocksMapRef = useRef<Map<string, FarmBlockSceneDatum>>(new Map());

  const [tooltip, setTooltip] = useState<TooltipState>(null);

  useEffect(() => {
    onSelectBlockRef.current = onSelectBlock;
  }, [onSelectBlock]);

  useEffect(() => {
    const canvasHost = canvasHostRef.current;
    const labelHost = labelHostRef.current;
    const initialBlocks = initialBlocksRef.current;

    if (!canvasHost || !labelHost) return undefined;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera();
    camera.position.set(8, 6, 12);
    camera.lookAt(0, 0, 4.3);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "farm3d-canvas";
    canvasHost.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.domElement.className = "farm3d-label-layer";
    labelHost.appendChild(labelRenderer.domElement);

    buildStaticScene(scene);

    const blockVisuals = new Map<string, BlockVisuals>();
    const selectables: THREE.Object3D[] = [];

    // Build a quick lookup so pointer-move can find block data by id.
    blocksMapRef.current = new Map(initialBlocks.map((b) => [b.blockId, b]));

    for (const block of initialBlocks) {
      const world = getWorldPositionForBlock(block);

      const ground = new THREE.Mesh(
        createRoundedBox(BLOCK_WIDTH, BLOCK_HEIGHT, BLOCK_DEPTH),
        new THREE.MeshStandardMaterial({
          color: BLOCK_SURFACE_COLORS[block.colorToken],
          roughness: 0.9,
          transparent: true,
          opacity: 0,
        }),
      );

      ground.position.set(
        world.x,
        PLATFORM_TOP_Y + BLOCK_HEIGHT / 2,
        world.z,
      );

      const columnHeight = getColumnHeight(block);

      const column = new THREE.Group();

      column.position.set(
        world.x,
        ground.position.y + BLOCK_HEIGHT / 2 + columnHeight / 2,
        world.z,
      );

      const accent = new THREE.Mesh(
        new THREE.TorusGeometry(0.98, 0.08, 12, 32),
        new THREE.MeshBasicMaterial({
          color: "#27ae60",
          transparent: true,
          opacity: 0.65,
        }),
      );

      accent.rotation.x = Math.PI / 2;
      accent.position.set(world.x, PLATFORM_TOP_Y + 0.1, world.z);
      accent.visible = false;

      const hitArea = new THREE.Mesh(
        new THREE.BoxGeometry(
          Math.max(BLOCK_WIDTH, COLUMN_MODEL_WIDTH),
          columnHeight + 0.8,
          Math.max(BLOCK_DEPTH, COLUMN_MODEL_DEPTH),
        ),
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );

      hitArea.position.set(
        world.x,
        ground.position.y + BLOCK_HEIGHT / 2 + columnHeight / 2,
        world.z,
      );

      hitArea.userData.blockId = block.blockId;

      const { root, value } = buildLabel(block);
      const label = new CSS2DObject(root);

      label.position.set(
        world.x,
        column.position.y + columnHeight * 0.22,
        world.z + 0.52,
      );

      scene.add(ground, column, accent, hitArea, label);
      selectables.push(hitArea);

      const visuals: BlockVisuals = {
        accent,
        block,
        column,
        columnHeight,
        ground,
        hitArea,
        label,
        labelBody: value,
        labelRoot: root,
      };

      renderColumnVisual(visuals, null);
      blockVisuals.set(block.blockId, visuals);
    }

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    const resize = () => {
      const width = canvasHost.clientWidth;
      const height = canvasHost.clientHeight;

      renderer.setSize(width, height, false);
      labelRenderer.setSize(width, height);
      setCameraFrustum(camera, width, height);
      requestRender(contextRef);
    };

    const onPointerMove = (event: PointerEvent) => {
      const blockId = getIntersectedBlockId(
        camera,
        pointer,
        raycaster,
        selectables,
        event.clientX,
        event.clientY,
        canvasHost,
      );

      // Update tooltip position every move when hovering a block.
      if (blockId) {
        const bounds = canvasHost.getBoundingClientRect();
        const relX = event.clientX - bounds.left;
        const relY = event.clientY - bounds.top;
        const block = blocksMapRef.current.get(blockId);
        if (block) {
          setTooltip({ block, x: relX, y: relY });
        }
      } else {
        setTooltip(null);
      }

      if (hoveredBlockIdRef.current === blockId) return;

      hoveredBlockIdRef.current = blockId;
      canvasHost.style.cursor = blockId ? "pointer" : "default";

      const context = contextRef.current;
      if (!context) return;

      applyVisualState(
        context,
        activeToolRef.current,
        highlightedIdsRef.current,
        hoveredBlockIdRef.current,
        selectedBlockIdRef.current,
      );

      requestRender(contextRef);
    };

    const onPointerLeave = () => {
      hoveredBlockIdRef.current = null;
      canvasHost.style.cursor = "default";
      setTooltip(null);

      const context = contextRef.current;
      if (!context) return;

      applyVisualState(
        context,
        activeToolRef.current,
        highlightedIdsRef.current,
        hoveredBlockIdRef.current,
        selectedBlockIdRef.current,
      );

      requestRender(contextRef);
    };

    const onClick = (event: MouseEvent) => {
      const blockId = getIntersectedBlockId(
        camera,
        pointer,
        raycaster,
        selectables,
        event.clientX,
        event.clientY,
        canvasHost,
      );

      if (blockId) {
        onSelectBlockRef.current(blockId);
      }
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            resize();
          });

    if (resizeObserver) {
      resizeObserver.observe(canvasHost);
    } else {
      window.addEventListener("resize", resize);
    }

    canvasHost.addEventListener("pointermove", onPointerMove);
    canvasHost.addEventListener("pointerleave", onPointerLeave);
    canvasHost.addEventListener("click", onClick);

    contextRef.current = {
      blockVisuals,
      camera,
      columnModelTemplate: null,
      frameId: null,
      labelRenderer,
      raycaster,
      renderer,
      resizeObserver,
      scene,
      selectables,
    };

    const readyContext = contextRef.current;

    applyVisualState(
      readyContext,
      activeToolRef.current,
      highlightedIdsRef.current,
      null,
      selectedBlockIdRef.current,
    );

    resize();

    const loader = new GLTFLoader();

    loader.load(
      COLUMN_MODEL_PATH,
      (gltf) => {
        const latestContext = contextRef.current;
        if (!latestContext) return;

        latestContext.columnModelTemplate = gltf.scene;

        for (const visuals of latestContext.blockVisuals.values()) {
          renderColumnVisual(visuals, latestContext.columnModelTemplate);
        }

        applyVisualState(
          latestContext,
          activeToolRef.current,
          highlightedIdsRef.current,
          hoveredBlockIdRef.current,
          selectedBlockIdRef.current,
        );

        requestRender(contextRef);
      },
      undefined,
      () => {
        const latestContext = contextRef.current;
        if (latestContext) {
          applyVisualState(
            latestContext,
            activeToolRef.current,
            highlightedIdsRef.current,
            hoveredBlockIdRef.current,
            selectedBlockIdRef.current,
          );
        }
        requestRender(contextRef);
      },
    );

    return () => {
      canvasHost.removeEventListener("pointermove", onPointerMove);
      canvasHost.removeEventListener("pointerleave", onPointerLeave);
      canvasHost.removeEventListener("click", onClick);

      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", resize);
      }

      const activeContext = contextRef.current;

      if (activeContext?.frameId != null) {
        window.cancelAnimationFrame(activeContext.frameId);
      }

      contextRef.current = null;
      hoveredBlockIdRef.current = null;

      renderer.dispose();
      labelRenderer.domElement.remove();
      renderer.domElement.remove();
      scene.clear();
    };
  }, []);

  useEffect(() => {
    const context = contextRef.current;

    activeToolRef.current = activeTool;
    highlightedIdsRef.current = new Set(highlightedBlockIds);
    selectedBlockIdRef.current = selectedBlockId;

    if (!context) return;

    applyVisualState(
      context,
      activeTool,
      highlightedIdsRef.current,
      hoveredBlockIdRef.current,
      selectedBlockId,
    );

    requestRender(contextRef);
  }, [activeTool, highlightedBlockIds, selectedBlockId]);

  useEffect(() => {
    const context = contextRef.current;

    blocksMapRef.current = new Map(blocks.map((b) => [b.blockId, b]));

    if (!context) return;

    syncBlockVisuals(context, blocks);
    applyVisualState(
      context,
      activeToolRef.current,
      highlightedIdsRef.current,
      hoveredBlockIdRef.current,
      selectedBlockIdRef.current,
    );
    requestRender(contextRef);
  }, [blocks]);

  return (
    <div
      className="farm3d-map"
      aria-label="16 个田块柱体的 Three.js 数字孪生地图"
    >
      <div className="farm3d-webgl" ref={canvasHostRef} />
      <div className="farm3d-label-host" ref={labelHostRef} />
      <BlockTooltip tooltip={tooltip} />
    </div>
  );
}
