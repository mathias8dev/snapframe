"use client";

import React, { useState, useCallback } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import {
  X,
  Download,
  FileImage,
  Package,
} from "lucide-react";
import useEditorStore from "@/lib/store";
import {
  BackgroundLayer,
  TitleLayer,
  Slide,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPORT_PRESETS = [
  { id: "appstore69", label: 'App Store 6.9"', width: 1320, height: 2868 },
  { id: "appstore67", label: 'App Store 6.7"', width: 1290, height: 2796 },
  { id: "appstore61", label: 'App Store 6.1"', width: 1170, height: 2532 },
  { id: "googleplay", label: "Google Play", width: 1080, height: 2400 },
  { id: "custom", label: "Custom", width: 1080, height: 1920 },
];

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
    <div className="rounded-lg overflow-hidden border border-border">
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

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const project = useEditorStore((s) => s.project);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [resolution, setResolution] = useState<1 | 2 | 3>(2);
  const [scope, setScope] = useState<"current" | "all">("current");
  const [preset, setPreset] = useState("appstore69");
  const [exporting, setExporting] = useState(false);

  const selectedPreset = EXPORT_PRESETS.find((p) => p.id === preset) ?? EXPORT_PRESETS[0];

  const handleExport = useCallback(async () => {
    if (!project) return;
    setExporting(true);

    try {
      const slidesToExport =
        scope === "current"
          ? project.slides.filter((s) => s.id === activeSlideId)
          : project.slides;

      if (slidesToExport.length === 1) {
        // Single slide export
        const canvas = document.createElement("canvas");
        canvas.width = selectedPreset.width * resolution;
        canvas.height = selectedPreset.height * resolution;
        const ctx = canvas.getContext("2d")!;
        ctx.scale(resolution, resolution);
        ctx.fillStyle = "#18181b";
        ctx.fillRect(0, 0, selectedPreset.width, selectedPreset.height);

        const slide = slidesToExport[0];
        const bgLayer = slide.layers.find((l) => l.type === "background") as BackgroundLayer | undefined;

        if (bgLayer) {
          if (bgLayer.kind === "solid") {
            ctx.fillStyle = bgLayer.color1;
            ctx.fillRect(0, 0, selectedPreset.width, selectedPreset.height);
          } else if (bgLayer.kind === "gradient") {
            const rad = (bgLayer.angle * Math.PI) / 180;
            const cx = selectedPreset.width / 2;
            const cy = selectedPreset.height / 2;
            const len = Math.sqrt(selectedPreset.width ** 2 + selectedPreset.height ** 2) / 2;
            const grad = ctx.createLinearGradient(
              cx - Math.cos(rad) * len,
              cy - Math.sin(rad) * len,
              cx + Math.cos(rad) * len,
              cy + Math.sin(rad) * len
            );
            grad.addColorStop(0, bgLayer.color1);
            grad.addColorStop(1, bgLayer.color2);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, selectedPreset.width, selectedPreset.height);
          }
        }

        const titleLayer = slide.layers.find((l) => l.type === "title") as TitleLayer | undefined;
        if (titleLayer && titleLayer.visible) {
          const scaledFontSize = (titleLayer.fontSize / 420) * selectedPreset.width;
          ctx.font = `${titleLayer.fontWeight >= 700 ? "bold" : "normal"} ${scaledFontSize}px ${titleLayer.fontFamily}`;
          ctx.fillStyle = titleLayer.color;
          ctx.textAlign = titleLayer.align;
          const textX =
            titleLayer.align === "center"
              ? selectedPreset.width / 2
              : titleLayer.align === "right"
              ? selectedPreset.width - 40
              : 40;
          const textY =
            titleLayer.position === "top"
              ? (titleLayer.y / 840) * selectedPreset.height
              : selectedPreset.height - (titleLayer.y / 840) * selectedPreset.height;
          ctx.fillText(titleLayer.text, textX, textY + scaledFontSize);
        }

        const mimeType = `image/${format}`;
        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${project.name}-slide.${format}`;
            a.click();
            URL.revokeObjectURL(url);
          },
          mimeType,
          0.95
        );
      } else {
        // Multi-slide export with JSZip
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();

        for (let i = 0; i < slidesToExport.length; i++) {
          const slide = slidesToExport[i];
          const canvas = document.createElement("canvas");
          canvas.width = selectedPreset.width * resolution;
          canvas.height = selectedPreset.height * resolution;
          const ctx = canvas.getContext("2d")!;
          ctx.scale(resolution, resolution);

          const bgLayer = slide.layers.find((l) => l.type === "background") as BackgroundLayer | undefined;
          if (bgLayer) {
            if (bgLayer.kind === "solid") {
              ctx.fillStyle = bgLayer.color1;
              ctx.fillRect(0, 0, selectedPreset.width, selectedPreset.height);
            } else if (bgLayer.kind === "gradient") {
              const rad = (bgLayer.angle * Math.PI) / 180;
              const cx = selectedPreset.width / 2;
              const cy = selectedPreset.height / 2;
              const len = Math.sqrt(selectedPreset.width ** 2 + selectedPreset.height ** 2) / 2;
              const grad = ctx.createLinearGradient(
                cx - Math.cos(rad) * len, cy - Math.sin(rad) * len,
                cx + Math.cos(rad) * len, cy + Math.sin(rad) * len
              );
              grad.addColorStop(0, bgLayer.color1);
              grad.addColorStop(1, bgLayer.color2);
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, selectedPreset.width, selectedPreset.height);
            }
          }

          const titleLayer = slide.layers.find((l) => l.type === "title") as TitleLayer | undefined;
          if (titleLayer && titleLayer.visible) {
            const scaledFontSize = (titleLayer.fontSize / 420) * selectedPreset.width;
            ctx.font = `${titleLayer.fontWeight >= 700 ? "bold" : "normal"} ${scaledFontSize}px ${titleLayer.fontFamily}`;
            ctx.fillStyle = titleLayer.color;
            ctx.textAlign = titleLayer.align;
            const textX =
              titleLayer.align === "center"
                ? selectedPreset.width / 2
                : titleLayer.align === "right"
                ? selectedPreset.width - 40
                : 40;
            const textY =
              titleLayer.position === "top"
                ? (titleLayer.y / 840) * selectedPreset.height
                : selectedPreset.height - (titleLayer.y / 840) * selectedPreset.height;
            ctx.fillText(titleLayer.text, textX, textY + scaledFontSize);
          }

          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob(
              (b) => resolve(b!),
              `image/${format}`,
              0.95
            );
          });
          zip.file(`slide-${i + 1}.${format}`, blob);
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
  }, [project, activeSlideId, format, resolution, scope, selectedPreset]);

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

        <div className="p-4 flex flex-col gap-4">
          {/* Preview */}
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
                  width={selectedPreset.width}
                  height={selectedPreset.height}
                />
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Format
            </h3>
            <div className="flex gap-1">
              {(["png", "jpeg", "webp"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs uppercase",
                    format === f
                      ? "bg-accent text-white"
                      : "bg-background text-muted hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Resolution
            </h3>
            <div className="flex gap-1">
              {([1, 2, 3] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setResolution(r)}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs",
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

          {/* Scope */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Export Scope
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setScope("current")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs",
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
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs",
                  scope === "all"
                    ? "bg-accent text-white"
                    : "bg-background text-muted hover:text-foreground"
                )}
              >
                <Package size={12} /> All Slides (ZIP)
              </button>
            </div>
          </div>

          {/* Size Preset */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Size Preset
            </h3>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground"
            >
              {EXPORT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.width}×{p.height})
                </option>
              ))}
            </select>
          </div>

          {/* Export size info */}
          <div className="text-xs text-muted bg-background rounded-md px-3 py-2">
            Output: {selectedPreset.width * resolution}×
            {selectedPreset.height * resolution}px ({resolution}x)
          </div>

          {/* Export button */}
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
