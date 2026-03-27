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
  Monitor,
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
// Platform / preset data
// ---------------------------------------------------------------------------

type Platform = "apple" | "google";
type Orientation = "portrait" | "landscape";

interface ExportPreset {
  id: string;
  label: string;
  platform: Platform;
  category: "phone" | "tablet" | "chromebook";
  portraitWidth: number;
  portraitHeight: number;
  notes?: string;
}

const EXPORT_PRESETS: ExportPreset[] = [
  // ── Apple App Store ─────────────────────────────────────────────────
  // iPhone
  { id: "apple-iphone-69", label: 'iPhone 6.9"', platform: "apple", category: "phone", portraitWidth: 1320, portraitHeight: 2868, notes: "iPhone 16 Pro Max / 15 Pro Max / 16 Plus / 15 Plus" },
  { id: "apple-iphone-65", label: 'iPhone 6.5"', platform: "apple", category: "phone", portraitWidth: 1284, portraitHeight: 2778, notes: "iPhone 14 Plus / 13 Pro Max / 12 Pro Max / 11 Pro Max" },
  { id: "apple-iphone-63", label: 'iPhone 6.3"', platform: "apple", category: "phone", portraitWidth: 1206, portraitHeight: 2622, notes: "iPhone 17 Pro / 16 Pro / 15 Pro / 15 / 14 Pro" },
  { id: "apple-iphone-61", label: 'iPhone 6.1"', platform: "apple", category: "phone", portraitWidth: 1170, portraitHeight: 2532, notes: "iPhone 14 / 13 / 12 / SE" },
  { id: "apple-iphone-55", label: 'iPhone 5.5"', platform: "apple", category: "phone", portraitWidth: 1242, portraitHeight: 2208, notes: "iPhone 8 Plus / 7 Plus / 6S Plus" },
  // iPad
  { id: "apple-ipad-13", label: 'iPad Pro 13"', platform: "apple", category: "tablet", portraitWidth: 2064, portraitHeight: 2752, notes: "iPad Pro M4/M5, iPad Air M3/M4" },
  { id: "apple-ipad-129", label: 'iPad Pro 12.9"', platform: "apple", category: "tablet", portraitWidth: 2048, portraitHeight: 2732, notes: "iPad Pro 2nd–6th gen" },
  { id: "apple-ipad-11", label: 'iPad 11"', platform: "apple", category: "tablet", portraitWidth: 1488, portraitHeight: 2266, notes: "iPad Pro 11\", Air, mini, 10th gen" },

  // ── Google Play Store ───────────────────────────────────────────────
  { id: "google-phone", label: "Phone", platform: "google", category: "phone", portraitWidth: 1080, portraitHeight: 1920, notes: "Recommended. Min 320px, max 3840px per side" },
  { id: "google-phone-tall", label: "Phone (Tall 20:9)", platform: "google", category: "phone", portraitWidth: 1080, portraitHeight: 2400, notes: "Modern tall-screen phones" },
  { id: "google-tablet-7", label: '7" Tablet', platform: "google", category: "tablet", portraitWidth: 1200, portraitHeight: 1920, notes: "Required if app targets tablets (min 4 screenshots)" },
  { id: "google-tablet-10", label: '10" Tablet', platform: "google", category: "tablet", portraitWidth: 1600, portraitHeight: 2560, notes: "Required if app targets tablets (min 4 screenshots)" },
  { id: "google-chromebook", label: "Chromebook", platform: "google", category: "chromebook", portraitWidth: 1080, portraitHeight: 1920, notes: "Min 4 screenshots if targeting Chromebook" },
];

