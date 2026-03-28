"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import {
  X,
  Download,
  FileImage,
  Package,
  Smartphone,
  Tablet,
  AlertTriangle,
  Info,
} from "lucide-react";
import useEditorStore from "@/lib/store";
import { DEVICES } from "@/lib/deviceConfigs";
import {
  BackgroundLayer,
  TitleLayer,
  DeviceLayer,
  ImageLayer,
  Slide,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Store spec info
// ---------------------------------------------------------------------------

type StorePlatform = "apple" | "google";
type Orientation = "portrait" | "landscape";

const STORE_INFO: Record<StorePlatform, {
  name: string;
  formats: string[];
  maxFileSize: string;
  maxScreenshots: number;
  minScreenshots: number;
  notes: string;
}> = {
  apple: {
    name: "Apple App Store",
    formats: ["PNG", "JPEG"],
    maxFileSize: "10 MB",
    maxScreenshots: 10,
    minScreenshots: 1,
    notes: "Providing the largest device size auto-scales to smaller sizes. sRGB or Display P3 color space.",
  },
  google: {
    name: "Google Play Store",
    formats: ["PNG", "JPEG"],
    maxFileSize: "8 MB",
    maxScreenshots: 8,
    minScreenshots: 2,
    notes: "No alpha/transparency allowed in PNG. Longest side must not exceed 2× the shortest side.",
  },
};

// Store-specific additional sizes the user may need for their listing
interface StoreSize {
  id: string;
  label: string;
  width: number;
  height: number;
  notes: string;
}

const APPLE_STORE_SIZES: StoreSize[] = [
  { id: "apple-69", label: 'iPhone 6.9"', width: 1320, height: 2868, notes: "iPhone 16 Pro Max / 15 Pro Max" },
  { id: "apple-65", label: 'iPhone 6.5"', width: 1284, height: 2778, notes: "iPhone 14 Plus / 13 Pro Max" },
  { id: "apple-63", label: 'iPhone 6.3"', width: 1206, height: 2622, notes: "iPhone 16 Pro / 15 Pro" },
  { id: "apple-61", label: 'iPhone 6.1"', width: 1170, height: 2532, notes: "iPhone 14 / 13 / SE" },
  { id: "apple-55", label: 'iPhone 5.5"', width: 1242, height: 2208, notes: "iPhone 8 Plus / 7 Plus" },
  { id: "apple-ipad-13", label: 'iPad Pro 13"', width: 2064, height: 2752, notes: "iPad Pro M4/M5, Air M3/M4" },
  { id: "apple-ipad-129", label: 'iPad Pro 12.9"', width: 2048, height: 2732, notes: "iPad Pro 2nd–6th gen" },
  { id: "apple-ipad-11", label: 'iPad 11"', width: 1488, height: 2266, notes: 'iPad Pro 11", Air, mini' },
];

const GOOGLE_STORE_SIZES: StoreSize[] = [
  { id: "google-phone", label: "Phone (16:9)", width: 1080, height: 1920, notes: "Standard recommended" },
  { id: "google-phone-tall", label: "Phone (20:9)", width: 1080, height: 2400, notes: "Modern tall-screen phones" },
  { id: "google-tablet-7", label: '7" Tablet', width: 1200, height: 1920, notes: "Min 4 screenshots if targeting tablets" },
  { id: "google-tablet-10", label: '10" Tablet', width: 1600, height: 2560, notes: "Min 4 screenshots if targeting tablets" },
];

// ---------------------------------------------------------------------------
// Preview thumbnail
// ---------------------------------------------------------------------------

function ExportPreviewSlide({
  slide,
  width,
  height,
}: {
  slide: Slide;
  width: number;
  height: number;
}) {
  const thumbW = 120;
  const thumbH = (height / width) * thumbW;

  const bgLayer = slide.layers.find((l) => l.type === "background") as BackgroundLayer | undefined;
  const titleLayer = slide.layers.find((l) => l.type === "title") as TitleLayer | undefined;

  return (
    <div className="rounded-lg overflow-hidden border border-border flex-shrink-0">
      <Stage width={thumbW} height={Math.min(thumbH, 220)} listening={false}>
        <Layer>
          {bgLayer && bgLayer.kind === "gradient" ? (
            <Rect
              width={thumbW}
              height={thumbH}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: thumbW, y: thumbH }}
              fillLinearGradientColorStops={[0, bgLayer.color1, 1, bgLayer.color2]}
            />
          ) : bgLayer ? (
            <Rect width={thumbW} height={thumbH} fill={bgLayer.color1} />
          ) : (
            <Rect width={thumbW} height={thumbH} fill="#27272a" />
          )}
          {titleLayer && titleLayer.visible && (
            <Text
              text={titleLayer.text}
              x={6}
              y={titleLayer.position === "top" ? 16 : Math.min(thumbH, 220) - 28}
              width={thumbW - 12}
              fontSize={8}
              fontFamily={titleLayer.fontFamily}
              fill={titleLayer.color}
              align={titleLayer.align}
            />
          )}
          <Rect
            x={thumbW * 0.2}
            y={Math.min(thumbH, 220) * 0.22}
            width={thumbW * 0.6}
            height={Math.min(thumbH, 220) * 0.6}
            cornerRadius={4}
            fill="#1a1a1a"
            stroke="#333"
            strokeWidth={0.5}
          />
        </Layer>
      </Stage>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const project = useEditorStore((s) => s.project);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);

  // Derive platform from the project's device target
  const targetDevice = project ? DEVICES[project.deviceTarget] : null;
  const storePlatform: StorePlatform = targetDevice?.category === "android" ? "google" : "apple";
  const storeInfo = STORE_INFO[storePlatform];
  const storeSizes = storePlatform === "apple" ? APPLE_STORE_SIZES : GOOGLE_STORE_SIZES;

  // "device" = use the project's device native dimensions, or a store size id
  const [sizeMode, setSizeMode] = useState<"device" | string>("device");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [resolution, setResolution] = useState<1 | 2 | 3>(1);
  const [scope, setScope] = useState<"current" | "all">("current");
  const [exporting, setExporting] = useState(false);

  // Compute export dimensions
  const { exportW, exportH } = useMemo(() => {
    let w: number, h: number;
    if (sizeMode === "device" && targetDevice) {
      w = targetDevice.exportWidth;
      h = targetDevice.exportHeight;
    } else {
      const storeSize = storeSizes.find((s) => s.id === sizeMode);
      if (storeSize) {
        w = storeSize.width;
        h = storeSize.height;
      } else if (targetDevice) {
        w = targetDevice.exportWidth;
        h = targetDevice.exportHeight;
      } else {
        w = 1080;
        h = 1920;
      }
    }
    return orientation === "portrait"
      ? { exportW: w, exportH: h }
      : { exportW: h, exportH: w };
  }, [sizeMode, targetDevice, storeSizes, orientation]);

  // Format warnings
  const formatWarning = useMemo(() => {
    if (format === "jpeg" && storePlatform === "google") {
      return "Google Play requires 24-bit PNG or JPEG with no transparency.";
    }
    return null;
  }, [format, storePlatform]);

  // ── Export handler ──────────────────────────────────────────────────

  const handleExport = useCallback(async () => {
    if (!project) return;
    setExporting(true);

    try {
      const slidesToExport =
        scope === "current"
          ? project.slides.filter((s) => s.id === activeSlideId)
          : project.slides;

      // Reference canvas size used by the editor (Canvas.tsx defaults)
      const REF_W = 420;
      const REF_H = 840;
      const scaleX = exportW / REF_W;
      const scaleY = exportH / REF_H;

      const loadImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });

      const drawRoundedRect = (
        ctx: CanvasRenderingContext2D,
        x: number, y: number, w: number, h: number, r: number,
      ) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      };

      const renderSlide = async (slide: Slide): Promise<Blob> => {
        const canvas = document.createElement("canvas");
        canvas.width = exportW * resolution;
        canvas.height = exportH * resolution;
        const ctx = canvas.getContext("2d")!;
        ctx.scale(resolution, resolution);
        ctx.fillStyle = "#18181b";
        ctx.fillRect(0, 0, exportW, exportH);

        // Pre-load all images needed by this slide
        const imageCache = new Map<string, HTMLImageElement>();
        const urlsToLoad: string[] = [];
        for (const layer of slide.layers) {
          if (layer.type === "device" && layer.screenshotUrl) urlsToLoad.push(layer.screenshotUrl);
          if (layer.type === "image" && layer.url) urlsToLoad.push(layer.url);
          if (layer.type === "background" && layer.kind === "image" && layer.imageUrl) urlsToLoad.push(layer.imageUrl);
        }
        await Promise.all(
          urlsToLoad.map(async (url) => {
            try {
              imageCache.set(url, await loadImage(url));
            } catch { /* skip broken images */ }
          })
        );

        // Draw layers in order (same order as Canvas.tsx)
        for (const layer of slide.layers) {
          if (!layer.visible) continue;

          switch (layer.type) {
            case "background": {
              const bg = layer as BackgroundLayer;
              if (bg.kind === "solid") {
                ctx.fillStyle = bg.color1;
                ctx.fillRect(0, 0, exportW, exportH);
              } else if (bg.kind === "gradient") {
                const rad = (bg.angle * Math.PI) / 180;
                const cx = exportW / 2;
                const cy = exportH / 2;
                const len = Math.sqrt(exportW ** 2 + exportH ** 2) / 2;
                const grad = ctx.createLinearGradient(
                  cx - Math.cos(rad) * len, cy - Math.sin(rad) * len,
                  cx + Math.cos(rad) * len, cy + Math.sin(rad) * len,
                );
                grad.addColorStop(0, bg.color1);
                grad.addColorStop(1, bg.color2);
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, exportW, exportH);
              } else if (bg.kind === "image" && bg.imageUrl) {
                const img = imageCache.get(bg.imageUrl);
                if (img) ctx.drawImage(img, 0, 0, exportW, exportH);
              }
              break;
            }

            case "title": {
              const tl = layer as TitleLayer;
              const scaledFontSize = (tl.fontSize / REF_W) * exportW;
              ctx.font = `${tl.fontWeight >= 700 ? "bold" : "normal"} ${scaledFontSize}px ${tl.fontFamily}`;
              ctx.fillStyle = tl.color;
              ctx.textAlign = tl.align;

              const textWidth = (tl.width / 100) * exportW;
              const textX =
                tl.x !== 0
                  ? (tl.x / 100) * exportW + (tl.align === "center" ? textWidth / 2 : tl.align === "right" ? textWidth : 0)
                  : tl.align === "center"
                  ? exportW / 2
                  : tl.align === "right"
                  ? exportW - (40 * scaleX)
                  : 40 * scaleX;
              const textY =
                tl.position === "top"
                  ? (tl.y / REF_H) * exportH
                  : exportH - (tl.y / REF_H) * exportH - scaledFontSize * 1.5;
              ctx.fillText(tl.text, textX, textY + scaledFontSize);
              break;
            }

            case "device": {
              const dl = layer as DeviceLayer;
              const device = DEVICES[dl.deviceId];
              if (!device) break;

              const padding = dl.padding * scaleX;
              const availW = exportW - padding * 2;
              const availH = exportH - padding * 2 - (120 * scaleY);

              const devW = device.exportWidth;
              const devH = device.exportHeight;
              const devScale = Math.min(availW / devW, availH / devH);

              const frameW = devW * devScale;
              const frameH = devH * devScale;
              const frameX = (exportW - frameW) / 2;
              const frameY = (exportH - frameH) / 2 + (40 * scaleY);

              const cr =
                dl.cornerRounding === "auto"
                  ? device.cornerRadius * devScale
                  : dl.cornerRounding * devScale;

              const screenX = frameX + device.screenInset.left * devScale;
              const screenY = frameY + device.screenInset.top * devScale;
              const screenW = frameW - (device.screenInset.left + device.screenInset.right) * devScale;
              const screenH = frameH - (device.screenInset.top + device.screenInset.bottom) * devScale;
              const screenCr = cr * 0.85;

              const rotationDeg = dl.rotation ?? 0;
              const oX = (dl.offsetX ?? 0) * scaleX;
              const oY = (dl.offsetY ?? 0) * scaleY;
              const pivotX = frameX + frameW / 2;
              const pivotY = frameY + frameH / 2;

              ctx.save();
              ctx.translate(pivotX + oX, pivotY + oY);
              ctx.rotate((rotationDeg * Math.PI) / 180);
              ctx.translate(-pivotX, -pivotY);

              if (dl.frameVisible) {
                ctx.save();
                ctx.globalAlpha = dl.frameOpacity;
                drawRoundedRect(ctx, frameX, frameY, frameW, frameH, cr);
                ctx.fillStyle = "#1a1a1a";
                ctx.fill();
                ctx.strokeStyle = "#333";
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
              }

              ctx.save();
              drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenCr);
              ctx.clip();
              ctx.fillStyle = "#000";
              ctx.fillRect(screenX, screenY, screenW, screenH);
              if (dl.screenshotUrl) {
                const ssImg = imageCache.get(dl.screenshotUrl);
                if (ssImg) ctx.drawImage(ssImg, screenX, screenY, screenW, screenH);
              }
              ctx.restore();

              if (device.dynamicIsland && dl.frameVisible) {
                const diW = 80 * devScale;
                const diH = 24 * devScale;
                const diX = frameX + frameW / 2 - diW / 2;
                const diY = frameY + 12 * devScale;
                drawRoundedRect(ctx, diX, diY, diW, diH, 12 * devScale);
                ctx.fillStyle = "#000";
                ctx.fill();
              }

              if (device.notch && !device.dynamicIsland && dl.frameVisible) {
                const nW = 120 * devScale;
                const nH = 28 * devScale;
                const nX = frameX + frameW / 2 - nW / 2;
                const nY = frameY;
                const nR = 14 * devScale;
                ctx.beginPath();
                ctx.moveTo(nX, nY);
                ctx.lineTo(nX + nW, nY);
                ctx.lineTo(nX + nW, nY + nH - nR);
                ctx.quadraticCurveTo(nX + nW, nY + nH, nX + nW - nR, nY + nH);
                ctx.lineTo(nX + nR, nY + nH);
                ctx.quadraticCurveTo(nX, nY + nH, nX, nY + nH - nR);
                ctx.closePath();
                ctx.fillStyle = "#1a1a1a";
                ctx.fill();
              }

              // Hardware buttons
              if (dl.frameVisible && device.buttons) {
                for (const btn of device.buttons) {
                  const thickness = 3 * devScale;
                  const btnRadius = thickness / 2;
                  let bx: number, by: number, bw: number, bh: number;

                  if (btn.side === "right") {
                    bx = frameX + frameW;
                    by = frameY + btn.offsetPercent * frameH;
                    bw = thickness;
                    bh = btn.lengthPercent * frameH;
                  } else if (btn.side === "left") {
                    bx = frameX - thickness;
                    by = frameY + btn.offsetPercent * frameH;
                    bw = thickness;
                    bh = btn.lengthPercent * frameH;
                  } else {
                    bx = frameX + btn.offsetPercent * frameW;
                    by = frameY - thickness;
                    bw = btn.lengthPercent * frameW;
                    bh = thickness;
                  }

                  drawRoundedRect(ctx, bx, by, bw, bh, btnRadius);
                  ctx.fillStyle = "#1a1a1a";
                  ctx.fill();
                }
              }

              ctx.restore();
              break;
            }

            case "image": {
              const il = layer as ImageLayer;
              const img = imageCache.get(il.url);
              if (!img) break;
              ctx.save();
              ctx.globalAlpha = il.opacity;
              const imgW = (il.width || REF_W * 0.5) * scaleX;
              const imgH = (il.height || REF_H * 0.5) * scaleY;
              ctx.drawImage(img, il.x * scaleX, il.y * scaleY, imgW, imgH);
              ctx.restore();
              break;
            }
          }
        }

        return new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (b) => resolve(b!),
            `image/${format}`,
            format === "jpeg" ? 0.95 : undefined,
          );
        });
      };

      if (slidesToExport.length === 1) {
        const blob = await renderSlide(slidesToExport[0]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${project.name}-slide.${format === "jpeg" ? "jpg" : format}`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        for (let i = 0; i < slidesToExport.length; i++) {
          const blob = await renderSlide(slidesToExport[i]);
          zip.file(`slide-${i + 1}.${format === "jpeg" ? "jpg" : format}`, blob);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${project.name}-slides.zip`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  }, [project, activeSlideId, format, resolution, scope, exportW, exportH]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Export Screenshots</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-5">
          {/* ── Store info (auto-detected) ──────────────────────── */}
          <div className="flex items-start gap-2 text-xs text-muted bg-background rounded-lg px-3 py-2.5 border border-border">
            <Info size={14} className="mt-0.5 flex-shrink-0 text-accent" />
            <div className="space-y-1">
              <div>
                <span className="text-foreground font-medium">{storeInfo.name}</span>{" "}
                (detected from {targetDevice?.name ?? "project target"})
              </div>
              <div>
                <span className="text-foreground font-medium">Formats:</span>{" "}
                {storeInfo.formats.join(", ")} &middot;{" "}
                <span className="text-foreground font-medium">Max size:</span>{" "}
                {storeInfo.maxFileSize} &middot;{" "}
                <span className="text-foreground font-medium">Screenshots:</span>{" "}
                {storeInfo.minScreenshots}–{storeInfo.maxScreenshots} per device
              </div>
              <div className="text-muted">{storeInfo.notes}</div>
            </div>
          </div>

          {/* ── Export size ──────────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Export Size
            </h3>

            {/* Device native option */}
            {targetDevice && (
              <button
                onClick={() => setSizeMode("device")}
                className={cn(
                  "w-full flex items-start gap-2 px-3 py-2.5 rounded-lg text-left transition-colors border mb-2",
                  sizeMode === "device"
                    ? "bg-accent/10 border-accent text-foreground"
                    : "bg-background border-border text-muted hover:text-foreground hover:border-accent/30"
                )}
              >
                <Smartphone size={14} className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{targetDevice.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">Recommended</span>
                  </div>
                  <div className="text-[10px] text-muted">
                    {orientation === "portrait"
                      ? `${targetDevice.exportWidth} × ${targetDevice.exportHeight}`
                      : `${targetDevice.exportHeight} × ${targetDevice.exportWidth}`}
                    px — native device resolution
                  </div>
                </div>
              </button>
            )}

            {/* Store-specific sizes */}
            <div className="text-[10px] uppercase tracking-widest text-muted/60 mb-1.5 mt-3">
              {storePlatform === "apple" ? "App Store" : "Play Store"} sizes
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {storeSizes.map((s) => {
                const isSelected = sizeMode === s.id;
                const w = orientation === "portrait" ? s.width : s.height;
                const h = orientation === "portrait" ? s.height : s.width;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSizeMode(s.id)}
                    className={cn(
                      "flex items-start gap-2 px-3 py-2 rounded-lg text-left transition-colors border",
                      isSelected
                        ? "bg-accent/10 border-accent text-foreground"
                        : "bg-background border-border text-muted hover:text-foreground hover:border-accent/30"
                    )}
                  >
                    <Tablet size={14} className="mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{s.label}</div>
                      <div className="text-[10px] text-muted">{w} × {h}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Orientation ──────────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Orientation
            </h3>
            <div className="flex gap-1">
              {(["portrait", "landscape"] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setOrientation(o)}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs capitalize transition-colors",
                    orientation === o
                      ? "bg-accent text-white"
                      : "bg-background text-muted hover:text-foreground"
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* ── Format ───────────────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Format
            </h3>
            <div className="flex gap-1">
              {(["png", "jpeg"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs uppercase transition-colors",
                    format === f
                      ? "bg-accent text-white"
                      : "bg-background text-muted hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            {formatWarning && (
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-yellow-400">
                <AlertTriangle size={12} /> {formatWarning}
              </div>
            )}
          </div>

          {/* ── Resolution ───────────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Resolution Multiplier
            </h3>
            <div className="flex gap-1">
              {([1, 2, 3] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setResolution(r)}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs transition-colors",
                    resolution === r
                      ? "bg-accent text-white"
                      : "bg-background text-muted hover:text-foreground"
                  )}
                >
                  {r}x
                </button>
              ))}
            </div>
          </div>

          {/* ── Scope ────────────────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Export Scope
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setScope("current")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-colors",
                  scope === "current"
                    ? "bg-accent text-white"
                    : "bg-background text-muted hover:text-foreground"
                )}
              >
                <FileImage size={12} /> Current Slide
              </button>
              <button
                onClick={() => setScope("all")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-colors",
                  scope === "all"
                    ? "bg-accent text-white"
                    : "bg-background text-muted hover:text-foreground"
                )}
              >
                <Package size={12} /> All Slides (ZIP)
              </button>
            </div>
          </div>

          {/* ── Preview ──────────────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Preview
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(scope === "current"
                ? project.slides.filter((s) => s.id === activeSlideId)
                : project.slides
              ).map((slide) => (
                <ExportPreviewSlide
                  key={slide.id}
                  slide={slide}
                  width={exportW}
                  height={exportH}
                />
              ))}
            </div>
          </div>

          {/* ── Output summary ───────────────────────────────────── */}
          <div className="text-xs text-muted bg-background rounded-lg px-3 py-2.5 border border-border flex items-center justify-between">
            <span>
              Output: <span className="text-foreground font-medium">{exportW * resolution} × {exportH * resolution}px</span>{" "}
              ({resolution}x) &middot; {format.toUpperCase()}
            </span>
            <span className="text-muted">
              {scope === "all" ? `${project.slides.length} slides` : "1 slide"}
            </span>
          </div>

          {/* ── Export button ─────────────────────────────────────── */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? "Exporting..." : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
}
