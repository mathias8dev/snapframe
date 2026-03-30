"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Rect, Text, Group, Image as KonvaImage, Ellipse, RegularPolygon, Star, Line, Arrow, Transformer } from "react-konva";
import Konva from "konva";
import useEditorStore from "@/lib/store";
import { DEVICES } from "@/lib/deviceConfigs";
import {
  computeDeviceLayout,
  computeButtonRect,
  FRAME_FILL,
  FRAME_STROKE,
  SCREEN_BG,
  CANVAS_BG,
  DYNAMIC_ISLAND,
  NOTCH,
} from "@/lib/deviceGeometry";
import { useLoadImage } from "@/lib/useLoadImage";
import { useLoadSvgImage } from "@/lib/useLoadSvgImage";
import {
  BackgroundLayer,
  TitleLayer,
  DeviceLayer,
  ImageLayer,
  ShapeLayer,
  TextBlockLayer,
  IconLayer,
} from "@/lib/types";

function BackgroundRenderer({
  layer,
  width,
  height,
}: {
  layer: BackgroundLayer;
  width: number;
  height: number;
}) {
  const bgImage = useLoadImage(layer.kind === "image" ? layer.imageUrl : null);
  if (!layer.visible) return null;

  if (layer.kind === "image" && bgImage) {
    return (
      <KonvaImage
        image={bgImage}
        width={width}
        height={height}
      />
    );
  }

  if (layer.kind === "solid") {
    return <Rect width={width} height={height} fill={layer.color1} />;
  }

  if (layer.kind === "gradient") {
    const rad = (layer.angle * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const len = Math.sqrt(width * width + height * height) / 2;
    return (
      <Rect
        width={width}
        height={height}
        fillLinearGradientStartPoint={{
          x: cx - Math.cos(rad) * len,
          y: cy - Math.sin(rad) * len,
        }}
        fillLinearGradientEndPoint={{
          x: cx + Math.cos(rad) * len,
          y: cy + Math.sin(rad) * len,
        }}
        fillLinearGradientColorStops={[0, layer.color1, 1, layer.color2]}
      />
    );
  }

  return <Rect width={width} height={height} fill={layer.color1} />;
}

function TitleRenderer({
  layer,
  canvasWidth,
  canvasHeight,
  onSelect,
  isSelected,
  slideId,
}: {
  layer: TitleLayer;
  canvasWidth: number;
  canvasHeight: number;
  onSelect: () => void;
  isSelected: boolean;
  slideId: string;
}) {
  const textRef = useRef<Konva.Text>(null);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  if (!layer.visible) return null;

  const textWidth = (layer.width / 100) * canvasWidth;
  const x = layer.x !== 0 ? (layer.x / 100) * canvasWidth : (canvasWidth - textWidth) / 2;
  const y =
    layer.position === "top"
      ? (layer.y / canvasHeight) * canvasHeight
      : canvasHeight - (layer.y / canvasHeight) * canvasHeight - layer.fontSize * 1.5;

  return (
    <Text
      ref={textRef}
      text={layer.text}
      x={x}
      y={y}
      width={textWidth}
      wrap="word"
      fontSize={layer.fontSize}
      fontFamily={layer.fontFamily}
      fontStyle={layer.fontWeight >= 700 ? "bold" : "normal"}
      fill={layer.color}
      align={layer.align}
      draggable={!layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        updateLayer(slideId, layer.id, {
          x: (e.target.x() / canvasWidth) * 100,
          y: e.target.y(),
        });
      }}
      stroke={isSelected ? "#7c3aed" : undefined}
      strokeWidth={isSelected ? 1 : 0}
    />
  );
}

