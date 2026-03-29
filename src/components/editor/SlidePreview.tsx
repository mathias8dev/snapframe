"use client";

import React from "react";
import { Rect, Text, Group, Image as KonvaImage, Ellipse, RegularPolygon, Star, Line, Arrow } from "react-konva";
import Konva from "konva";
import { DEVICES } from "@/lib/deviceConfigs";
import {
  computeDeviceLayout,
  computeButtonRect,
  REF_W,
  REF_H,
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
  Layer,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Read-only layer renderers for thumbnails and previews
// ---------------------------------------------------------------------------

function ReadOnlyBackground({ layer, width, height }: { layer: BackgroundLayer; width: number; height: number }) {
  const bgImage = useLoadImage(layer.kind === "image" ? layer.imageUrl : null);
  if (!layer.visible) return null;

  if (layer.kind === "image" && bgImage) {
    return <KonvaImage image={bgImage} width={width} height={height} />;
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
        fillLinearGradientStartPoint={{ x: cx - Math.cos(rad) * len, y: cy - Math.sin(rad) * len }}
        fillLinearGradientEndPoint={{ x: cx + Math.cos(rad) * len, y: cy + Math.sin(rad) * len }}
        fillLinearGradientColorStops={[0, layer.color1, 1, layer.color2]}
      />
    );
  }

  return <Rect width={width} height={height} fill={layer.color1} />;
}

function ReadOnlyTitle({ layer, canvasWidth, canvasHeight }: { layer: TitleLayer; canvasWidth: number; canvasHeight: number }) {
  if (!layer.visible) return null;

  const textWidth = (layer.width / 100) * canvasWidth;
  const x = layer.x !== 0 ? (layer.x / 100) * canvasWidth : (canvasWidth - textWidth) / 2;
  const scaledFontSize = (layer.fontSize / REF_W) * canvasWidth;
  const y = layer.position === "top"
    ? (layer.y / REF_H) * canvasHeight
    : canvasHeight - (layer.y / REF_H) * canvasHeight - scaledFontSize * 1.5;

  return (
    <Text
      text={layer.text} x={x} y={y} width={textWidth}
      fontSize={scaledFontSize} fontFamily={layer.fontFamily}
      fontStyle={layer.fontWeight >= 700 ? "bold" : "normal"}
      fill={layer.color} align={layer.align} listening={false}
    />
  );
}

function ReadOnlyDevice({ layer, canvasWidth, canvasHeight }: { layer: DeviceLayer; canvasWidth: number; canvasHeight: number }) {
  const device = DEVICES[layer.deviceId];
  const screenshotImage = useLoadImage(layer.screenshotUrl);
  if (!layer.visible || !device) return null;

  const thumbScale = { x: canvasWidth / REF_W, y: canvasHeight / REF_H };
  const layout = computeDeviceLayout(device, canvasWidth, canvasHeight, layer, thumbScale);
  const { frameX, frameY, frameW, frameH, cr, screenX, screenY, screenW, screenH, screenCr, pivotX, pivotY, scale } = layout;
  const oX = layer.offsetX ?? 0;
  const oY = layer.offsetY ?? 0;

  return (
    <Group
      rotation={layer.rotation ?? 0}
      offsetX={pivotX} offsetY={pivotY}
      x={pivotX + oX * thumbScale.x} y={pivotY + oY * thumbScale.y}
      listening={false}
    >
      {layer.frameVisible && (
        <Rect x={frameX} y={frameY} width={frameW} height={frameH}
          cornerRadius={cr} fill={FRAME_FILL} stroke={FRAME_STROKE}
          strokeWidth={0.5} opacity={layer.frameOpacity}
        />
      )}

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

      {device.dynamicIsland && layer.frameVisible && (
        <Rect
          x={frameX + frameW / 2 - (DYNAMIC_ISLAND.width / 2) * scale}
          y={frameY + DYNAMIC_ISLAND.yOffset * scale}
          width={DYNAMIC_ISLAND.width * scale} height={DYNAMIC_ISLAND.height * scale}
          cornerRadius={(DYNAMIC_ISLAND.height / 2) * scale} fill={SCREEN_BG}
        />
      )}

      {device.notch && !device.dynamicIsland && layer.frameVisible && (
        <Rect
          x={frameX + frameW / 2 - (NOTCH.width / 2) * scale} y={frameY}
          width={NOTCH.width * scale} height={NOTCH.height * scale}
          cornerRadius={[0, 0, NOTCH.radius * scale, NOTCH.radius * scale]} fill={FRAME_FILL}
        />
      )}

      {layer.frameVisible && device.buttons?.map((btn, i) => {
        const r = computeButtonRect(btn, frameX, frameY, frameW, frameH, scale);
        return (
          <Rect key={i} x={r.x} y={r.y} width={r.width} height={r.height}
            cornerRadius={r.radius} fill={FRAME_FILL} opacity={layer.frameOpacity}
          />
        );
      })}
    </Group>
  );
}

