import { useEffect, useRef, type RefObject } from "react";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

import type { FarmBlockSceneDatum, FarmColorToken, SceneToolId } from "./sceneData";

const PLATFORM_TOP_Y = 0;
const BLOCK_WIDTH = 2.7;
const BLOCK_DEPTH = 1.68;
const BLOCK_HEIGHT = 0.16;
const BLOCK_SPACING_X = 2.6;
const BLOCK_SPACING_Z = 3.4;
const BLOCK_ROW_OFFSET_X = 0.25;
const GRID_CENTER_COL = 1.5;
const GRID_CENTER_ROW = 1.5;
const GRID_Z_OFFSET = -0.6;
const COLUMN_MIN_HEIGHT = 1.1;
const COLUMN_HEIGHT_RANGE = 3.8;

const BLOCK_SURFACE_COLORS: Record<FarmColorToken, string> = {
  blue: "#8fd2ff",
  yellow: "#d8d18b",
  red: "#d7b08b",
};
const SINGLE_COLUMN_ID = "B09";

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

type SceneContext = {
  blockVisuals: Map<string, BlockVisuals>;
  camera: THREE.OrthographicCamera;
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

  if (!context || context.frameId !== null) {
    return;
  }

  context.frameId = window.requestAnimationFrame(() => {
    const latestContext = contextRef.current;

    if (!latestContext) {
      return;
    }

    latestContext.frameId = null;
    latestContext.renderer.render(latestContext.scene, latestContext.camera);
    latestContext.labelRenderer.render(latestContext.scene, latestContext.camera);
  });
}

function getWorldPositionForBlock(block: FarmBlockSceneDatum) {
  const offsetX = (block.grid.row - GRID_CENTER_ROW) * BLOCK_ROW_OFFSET_X;

  return {
    x: (block.grid.col - GRID_CENTER_COL) * BLOCK_SPACING_X + offsetX,
    z: block.grid.row * BLOCK_SPACING_Z + GRID_Z_OFFSET,
  };
}

function createRoundedBox(width: number, height: number, depth: number) {
  return new THREE.BoxGeometry(width, height, depth, 5, 1, 5);
}