function DeviceRenderer({
  layer,
  canvasWidth,
  canvasHeight,
  onSelect,
  isSelected,
  slideId,
}: {
  layer: DeviceLayer;
  canvasWidth: number;
  canvasHeight: number;
  onSelect: () => void;
  isSelected: boolean;
  slideId: string;
}) {
  const device = DEVICES[layer.deviceId];
  const screenshotImage = useLoadImage(layer.screenshotUrl);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  if (!layer.visible || !device) return null;

  const layout = computeDeviceLayout(device, canvasWidth, canvasHeight, layer);
  const { frameX, frameY, frameW, frameH, cr, screenX, screenY, screenW, screenH, screenCr, pivotX, pivotY, scale } = layout;
  const oX = layer.offsetX ?? 0;
  const oY = layer.offsetY ?? 0;

  return (
    <Group
      onClick={onSelect}
      onTap={onSelect}
      draggable={!layer.locked}
      rotation={layer.rotation ?? 0}
      offsetX={pivotX}
      offsetY={pivotY}
      x={pivotX + oX}
      y={pivotY + oY}
      onDragEnd={(e) => {
        updateLayer(slideId, layer.id, {
          offsetX: e.target.x() - pivotX,
          offsetY: e.target.y() - pivotY,
        });
      }}
    >
      {/* Device frame */}
      {layer.frameVisible && (
        <Rect
          x={frameX} y={frameY} width={frameW} height={frameH}
          cornerRadius={cr}
          fill={FRAME_FILL}
          stroke={isSelected ? "#7c3aed" : FRAME_STROKE}
          strokeWidth={isSelected ? 2 : 1}
          opacity={layer.frameOpacity}
        />
      )}

      {/* Screen area (clipped) */}
      <Group
        clipFunc={(ctx: Konva.Context) => {
          ctx.beginPath();
          ctx.moveTo(screenX + screenCr, screenY);
          ctx.lineTo(screenX + screenW - screenCr, screenY);
          ctx.quadraticCurveTo(screenX + screenW, screenY, screenX + screenW, screenY + screenCr);
          ctx.lineTo(screenX + screenW, screenY + screenH - screenCr);
          ctx.quadraticCurveTo(screenX + screenW, screenY + screenH, screenX + screenW - screenCr, screenY + screenH);
          ctx.lineTo(screenX + screenCr, screenY + screenH);
          ctx.quadraticCurveTo(screenX, screenY + screenH, screenX, screenY + screenH - screenCr);
          ctx.lineTo(screenX, screenY + screenCr);
          ctx.quadraticCurveTo(screenX, screenY, screenX + screenCr, screenY);
          ctx.closePath();
        }}
      >
        <Rect x={screenX} y={screenY} width={screenW} height={screenH} fill={SCREEN_BG} />
        {screenshotImage && (
          <KonvaImage image={screenshotImage} x={screenX} y={screenY} width={screenW} height={screenH} />
        )}
      </Group>

      {/* Dynamic Island */}
      {device.dynamicIsland && layer.frameVisible && (
        <Rect
          x={frameX + frameW / 2 - (DYNAMIC_ISLAND.width / 2) * scale}
          y={frameY + DYNAMIC_ISLAND.yOffset * scale}
          width={DYNAMIC_ISLAND.width * scale}
          height={DYNAMIC_ISLAND.height * scale}
          cornerRadius={(DYNAMIC_ISLAND.height / 2) * scale}
          fill={SCREEN_BG}
        />
      )}

      {/* Notch */}
      {device.notch && !device.dynamicIsland && layer.frameVisible && (
        <Rect
          x={frameX + frameW / 2 - (NOTCH.width / 2) * scale}
          y={frameY}
          width={NOTCH.width * scale}
          height={NOTCH.height * scale}
          cornerRadius={[0, 0, NOTCH.radius * scale, NOTCH.radius * scale]}
          fill={FRAME_FILL}
        />
      )}

      {/* Hardware buttons */}
      {layer.frameVisible &&
        device.buttons?.map((btn, i) => {
          const r = computeButtonRect(btn, frameX, frameY, frameW, frameH, scale);
          return (
            <Rect
              key={i}
              x={r.x} y={r.y} width={r.width} height={r.height}
              cornerRadius={r.radius}
              fill={FRAME_FILL}
              opacity={layer.frameOpacity}
            />
          );
        })}
    </Group>
  );
}