function ReadOnlyImage({ layer, canvasWidth, canvasHeight }: { layer: ImageLayer; canvasWidth: number; canvasHeight: number }) {
  const image = useLoadImage(layer.url);
  if (!layer.visible || !image) return null;

  const scaleX = canvasWidth / REF_W;
  const scaleY = canvasHeight / REF_H;

  return (
    <KonvaImage
      image={image}
      x={layer.x * scaleX} y={layer.y * scaleY}
      width={(layer.width || REF_W * 0.5) * scaleX}
      height={(layer.height || REF_H * 0.5) * scaleY}
      opacity={layer.opacity} listening={false}
    />
  );
}

// ---------------------------------------------------------------------------
// Shape (read-only)
// ---------------------------------------------------------------------------

function ReadOnlyShape({ layer, canvasWidth, canvasHeight }: { layer: ShapeLayer; canvasWidth: number; canvasHeight: number }) {
  if (!layer.visible) return null;
  const sx = canvasWidth / REF_W;
  const sy = canvasHeight / REF_H;
  const x = layer.x * sx, y = layer.y * sy, w = layer.width * sx, h = layer.height * sy;

  const common = { fill: layer.fill, stroke: layer.stroke || undefined, strokeWidth: layer.strokeWidth * sx, opacity: layer.opacity, rotation: layer.rotation, listening: false as const };

  switch (layer.shapeType) {
    case "rect":
      return <Rect x={x} y={y} width={w} height={h} {...common} />;
    case "circle":
      return <Ellipse x={x + w / 2} y={y + h / 2} radiusX={w / 2} radiusY={h / 2} {...common} />;
    case "triangle":
      return <RegularPolygon x={x + w / 2} y={y + h / 2} sides={3} radius={Math.min(w, h) / 2} {...common} />;
    case "star":
      return <Star x={x + w / 2} y={y + h / 2} numPoints={5} innerRadius={Math.min(w, h) / 4} outerRadius={Math.min(w, h) / 2} {...common} />;
    case "line":
      return <Line points={[x, y, x + w, y + h]} stroke={layer.stroke || layer.fill} strokeWidth={(layer.strokeWidth || 2) * sx} opacity={layer.opacity} listening={false} />;
    case "arrow":
      return <Arrow points={[x, y, x + w, y + h]} fill={layer.fill} stroke={layer.stroke || layer.fill} strokeWidth={(layer.strokeWidth || 2) * sx} opacity={layer.opacity} listening={false} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// TextBlock (read-only)
// ---------------------------------------------------------------------------

function ReadOnlyTextBlock({ layer, canvasWidth, canvasHeight }: { layer: TextBlockLayer; canvasWidth: number; canvasHeight: number }) {
  if (!layer.visible) return null;
  const sx = canvasWidth / REF_W;
  const sy = canvasHeight / REF_H;

  return (
    <Group x={layer.x * sx} y={layer.y * sy} opacity={layer.opacity} listening={false}>
      {layer.backgroundColor && (
        <Rect width={layer.width * sx} height={layer.fontSize * sy * 3} fill={layer.backgroundColor} cornerRadius={4 * sx} />
      )}
      <Text
        text={layer.text} width={layer.width * sx}
        fontSize={layer.fontSize * sx}
        fontFamily={layer.fontFamily}
        fontStyle={layer.fontWeight >= 700 ? "bold" : "normal"}
        fill={layer.color} align={layer.align} listening={false}
      />
    </Group>
  );
}

// ---------------------------------------------------------------------------
// Icon (read-only)
// ---------------------------------------------------------------------------

function ReadOnlyIcon({ layer, canvasWidth, canvasHeight }: { layer: IconLayer; canvasWidth: number; canvasHeight: number }) {
  const image = useLoadSvgImage(layer.svgContent, layer.fill);
  if (!layer.visible || !image) return null;
  const sx = canvasWidth / REF_W;
  const sy = canvasHeight / REF_H;
  const sz = layer.size * sx;

  return (
    <KonvaImage image={image} x={layer.x * sx} y={layer.y * sy}
      width={sz} height={sz} rotation={layer.rotation}
      opacity={layer.opacity} listening={false}
    />
  );
}

// ---------------------------------------------------------------------------
// Public: renders all layers of a slide at the given dimensions
// ---------------------------------------------------------------------------

export { CANVAS_BG };

export function SlideLayerRenderer({ layers, width, height }: { layers: Layer[]; width: number; height: number }) {
  return (
    <>
      {layers.map((layer) => {
        switch (layer.type) {
          case "background":
            return <ReadOnlyBackground key={layer.id} layer={layer} width={width} height={height} />;
          case "title":
            return <ReadOnlyTitle key={layer.id} layer={layer} canvasWidth={width} canvasHeight={height} />;
          case "device":
            return <ReadOnlyDevice key={layer.id} layer={layer} canvasWidth={width} canvasHeight={height} />;
          case "image":
            return <ReadOnlyImage key={layer.id} layer={layer} canvasWidth={width} canvasHeight={height} />;
          case "shape":
            return <ReadOnlyShape key={layer.id} layer={layer} canvasWidth={width} canvasHeight={height} />;
          case "textblock":
            return <ReadOnlyTextBlock key={layer.id} layer={layer} canvasWidth={width} canvasHeight={height} />;
          case "icon":
            return <ReadOnlyIcon key={layer.id} layer={layer} canvasWidth={width} canvasHeight={height} />;
          default:
            return null;
        }
      })}
    </>
  );
}