function setCameraFrustum(camera: THREE.OrthographicCamera, width: number, height: number) {
  const aspect = width / Math.max(height, 1);
  const verticalSize = 11;

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
  title.textContent = block.blockId;

  const value = document.createElement("span");
  value.textContent = `${block.moisture}%`;

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

function fitModelToColumn(model: THREE.Object3D, targetWidth: number, targetHeight: number, targetDepth: number) {
  const bounds = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  bounds.getSize(size);

  if (size.x <= 0 || size.y <= 0 || size.z <= 0) {
    return;
  }

  const uniformScale = Math.min(targetWidth / size.x, targetHeight / size.y, targetDepth / size.z);
  model.scale.setScalar(uniformScale);
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

function applyVisualState(
  context: SceneContext,
  activeTool: SceneToolId,
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
    visuals.ground.material.color.set(isSelected ? "#d5f0df" : BLOCK_SURFACE_COLORS[visuals.block.colorToken]);

    visuals.column.position.y = visuals.ground.position.y + BLOCK_HEIGHT / 2 + visuals.columnHeight / 2;
    visuals.column.scale.x = isSelected ? 1.06 : isHovered ? 1.03 : 1;
    visuals.column.scale.z = visuals.column.scale.x;

    visuals.accent.visible = isHighlighted || isSelected;
    visuals.accent.position.y = visuals.ground.position.y + 0.01;
    (visuals.accent.material as THREE.MeshBasicMaterial).opacity = isSelected ? 0.96 : 0.62;
    visuals.hitArea.position.y = visuals.ground.position.y + BLOCK_HEIGHT / 2 + visuals.columnHeight / 2;
    visuals.label.position.y = visuals.column.position.y + visuals.columnHeight / 2 + 0.52;

    visuals.labelRoot.classList.toggle("is-selected", isSelected);
    visuals.labelRoot.classList.toggle("is-hovered", isHovered);
    visuals.labelRoot.classList.toggle("is-highlighted", isHighlighted);

    if (activeTool === "chart") {
      visuals.labelBody.textContent = `柱高 ${visuals.block.heightValue}`;
    } else if (activeTool === "cube") {
      visuals.labelBody.textContent = `${visuals.block.moisture}%`;
    } else {
      visuals.labelBody.textContent = visuals.block.blockName;
    }
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
    .find((item: THREE.Intersection<THREE.Object3D>) => item.object.userData.blockId);
  return typeof hit?.object.userData.blockId === "string" ? hit.object.userData.blockId : null;
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
  const contextRef = useRef<SceneContext | null>(null);
  const hoveredBlockIdRef = useRef<string | null>(null);
  const labelHostRef = useRef<HTMLDivElement | null>(null);
  const activeToolRef = useRef(activeTool);
  const highlightedIdsRef = useRef(new Set(highlightedBlockIds));
  const selectedBlockIdRef = useRef(selectedBlockId);

  useEffect(() => {
    const canvasHost = canvasHostRef.current;
    const labelHost = labelHostRef.current;

    if (!canvasHost || !labelHost) {
      return undefined;
    }

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera();
    // Keep the map in an isometric-like dashboard view aligned with the design mock.
    camera.position.set(8, 10, 12);
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

    const targetBlock = blocks.find((block) => block.blockId === SINGLE_COLUMN_ID) ?? blocks[0];

    if (targetBlock) {
      const block = targetBlock;
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
      ground.position.set(world.x, PLATFORM_TOP_Y + BLOCK_HEIGHT / 2, world.z);

      const columnHeight = COLUMN_MIN_HEIGHT + (block.heightValue / 100) * COLUMN_HEIGHT_RANGE;
      const column = new THREE.Group();
      column.position.set(world.x, ground.position.y + BLOCK_HEIGHT / 2 + columnHeight / 2, world.z);

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
        new THREE.BoxGeometry(BLOCK_WIDTH, columnHeight + 0.42, BLOCK_DEPTH),
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      hitArea.position.set(world.x, ground.position.y + BLOCK_HEIGHT / 2 + columnHeight / 2, world.z);
      hitArea.userData.blockId = block.blockId;

      const { root, value } = buildLabel(block);
      const label = new CSS2DObject(root);
      label.position.set(world.x, column.position.y + columnHeight / 2 + 0.52, world.z);

      scene.add(ground, column, accent, hitArea, label);
      selectables.push(hitArea);
      blockVisuals.set(block.blockId, {
        accent,
        block,
        column,
        columnHeight,
        ground,
        hitArea,
        label,
        labelBody: value,
        labelRoot: root,
      });
    }

    const resize = () => {
      const width = canvasHost.clientWidth;
      const height = canvasHost.clientHeight;

      renderer.setSize(width, height, false);
      labelRenderer.setSize(width, height);
      setCameraFrustum(camera, width, height);
      requestRender(contextRef);
    };

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    const onPointerMove = (event: PointerEvent) => {
      const blockId = getIntersectedBlockId(camera, pointer, raycaster, selectables, event.clientX, event.clientY, canvasHost);

      if (hoveredBlockIdRef.current === blockId) {
        return;
      }

      hoveredBlockIdRef.current = blockId;
      canvasHost.style.cursor = blockId ? "pointer" : "default";
      applyVisualState(
        contextRef.current as SceneContext,
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
      applyVisualState(
        contextRef.current as SceneContext,
        activeToolRef.current,
        highlightedIdsRef.current,
        hoveredBlockIdRef.current,
        selectedBlockIdRef.current,
      );
      requestRender(contextRef);
    };

    const onClick = (event: MouseEvent) => {
      const blockId = getIntersectedBlockId(camera, pointer, raycaster, selectables, event.clientX, event.clientY, canvasHost);

      if (blockId) {
        onSelectBlock(blockId);
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
      frameId: null,
      labelRenderer,
      raycaster,
      renderer,
      resizeObserver,
      scene,
      selectables,
    };

    const readyContext = contextRef.current;

    if (!readyContext) {
      return undefined;
    }

    applyVisualState(readyContext, activeToolRef.current, highlightedIdsRef.current, null, selectedBlockIdRef.current);
    resize();

    const loader = new GLTFLoader();
    loader.load(
      "/assets/column-blue.glb",
      (gltf) => {
        const latestContext = contextRef.current;

        if (!latestContext) {
          return;
        }

        for (const visuals of latestContext.blockVisuals.values()) {
          visuals.column.clear();
          const model = gltf.scene.clone(true);
          fitModelToColumn(model, 2.5, visuals.columnHeight * 1.55, 2.5);
          visuals.column.add(model);
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
        // Keep the scene usable even if model loading fails.
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
  }, [blocks, onSelectBlock]);

  useEffect(() => {
    const context = contextRef.current;

    activeToolRef.current = activeTool;
    highlightedIdsRef.current = new Set(highlightedBlockIds);
    selectedBlockIdRef.current = selectedBlockId;

    if (!context) {
      return;
    }

    applyVisualState(context, activeTool, highlightedIdsRef.current, hoveredBlockIdRef.current, selectedBlockId);
    requestRender(contextRef);
  }, [activeTool, highlightedBlockIds, selectedBlockId]);

  return (
    <div className="farm3d-map" aria-label="单个田块柱体的 Three.js 数字孪生地图">
      <div className="farm3d-webgl" ref={canvasHostRef} />
      <div className="farm3d-label-host" ref={labelHostRef} />
    </div>
  );
}