const PLATFORM_INFO: Record<Platform, {
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

// ---------------------------------------------------------------------------
// Helper – dimension for orientation
// ---------------------------------------------------------------------------

function getDimensions(preset: ExportPreset, orientation: Orientation) {
  return orientation === "portrait"
    ? { width: preset.portraitWidth, height: preset.portraitHeight }
    : { width: preset.portraitHeight, height: preset.portraitWidth };
}

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
// Category icon helper
// ---------------------------------------------------------------------------

function CategoryIcon({ category }: { category: ExportPreset["category"] }) {
  switch (category) {
    case "phone": return <Smartphone size={14} />;
    case "tablet": return <Tablet size={14} />;
    case "chromebook": return <Monitor size={14} />;
  }
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

  const [platform, setPlatform] = useState<Platform>("apple");
  const [presetId, setPresetId] = useState("apple-iphone-69");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [resolution, setResolution] = useState<1 | 2 | 3>(1);
  const [scope, setScope] = useState<"current" | "all">("current");
  const [exporting, setExporting] = useState(false);

  const platformPresets = useMemo(
    () => EXPORT_PRESETS.filter((p) => p.platform === platform),
    [platform]
  );

  const selectedPreset = EXPORT_PRESETS.find((p) => p.id === presetId) ?? EXPORT_PRESETS[0];
  const { width: exportW, height: exportH } = getDimensions(selectedPreset, orientation);
  const info = PLATFORM_INFO[platform];

  // Format warnings
  const formatWarning = useMemo(() => {
    if (format === "jpeg" && platform === "google") {
      return "Google Play requires 24-bit PNG or JPEG with no transparency.";
    }
    return null;
  }, [format, platform]);

  // Switch preset when platform changes
  const handlePlatformChange = useCallback((p: Platform) => {
    setPlatform(p);
    const first = EXPORT_PRESETS.find((pr) => pr.platform === p);
    if (first) setPresetId(first.id);
    // Google Play doesn't benefit from multiplied resolution the same way
    if (p === "google") setResolution(1);
  }, []);

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
            // ── Background ──────────────────────────────────────
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

            // ── Title ───────────────────────────────────────────
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

            // ── Device frame ────────────────────────────────────
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

              // Apply offset and rotation around the center of the device frame
              const rotationDeg = dl.rotation ?? 0;
              const oX = (dl.offsetX ?? 0) * scaleX;
              const oY = (dl.offsetY ?? 0) * scaleY;
              const pivotX = frameX + frameW / 2;
              const pivotY = frameY + frameH / 2;

              ctx.save();
              ctx.translate(pivotX + oX, pivotY + oY);
              ctx.rotate((rotationDeg * Math.PI) / 180);
              ctx.translate(-pivotX, -pivotY);

              // Draw frame
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

              // Draw screen area (clipped)
              ctx.save();
              drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenCr);
              ctx.clip();

              // Screen background
              ctx.fillStyle = "#000";
              ctx.fillRect(screenX, screenY, screenW, screenH);

              // Screenshot image
              if (dl.screenshotUrl) {
                const ssImg = imageCache.get(dl.screenshotUrl);
                if (ssImg) {
                  ctx.drawImage(ssImg, screenX, screenY, screenW, screenH);
                }
              }
              ctx.restore();

              // Dynamic Island
              if (device.dynamicIsland && dl.frameVisible) {
                const diW = 80 * devScale;
                const diH = 24 * devScale;
                const diX = frameX + frameW / 2 - diW / 2;
                const diY = frameY + 12 * devScale;
                drawRoundedRect(ctx, diX, diY, diW, diH, 12 * devScale);
                ctx.fillStyle = "#000";
                ctx.fill();
              }

              // Notch
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

              ctx.restore(); // restore rotation
              break;
            }

            // ── Image layer ─────────────────────────────────────
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

  // Group presets by category for display
  const grouped = platformPresets.reduce<Record<string, ExportPreset[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    phone: "Phone",
    tablet: "Tablet",
    chromebook: "Chromebook",
  };

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
          {/* ── Platform toggle ──────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Platform
            </h3>
            <div className="flex gap-1">
              {(["apple", "google"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePlatformChange(p)}
                  className={cn(
                    "flex-1 py-2 rounded-md text-xs font-medium transition-colors",
                    platform === p
                      ? "bg-accent text-white"
                      : "bg-background text-muted hover:text-foreground"
                  )}
                >
                  {PLATFORM_INFO[p].name}
                </button>
              ))}
            </div>
          </div>

          {/* ── Platform info banner ─────────────────────────────── */}
          <div className="flex items-start gap-2 text-xs text-muted bg-background rounded-lg px-3 py-2.5 border border-border">
            <Info size={14} className="mt-0.5 flex-shrink-0 text-accent" />
            <div className="space-y-1">
              <div>
                <span className="text-foreground font-medium">Formats:</span>{" "}
                {info.formats.join(", ")} &middot;{" "}
                <span className="text-foreground font-medium">Max size:</span>{" "}
                {info.maxFileSize} &middot;{" "}
                <span className="text-foreground font-medium">Screenshots:</span>{" "}
                {info.minScreenshots}–{info.maxScreenshots} per device
              </div>
              <div className="text-muted">{info.notes}</div>
            </div>
          </div>

          {/* ── Device preset ────────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Device Size
            </h3>
            <div className="space-y-3">
              {Object.entries(grouped).map(([cat, presets]) => (
                <div key={cat}>
                  <div className="text-[10px] uppercase tracking-widest text-muted/60 mb-1.5">
                    {categoryLabels[cat] ?? cat}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {presets.map((p) => {
                      const dim = getDimensions(p, orientation);
                      const isSelected = presetId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setPresetId(p.id)}
                          className={cn(
                            "flex items-start gap-2 px-3 py-2 rounded-lg text-left transition-colors border",
                            isSelected
                              ? "bg-accent/10 border-accent text-foreground"
                              : "bg-background border-border text-muted hover:text-foreground hover:border-accent/30"
                          )}
                        >
                          <CategoryIcon category={p.category} />
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{p.label}</div>
                            <div className="text-[10px] text-muted">
                              {dim.width} × {dim.height}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {selectedPreset.notes && (
              <p className="mt-2 text-[10px] text-muted leading-relaxed">
                {selectedPreset.notes}
              </p>
            )}
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
