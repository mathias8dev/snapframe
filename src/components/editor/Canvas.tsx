"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Rect, Text, Group, Image as KonvaImage } from "react-konva";
import Konva from "konva";
import useEditorStore from "@/lib/store";
import { DEVICES } from "@/lib/deviceConfigs";
import {
  BackgroundLayer,
  TitleLayer,
  DeviceLayer,
  ImageLayer,
} from "@/lib/types";

function useLoadImage(url: string | null) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.src = url;
  }, [url]);
  return image;
}

function BackgroundRenderer({
  layer,
  width,
  height,
}: {
  layer: BackgroundLayer;
  width: number;
  height: number;
}) {
  if (!layer.visible) return null;

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

  const padding = layer.padding;
  const availW = canvasWidth - padding * 2;
  const availH = canvasHeight - padding * 2 - 120;

  const devW = device.exportWidth;
  const devH = device.exportHeight;
  const scale = Math.min(availW / devW, availH / devH);

  const frameW = devW * scale;
  const frameH = devH * scale;
  const frameX = (canvasWidth - frameW) / 2;
  const frameY = (canvasHeight - frameH) / 2 + 40;

  const cr =
    layer.cornerRounding === "auto"
      ? device.cornerRadius * scale
      : layer.cornerRounding * scale;

  const screenX = frameX + device.screenInset.left * scale;
  const screenY = frameY + device.screenInset.top * scale;
  const screenW = frameW - (device.screenInset.left + device.screenInset.right) * scale;
  const screenH = frameH - (device.screenInset.top + device.screenInset.bottom) * scale;

  // Rotation pivot: center of the device frame
  const oX = layer.offsetX ?? 0;
  const oY = layer.offsetY ?? 0;
  const pivotX = frameX + frameW / 2;
  const pivotY = frameY + frameH / 2;

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
        const newOX = e.target.x() - pivotX;
        const newOY = e.target.y() - pivotY;
        updateLayer(slideId, layer.id, { offsetX: newOX, offsetY: newOY });
      }}
    >
      {/* Device frame */}
      {layer.frameVisible && (
        <Rect
          x={frameX}
          y={frameY}
          width={frameW}
          height={frameH}
          cornerRadius={cr}
          fill="#1a1a1a"
          stroke={isSelected ? "#7c3aed" : "#333"}
          strokeWidth={isSelected ? 2 : 1}
          opacity={layer.frameOpacity}
        />
      )}

      {/* Screen area */}
      <Group
        clipFunc={(ctx: Konva.Context) => {
          ctx.beginPath();
          const scr = device.cornerRadius * scale * 0.85;
          const sx = screenX;
          const sy = screenY;
          const sw = screenW;
          const sh = screenH;
          ctx.moveTo(sx + scr, sy);
          ctx.lineTo(sx + sw - scr, sy);
          ctx.quadraticCurveTo(sx + sw, sy, sx + sw, sy + scr);
          ctx.lineTo(sx + sw, sy + sh - scr);
          ctx.quadraticCurveTo(sx + sw, sy + sh, sx + sw - scr, sy + sh);
          ctx.lineTo(sx + scr, sy + sh);
          ctx.quadraticCurveTo(sx, sy + sh, sx, sy + sh - scr);
          ctx.lineTo(sx, sy + scr);
          ctx.quadraticCurveTo(sx, sy, sx + scr, sy);
          ctx.closePath();
        }}
      >
        {/* Screen background */}
        <Rect x={screenX} y={screenY} width={screenW} height={screenH} fill="#000" />

        {/* Screenshot image */}
        {screenshotImage && (
          <KonvaImage
            image={screenshotImage}
            x={screenX}
            y={screenY}
            width={screenW}
            height={screenH}
          />
        )}
      </Group>

      {/* Dynamic Island */}
      {device.dynamicIsland && layer.frameVisible && (
        <Rect
          x={frameX + frameW / 2 - 40 * scale}
          y={frameY + 12 * scale}
          width={80 * scale}
          height={24 * scale}
          cornerRadius={12 * scale}
          fill="#000"
        />
      )}

      {/* Notch */}
      {device.notch && !device.dynamicIsland && layer.frameVisible && (
        <Rect
          x={frameX + frameW / 2 - 60 * scale}
          y={frameY}
          width={120 * scale}
          height={28 * scale}
          cornerRadius={[0, 0, 14 * scale, 14 * scale]}
          fill="#1a1a1a"
        />
      )}
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

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 420, height: 840 });
  const project = useEditorStore((s) => s.project);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const setActiveLayer = useEditorStore((s) => s.setActiveLayer);

  const slide = project?.slides.find((s) => s.id === activeSlideId);

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
      className="flex-1 flex items-center justify-center bg-canvas overflow-hidden"
      onClick={(e) => {
        if (e.target === containerRef.current) setActiveLayer(null);
      }}
    >
      <div
        className="rounded-lg shadow-2xl"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleStageClick}
        >
          <Layer>
            <Rect
              id="canvas-bg"
              width={dimensions.width}
              height={dimensions.height}
              fill="#18181b"
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
                default:
                  return null;
              }
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
