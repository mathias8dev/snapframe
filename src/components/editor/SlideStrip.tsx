"use client";

import React from "react";
import { Stage, Layer, Rect, Text, Group, Image as KonvaImage } from "react-konva";
import Konva from "konva";
import { Plus, MoreVertical, Copy, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import useEditorStore from "@/lib/store";
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
import {
  BackgroundLayer,
  TitleLayer,
  DeviceLayer,
  ImageLayer,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function ThumbBackground({
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

function ThumbTitle({
  layer,
  canvasWidth,
  canvasHeight,
}: {
  layer: TitleLayer;
  canvasWidth: number;
  canvasHeight: number;
}) {
  if (!layer.visible) return null;

  const textWidth = (layer.width / 100) * canvasWidth;
  const x =
    layer.x !== 0 ? (layer.x / 100) * canvasWidth : (canvasWidth - textWidth) / 2;
  const scaledFontSize = (layer.fontSize / REF_W) * canvasWidth;
  const y =
    layer.position === "top"
      ? (layer.y / REF_H) * canvasHeight
      : canvasHeight - (layer.y / REF_H) * canvasHeight - scaledFontSize * 1.5;

  return (
    <Text
      text={layer.text}
      x={x}
      y={y}
      width={textWidth}
      fontSize={scaledFontSize}
      fontFamily={layer.fontFamily}
      fontStyle={layer.fontWeight >= 700 ? "bold" : "normal"}
      fill={layer.color}
      align={layer.align}
      listening={false}
    />
  );
}

function ThumbDevice({
  layer,
  canvasWidth,
  canvasHeight,
}: {
  layer: DeviceLayer;
  canvasWidth: number;
  canvasHeight: number;
}) {
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
      offsetX={pivotX}
      offsetY={pivotY}
      x={pivotX + oX * thumbScale.x}
      y={pivotY + oY * thumbScale.y}
      listening={false}
    >
      {/* Frame */}
      {layer.frameVisible && (
        <Rect
          x={frameX} y={frameY} width={frameW} height={frameH}
          cornerRadius={cr}
          fill={FRAME_FILL}
          stroke={FRAME_STROKE}
          strokeWidth={0.5}
          opacity={layer.frameOpacity}
        />
      )}

      {/* Screen (clipped) */}
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

function ThumbImage({
  layer,
  canvasWidth,
  canvasHeight,
}: {
  layer: ImageLayer;
  canvasWidth: number;
  canvasHeight: number;
}) {
  const image = useLoadImage(layer.url);
  if (!layer.visible || !image) return null;

  const scaleX = canvasWidth / REF_W;
  const scaleY = canvasHeight / REF_H;

  return (
    <KonvaImage
      image={image}
      x={layer.x * scaleX}
      y={layer.y * scaleY}
      width={(layer.width || REF_W * 0.5) * scaleX}
      height={(layer.height || REF_H * 0.5) * scaleY}
      opacity={layer.opacity}
      listening={false}
    />
  );
}

// ---------------------------------------------------------------------------
// Slide thumbnail – renders all layers at thumbnail scale
// ---------------------------------------------------------------------------

function SlideThumbnail({
  slideId,
  index,
  isActive,
}: {
  slideId: string;
  index: number;
  isActive: boolean;
}) {
  const project = useEditorStore((s) => s.project);
  const setActiveSlide = useEditorStore((s) => s.setActiveSlide);
  const duplicateSlide = useEditorStore((s) => s.duplicateSlide);
  const removeSlide = useEditorStore((s) => s.removeSlide);
  const moveSlide = useEditorStore((s) => s.moveSlide);
  const [showMenu, setShowMenu] = React.useState(false);

  const slide = project?.slides.find((s) => s.id === slideId);
  if (!slide) return null;

  const thumbW = 140;
  const thumbH = (REF_H / REF_W) * thumbW; // keep same aspect ratio as canvas

  return (
    <div className="relative group">
      <div
        onClick={() => setActiveSlide(slideId)}
        className={cn(
          "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
          isActive
            ? "border-accent shadow-lg shadow-accent/20"
            : "border-transparent hover:border-border"
        )}
      >
        <div className="absolute top-1 left-1.5 z-10 text-[10px] text-white/60 font-medium">
          {index + 1}
        </div>

        <Stage width={thumbW} height={thumbH} listening={false}>
          <Layer>
            {/* Fallback background */}
            <Rect width={thumbW} height={thumbH} fill={CANVAS_BG} />

            {slide.layers.map((layer) => {
              switch (layer.type) {
                case "background":
                  return (
                    <ThumbBackground
                      key={layer.id}
                      layer={layer}
                      width={thumbW}
                      height={thumbH}
                    />
                  );
                case "title":
                  return (
                    <ThumbTitle
                      key={layer.id}
                      layer={layer}
                      canvasWidth={thumbW}
                      canvasHeight={thumbH}
                    />
                  );
                case "device":
                  return (
                    <ThumbDevice
                      key={layer.id}
                      layer={layer}
                      canvasWidth={thumbW}
                      canvasHeight={thumbH}
                    />
                  );
                case "image":
                  return (
                    <ThumbImage
                      key={layer.id}
                      layer={layer}
                      canvasWidth={thumbW}
                      canvasHeight={thumbH}
                    />
                  );
                default:
                  return null;
              }
            })}
          </Layer>
        </Stage>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded bg-black/50 text-white/70 hover:text-white"
        >
          <MoreVertical size={12} />
        </button>
      </div>

      {showMenu && (
        <div
          className="absolute top-8 right-0 z-50 bg-surface border border-border rounded-md shadow-xl py-1 min-w-[120px]"
          onMouseLeave={() => setShowMenu(false)}
        >
          <button
            onClick={() => {
              duplicateSlide(slideId);
              setShowMenu(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-muted hover:text-foreground hover:bg-white/5"
          >
            <Copy size={12} /> Duplicate
          </button>
          {index > 0 && (
            <button
              onClick={() => {
                moveSlide(index, index - 1);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-muted hover:text-foreground hover:bg-white/5"
            >
              <ArrowUp size={12} /> Move Up
            </button>
          )}
          {project && index < project.slides.length - 1 && (
            <button
              onClick={() => {
                moveSlide(index, index + 1);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-muted hover:text-foreground hover:bg-white/5"
            >
              <ArrowDown size={12} /> Move Down
            </button>
          )}
          {project && project.slides.length > 1 && (
            <button
              onClick={() => {
                removeSlide(slideId);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400 hover:bg-white/5"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slide strip
// ---------------------------------------------------------------------------

export default function SlideStrip() {
  const project = useEditorStore((s) => s.project);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const addSlide = useEditorStore((s) => s.addSlide);

  if (!project) return null;

  return (
    <div className="w-[200px] bg-surface border-r border-border flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
          Slides
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {project.slides.map((slide, i) => (
          <SlideThumbnail
            key={slide.id}
            slideId={slide.id}
            index={i}
            isActive={slide.id === activeSlideId}
          />
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <button
          onClick={addSlide}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md border border-dashed border-border text-muted hover:text-foreground hover:border-accent transition-colors text-xs"
        >
          <Plus size={14} />
          Add Slide
        </button>
      </div>
    </div>
  );
}