function ImageRenderer({
  layer,
  canvasWidth,
  canvasHeight,
  onSelect,
  isSelected,
  slideId,
}: {
  layer: ImageLayer;
  canvasWidth: number;
  canvasHeight: number;
  onSelect: () => void;
  isSelected: boolean;
  slideId: string;
}) {
  const image = useLoadImage(layer.url);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  if (!layer.visible || !image) return null;

  return (
    <KonvaImage
      image={image}
      x={layer.x}
      y={layer.y}
      width={layer.width || canvasWidth * 0.5}
      height={layer.height || canvasHeight * 0.5}
      opacity={layer.opacity}
      draggable={!layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        updateLayer(slideId, layer.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      stroke={isSelected ? "#7c3aed" : undefined}
      strokeWidth={isSelected ? 2 : 0}
    />
  );
}

// ---------------------------------------------------------------------------
// Shape renderer
// ---------------------------------------------------------------------------

function ShapeRenderer({
  layer, canvasWidth, canvasHeight, onSelect, isSelected, slideId, nodeRef,
}: {
  layer: ShapeLayer; canvasWidth: number; canvasHeight: number;
  onSelect: () => void; isSelected: boolean; slideId: string;
  nodeRef: (node: Konva.Node | null) => void;
}) {
  const updateLayer = useEditorStore((s) => s.updateLayer);
  if (!layer.visible) return null;

  const common = {
    opacity: layer.opacity,
    fill: layer.fill,
    stroke: isSelected ? "#7c3aed" : layer.stroke || undefined,
    strokeWidth: isSelected ? 2 : layer.strokeWidth,
    rotation: layer.rotation,
    draggable: !layer.locked,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      updateLayer(slideId, layer.id, { x: e.target.x(), y: e.target.y() });
    },
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      updateLayer(slideId, layer.id, {
        x: node.x(), y: node.y(),
        width: Math.max(5, node.width() * node.scaleX()),
        height: Math.max(5, node.height() * node.scaleY()),
        rotation: node.rotation(),
      });
      node.scaleX(1);
      node.scaleY(1);
    },
  };

  const setRef = (n: Konva.Node | null) => nodeRef(n);

  switch (layer.shapeType) {
    case "rect":
      return <Rect ref={setRef} x={layer.x} y={layer.y} width={layer.width} height={layer.height} {...common} />;
    case "circle":
      return <Ellipse ref={setRef} x={layer.x + layer.width / 2} y={layer.y + layer.height / 2} radiusX={layer.width / 2} radiusY={layer.height / 2} {...common} offsetX={0} offsetY={0}
        onDragEnd={(e) => { updateLayer(slideId, layer.id, { x: e.target.x() - layer.width / 2, y: e.target.y() - layer.height / 2 }); }}
        onTransformEnd={(e) => {
          const n = e.target as Konva.Ellipse;
          const w = Math.max(5, n.radiusX() * 2 * n.scaleX());
          const h = Math.max(5, n.radiusY() * 2 * n.scaleY());
          updateLayer(slideId, layer.id, { x: n.x() - w / 2, y: n.y() - h / 2, width: w, height: h, rotation: n.rotation() });
          n.scaleX(1); n.scaleY(1);
        }}
      />;
    case "triangle":
      return <RegularPolygon ref={setRef} x={layer.x + layer.width / 2} y={layer.y + layer.height / 2} sides={3} radius={Math.min(layer.width, layer.height) / 2} {...common}
        onDragEnd={(e) => { updateLayer(slideId, layer.id, { x: e.target.x() - layer.width / 2, y: e.target.y() - layer.height / 2 }); }}
        onTransformEnd={(e) => {
          const n = e.target; const s = Math.max(n.scaleX(), n.scaleY());
          const sz = Math.max(10, Math.min(layer.width, layer.height) * s);
          updateLayer(slideId, layer.id, { x: n.x() - sz / 2, y: n.y() - sz / 2, width: sz, height: sz, rotation: n.rotation() });
          n.scaleX(1); n.scaleY(1);
        }}
      />;
    case "star":
      return <Star ref={setRef} x={layer.x + layer.width / 2} y={layer.y + layer.height / 2} numPoints={5} innerRadius={Math.min(layer.width, layer.height) / 4} outerRadius={Math.min(layer.width, layer.height) / 2} {...common}
        onDragEnd={(e) => { updateLayer(slideId, layer.id, { x: e.target.x() - layer.width / 2, y: e.target.y() - layer.height / 2 }); }}
        onTransformEnd={(e) => {
          const n = e.target; const s = Math.max(n.scaleX(), n.scaleY());
          const sz = Math.max(10, Math.min(layer.width, layer.height) * s);
          updateLayer(slideId, layer.id, { x: n.x() - sz / 2, y: n.y() - sz / 2, width: sz, height: sz, rotation: n.rotation() });
          n.scaleX(1); n.scaleY(1);
        }}
      />;
    case "line":
      return <Line ref={setRef} points={[0, 0, layer.width, layer.height]} x={layer.x} y={layer.y} stroke={isSelected ? "#7c3aed" : layer.stroke || layer.fill} strokeWidth={layer.strokeWidth || 2} opacity={layer.opacity} draggable={!layer.locked} onClick={onSelect} onTap={onSelect}
        onDragEnd={(e) => { updateLayer(slideId, layer.id, { x: e.target.x(), y: e.target.y() }); }}
      />;
    case "arrow":
      return <Arrow ref={setRef} points={[0, 0, layer.width, layer.height]} x={layer.x} y={layer.y} fill={layer.fill} stroke={isSelected ? "#7c3aed" : layer.stroke || layer.fill} strokeWidth={layer.strokeWidth || 2} opacity={layer.opacity} draggable={!layer.locked} onClick={onSelect} onTap={onSelect}
        onDragEnd={(e) => { updateLayer(slideId, layer.id, { x: e.target.x(), y: e.target.y() }); }}
      />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// TextBlock renderer
// ---------------------------------------------------------------------------

function TextBlockRenderer({
  layer, onSelect, isSelected, slideId, nodeRef,
}: {
  layer: TextBlockLayer; onSelect: () => void; isSelected: boolean; slideId: string;
  nodeRef: (node: Konva.Node | null) => void;
}) {
  const updateLayer = useEditorStore((s) => s.updateLayer);
  if (!layer.visible) return null;

  return (
    <Group
      x={layer.x} y={layer.y}
      draggable={!layer.locked}
      onClick={onSelect} onTap={onSelect}
      opacity={layer.opacity}
      onDragEnd={(e) => { updateLayer(slideId, layer.id, { x: e.target.x(), y: e.target.y() }); }}
    >
      {layer.backgroundColor && (
        <Rect width={layer.width} height={layer.fontSize * 3} fill={layer.backgroundColor} cornerRadius={4} />
      )}
      <Text
        ref={(n) => nodeRef(n)}
        text={layer.text}
        width={layer.width}
        fontSize={layer.fontSize}
        fontFamily={layer.fontFamily}
        fontStyle={layer.fontWeight >= 700 ? "bold" : "normal"}
        fill={layer.color}
        align={layer.align}
        stroke={isSelected ? "#7c3aed" : undefined}
        strokeWidth={isSelected ? 0.5 : 0}
        onTransformEnd={(e) => {
          const node = e.target;
          updateLayer(slideId, layer.id, {
            width: Math.max(20, node.width() * node.scaleX()),
          });
          node.scaleX(1); node.scaleY(1);
        }}
      />
    </Group>
  );
}

// ---------------------------------------------------------------------------
// Icon renderer
// ---------------------------------------------------------------------------

function IconRenderer({
  layer, onSelect, isSelected, slideId, nodeRef,
}: {
  layer: IconLayer; onSelect: () => void; isSelected: boolean; slideId: string;
  nodeRef: (node: Konva.Node | null) => void;
}) {
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const image = useLoadSvgImage(layer.svgContent, layer.fill);
  if (!layer.visible || !image) return null;

  return (
    <KonvaImage
      ref={(n) => nodeRef(n)}
      image={image}
      x={layer.x} y={layer.y}
      width={layer.size} height={layer.size}
      rotation={layer.rotation}
      opacity={layer.opacity}
      draggable={!layer.locked}
      onClick={onSelect} onTap={onSelect}
      stroke={isSelected ? "#7c3aed" : undefined}
      strokeWidth={isSelected ? 2 : 0}
      onDragEnd={(e) => { updateLayer(slideId, layer.id, { x: e.target.x(), y: e.target.y() }); }}
      onTransformEnd={(e) => {
        const node = e.target;
        const newSize = Math.max(8, layer.size * Math.max(node.scaleX(), node.scaleY()));
        updateLayer(slideId, layer.id, { x: node.x(), y: node.y(), size: newSize, rotation: node.rotation() });
        node.scaleX(1); node.scaleY(1);
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Snap guides
// ---------------------------------------------------------------------------

const SNAP_THRESHOLD = 5;

interface GuideLine {
  points: number[];
  orientation: "h" | "v";
}

function getSnapLines(
  canvasW: number,
  canvasH: number,
): { x: number[]; y: number[] } {
  // Canvas center + edges
  return {
    x: [0, canvasW / 2, canvasW],
    y: [0, canvasH / 2, canvasH],
  };
}

function snapValue(value: number, targets: number[], threshold: number): { snapped: number; guide: number | null } {
  for (const t of targets) {
    if (Math.abs(value - t) < threshold) {
      return { snapped: t, guide: t };
    }
  }
  return { snapped: value, guide: null };
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 420, height: 840 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef(new Map<string, Konva.Node>());
  const project = useEditorStore((s) => s.project);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const setActiveLayer = useEditorStore((s) => s.setActiveLayer);

  const [guides, setGuides] = useState<GuideLine[]>([]);
  const slide = project?.slides.find((s) => s.id === activeSlideId);

  const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const box = node.getClientRect({ relativeTo: node.getLayer() ?? undefined });
    const snapLines = getSnapLines(dimensions.width, dimensions.height);

    const newGuides: GuideLine[] = [];

    // Check left, center, right
    const cx = box.x + box.width / 2;
    const checkX = [
      { val: box.x, offset: 0 },
      { val: cx, offset: box.width / 2 },
      { val: box.x + box.width, offset: box.width },
    ];

    for (const { val, offset } of checkX) {
      const { snapped, guide } = snapValue(val, snapLines.x, SNAP_THRESHOLD);
      if (guide !== null) {
        node.x(node.x() + (snapped - val));
        newGuides.push({ points: [guide, 0, guide, dimensions.height], orientation: "v" });
        break;
      }
    }

    // Check top, center, bottom
    const cy = box.y + box.height / 2;
    const checkY = [
      { val: box.y, offset: 0 },
      { val: cy, offset: box.height / 2 },
      { val: box.y + box.height, offset: box.height },
    ];

    for (const { val } of checkY) {
      const { snapped, guide } = snapValue(val, snapLines.y, SNAP_THRESHOLD);
      if (guide !== null) {
        node.y(node.y() + (snapped - val));
        newGuides.push({ points: [0, guide, dimensions.width, guide], orientation: "h" });
        break;
      }
    }

    setGuides(newGuides);
  }, [dimensions]);

  const handleDragEnd = useCallback(() => {
    setGuides([]);
  }, []);

  // Attach Transformer to the selected node
  const TRANSFORMABLE_TYPES = new Set(["image", "shape", "textblock", "icon"]);
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    const activeLayer = slide?.layers.find((l) => l.id === activeLayerId);
    if (activeLayerId && activeLayer && TRANSFORMABLE_TYPES.has(activeLayer.type)) {
      const node = nodeRefs.current.get(activeLayerId);
      if (node) {
        tr.nodes([node]);
        tr.getLayer()?.batchDraw();
        return;
      }
    }
    tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [activeLayerId, activeSlideId, slide]);

  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const maxW = rect.width - 40;
    const maxH = rect.height - 40;
    const targetAspect = 9 / 19.5;

    let w = maxW;
    let h = w / targetAspect;
    if (h > maxH) {
      h = maxH;
      w = h * targetAspect;
    }
    setDimensions({ width: Math.floor(w), height: Math.floor(h) });
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  // Ctrl + wheel → zoom, plain wheel → pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((prev) => {
          const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
          return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((prev + delta) * 100) / 100));
        });
      } else {
        e.preventDefault();
        setPan((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // Middle mouse button drag → pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 1) return;
      e.preventDefault();
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      container.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      setPan((prev) => ({
        x: prev.x + e.clientX - panStart.current.x,
        y: prev.y + e.clientY - panStart.current.y,
      }));
      panStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      if (!isPanning.current) return;
      isPanning.current = false;
      container.style.cursor = "";
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.currentTarget || e.target.getClassName() === "Rect") {
      // Check if it's the stage background or canvas background
      const clickedOnBackground = e.target.attrs?.id === "canvas-bg";
      if (clickedOnBackground || e.target === e.currentTarget) {
        setActiveLayer(null);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-canvas overflow-hidden relative"
      onClick={(e) => {
        if (e.target === containerRef.current) setActiveLayer(null);
      }}
    >
      <div
        className="rounded-lg shadow-2xl"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleStageClick}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <Layer key={activeSlideId}>
            <Rect
              id="canvas-bg"
              width={dimensions.width}
              height={dimensions.height}
              fill={CANVAS_BG}
            />
            {slide?.layers.map((layer) => {
              const isSelected = layer.id === activeLayerId;
              switch (layer.type) {
                case "background":
                  return (
                    <BackgroundRenderer
                      key={layer.id}
                      layer={layer}
                      width={dimensions.width}
                      height={dimensions.height}
                    />
                  );
                case "title":
                  return (
                    <TitleRenderer
                      key={layer.id}
                      layer={layer}
                      canvasWidth={dimensions.width}
                      canvasHeight={dimensions.height}
                      onSelect={() => setActiveLayer(layer.id)}
                      isSelected={isSelected}
                      slideId={slide.id}
                    />
                  );
                case "device":
                  return (
                    <DeviceRenderer
                      key={layer.id}
                      layer={layer}
                      canvasWidth={dimensions.width}
                      canvasHeight={dimensions.height}
                      onSelect={() => setActiveLayer(layer.id)}
                      isSelected={isSelected}
                      slideId={slide.id}
                    />
                  );
                case "image":
                  return (
                    <ImageRenderer
                      key={layer.id}
                      layer={layer}
                      canvasWidth={dimensions.width}
                      canvasHeight={dimensions.height}
                      onSelect={() => setActiveLayer(layer.id)}
                      isSelected={isSelected}
                      slideId={slide.id}
                    />
                  );
                case "shape":
                  return (
                    <ShapeRenderer
                      key={layer.id}
                      layer={layer}
                      canvasWidth={dimensions.width}
                      canvasHeight={dimensions.height}
                      onSelect={() => setActiveLayer(layer.id)}
                      isSelected={isSelected}
                      slideId={slide.id}
                      nodeRef={(n) => { if (n) nodeRefs.current.set(layer.id, n); else nodeRefs.current.delete(layer.id); }}
                    />
                  );
                case "textblock":
                  return (
                    <TextBlockRenderer
                      key={layer.id}
                      layer={layer}
                      onSelect={() => setActiveLayer(layer.id)}
                      isSelected={isSelected}
                      slideId={slide.id}
                      nodeRef={(n) => { if (n) nodeRefs.current.set(layer.id, n); else nodeRefs.current.delete(layer.id); }}
                    />
                  );
                case "icon":
                  return (
                    <IconRenderer
                      key={layer.id}
                      layer={layer}
                      onSelect={() => setActiveLayer(layer.id)}
                      isSelected={isSelected}
                      slideId={slide.id}
                      nodeRef={(n) => { if (n) nodeRefs.current.set(layer.id, n); else nodeRefs.current.delete(layer.id); }}
                    />
                  );
                default:
                  return null;
              }
            })}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(_, newBox) => ({
                ...newBox,
                width: Math.max(5, newBox.width),
                height: Math.max(5, newBox.height),
              })}
              anchorSize={8}
              anchorCornerRadius={2}
              borderStroke="#7c3aed"
              anchorStroke="#7c3aed"
              anchorFill="#ffffff"
            />
            {/* Snap guides */}
            {guides.map((g, i) => (
              <Line
                key={i}
                points={g.points}
                stroke="#f472b6"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Zoom / pan indicator */}
      {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface/90 border border-border rounded-full px-3 py-1 text-xs text-muted">
          <span>{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="text-accent hover:text-foreground transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
