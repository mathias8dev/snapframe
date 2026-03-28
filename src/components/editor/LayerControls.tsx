"use client";

import React, { useRef } from "react";
import { HexColorPicker } from "react-colorful";
import {
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import useEditorStore from "@/lib/store";
import { DEVICE_LIST } from "@/lib/deviceConfigs";
import {
  BackgroundLayer,
  TitleLayer,
  DeviceLayer,
  ImageLayer,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const FONTS = [
  "Inter",
  "Playfair Display",
  "Poppins",
  "Montserrat",
  "Space Grotesk",
  "DM Sans",
];

const PROJECT_COLORS = [
  "#7c3aed", "#2563eb", "#dc2626", "#059669", "#d97706",
  "#ec4899", "#8b5cf6", "#06b6d4", "#f97316", "#10b981",
  "#ffffff", "#000000",
];

function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="text-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5
                   [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
}

function ColorPickerControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 rounded-md border border-border cursor-pointer shrink-0"
          style={{ backgroundColor: value }}
          onClick={() => setOpen(!open)}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-surface border border-border rounded-md px-2 py-1 text-xs text-foreground"
        />
      </div>
      {open && (
        <div className="mt-1">
          <HexColorPicker color={value} onChange={onChange} />
          <div className="flex flex-wrap gap-1 mt-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                className={cn(
                  "w-5 h-5 rounded border",
                  c === value ? "border-accent" : "border-border"
                )}
                style={{ backgroundColor: c }}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BackgroundControls({
  layer,
  slideId,
}: {
  layer: BackgroundLayer;
  slideId: string;
}) {
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const update = (patch: Partial<BackgroundLayer>) =>
    updateLayer(slideId, layer.id, patch);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        {(["solid", "gradient", "image"] as const).map((kind) => (
          <button
            key={kind}
            onClick={() => update({ kind })}
            className={cn(
              "flex-1 px-2 py-1.5 rounded-md text-xs capitalize",
              layer.kind === kind
                ? "bg-accent text-white"
                : "bg-surface text-muted hover:text-foreground"
            )}
          >
            {kind}
          </button>
        ))}
      </div>

      <ColorPickerControl
        label="Color 1"
        value={layer.color1}
        onChange={(v) => update({ color1: v })}
      />

      {layer.kind === "gradient" && (
        <>
          <ColorPickerControl
            label="Color 2"
            value={layer.color2}
            onChange={(v) => update({ color2: v })}
          />
          <SliderControl
            label="Angle"
            value={layer.angle}
            min={0}
            max={360}
            onChange={(v) => update({ angle: v })}
          />
        </>
      )}
    </div>
  );
}

function TitleControls({
  layer,
  slideId,
}: {
  layer: TitleLayer;
  slideId: string;
}) {
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const update = (patch: Partial<TitleLayer>) =>
    updateLayer(slideId, layer.id, patch);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">Text</span>
        <textarea
          value={layer.text}
          onChange={(e) => update({ text: e.target.value })}
          rows={3}
          className="bg-surface border border-border rounded-md px-2 py-1.5 text-sm text-foreground resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">Font Family</span>
        <select
          value={layer.fontFamily}
          onChange={(e) => update({ fontFamily: e.target.value })}
          className="bg-surface border border-border rounded-md px-2 py-1.5 text-sm text-foreground"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <SliderControl
        label="Font Size"
        value={layer.fontSize}
        min={12}
        max={120}
        onChange={(v) => update({ fontSize: v })}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">Font Weight</span>
        <select
          value={layer.fontWeight}
          onChange={(e) => update({ fontWeight: Number(e.target.value) })}
          className="bg-surface border border-border rounded-md px-2 py-1.5 text-sm text-foreground"
        >
          {[300, 400, 500, 600, 700, 800, 900].map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      <ColorPickerControl
        label="Color"
        value={layer.color}
        onChange={(v) => update({ color: v })}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">Alignment</span>
        <div className="flex gap-1">
          {([
            { value: "left", icon: AlignLeft },
            { value: "center", icon: AlignCenter },
            { value: "right", icon: AlignRight },
          ] as const).map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => update({ align: value })}
              className={cn(
                "flex-1 flex justify-center py-1.5 rounded-md",
                layer.align === value
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:text-foreground"
              )}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">Position</span>
        <div className="flex gap-1">
          {([
            { value: "top", icon: ArrowUpToLine },
            { value: "bottom", icon: ArrowDownToLine },
          ] as const).map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => update({ position: value })}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs",
                layer.position === value
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:text-foreground"
              )}
            >
              <Icon size={14} />
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeviceControls({
  layer,
  slideId,
}: {
  layer: DeviceLayer;
  slideId: string;
}) {
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const project = useEditorStore((s) => s.project);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const update = (patch: Partial<DeviceLayer>) =>
    updateLayer(slideId, layer.id, patch);

  // Filter devices by the project's target device category
  const targetDevice = DEVICE_LIST.find((d) => d.id === project?.deviceTarget);
  const filteredDevices = targetDevice
    ? DEVICE_LIST.filter((d) => d.category === targetDevice.category)
    : DEVICE_LIST;

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ screenshotUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm transition-colors"
      >
        <Upload size={14} />
        {layer.screenshotUrl ? "Change Screenshot" : "Add Screenshot"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleScreenshotUpload}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">Device</span>
        <select
          value={layer.deviceId}
          onChange={(e) => update({ deviceId: e.target.value })}
          className="bg-surface border border-border rounded-md px-2 py-1.5 text-sm text-foreground"
        >
          {filteredDevices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">Frame</span>
        <div className="flex gap-1">
          <button
            onClick={() => update({ frameVisible: true })}
            className={cn(
              "flex-1 py-1.5 rounded-md text-xs",
              layer.frameVisible
                ? "bg-accent text-white"
                : "bg-surface text-muted hover:text-foreground"
            )}
          >
            Show Frame
          </button>
          <button
            onClick={() => update({ frameVisible: false })}
            className={cn(
              "flex-1 py-1.5 rounded-md text-xs",
              !layer.frameVisible
                ? "bg-accent text-white"
                : "bg-surface text-muted hover:text-foreground"
            )}
          >
            No Frame
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">Orientation</span>
        <div className="flex gap-1">
          {(["portrait", "landscape"] as const).map((o) => (
            <button
              key={o}
              onClick={() => update({ orientation: o })}
              className={cn(
                "flex-1 py-1.5 rounded-md text-xs capitalize",
                layer.orientation === o
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:text-foreground"
              )}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">Sizing</span>
        <div className="flex gap-1">
          {(["contain", "fill", "cover"] as const).map((s) => (
            <button
              key={s}
              onClick={() => update({ sizing: s })}
              className={cn(
                "flex-1 py-1.5 rounded-md text-xs capitalize",
                layer.sizing === s
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <SliderControl
        label="Corner Rounding"
        value={layer.cornerRounding === "auto" ? 0 : layer.cornerRounding}
        min={0}
        max={300}
        onChange={(v) => update({ cornerRounding: v === 0 ? "auto" : v })}
      />

      <SliderControl
        label="Offset X"
        value={layer.offsetX ?? 0}
        min={-500}
        max={500}
        onChange={(v) => update({ offsetX: v })}
      />

      <SliderControl
        label="Offset Y"
        value={layer.offsetY ?? 0}
        min={-500}
        max={500}
        onChange={(v) => update({ offsetY: v })}
      />

      <SliderControl
        label="Rotation"
        value={layer.rotation ?? 0}
        min={-180}
        max={180}
        onChange={(v) => update({ rotation: v })}
      />

      <SliderControl
        label="Frame Opacity"
        value={Math.round(layer.frameOpacity * 100)}
        min={0}
        max={100}
        onChange={(v) => update({ frameOpacity: v / 100 })}
      />

      <SliderControl
        label="Padding"
        value={layer.padding}
        min={0}
        max={300}
        onChange={(v) => update({ padding: v })}
      />
    </div>
  );
}

function ImageControls({
  layer,
  slideId,
}: {
  layer: ImageLayer;
  slideId: string;
}) {
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const reorderLayers = useEditorStore((s) => s.reorderLayers);
  const project = useEditorStore((s) => s.project);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const update = (patch: Partial<ImageLayer>) =>
    updateLayer(slideId, layer.id, patch);

  const slide = project?.slides.find((s) => s.id === activeSlideId);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ url: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm transition-colors"
      >
        <Upload size={14} />
        Change Image
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      <SliderControl
        label="Opacity"
        value={Math.round(layer.opacity * 100)}
        min={0}
        max={100}
        onChange={(v) => update({ opacity: v / 100 })}
      />

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "X", key: "x" as const, value: layer.x },
          { label: "Y", key: "y" as const, value: layer.y },
          { label: "Width", key: "width" as const, value: layer.width },
          { label: "Height", key: "height" as const, value: layer.height },
        ].map(({ label, key, value }) => (
          <div key={key} className="flex flex-col gap-1">
            <span className="text-xs text-muted">{label}</span>
            <input
              type="number"
              value={Math.round(value)}
              onChange={(e) => update({ [key]: Number(e.target.value) })}
              className="bg-surface border border-border rounded-md px-2 py-1 text-xs text-foreground"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => {
            if (!slide) return;
            const idx = slide.layers.findIndex((l) => l.id === layer.id);
            if (idx > 0) reorderLayers(slideId, idx, 0);
          }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-surface text-muted hover:text-foreground rounded-md text-xs"
        >
          <ArrowDown size={12} /> Send to Back
        </button>
        <button
          onClick={() => {
            if (!slide) return;
            const idx = slide.layers.findIndex((l) => l.id === layer.id);
            if (idx < slide.layers.length - 1)
              reorderLayers(slideId, idx, slide.layers.length - 1);
          }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-surface text-muted hover:text-foreground rounded-md text-xs"
        >
          <ArrowUp size={12} /> Bring to Front
        </button>
      </div>
    </div>
  );
}

export default function LayerControls() {
  const project = useEditorStore((s) => s.project);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);

  const slide = project?.slides.find((s) => s.id === activeSlideId);
  const layer = slide?.layers.find((l) => l.id === activeLayerId);

  if (!slide || !layer) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-muted">
        Select a layer to edit properties
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider px-2">
        Properties — {layer.name}
      </h3>
      <div className="px-2">
        {layer.type === "background" && (
          <BackgroundControls layer={layer} slideId={slide.id} />
        )}
        {layer.type === "title" && (
          <TitleControls layer={layer} slideId={slide.id} />
        )}
        {layer.type === "device" && (
          <DeviceControls layer={layer} slideId={slide.id} />
        )}
        {layer.type === "image" && (
          <ImageControls layer={layer} slideId={slide.id} />
        )}
      </div>
    </div>
  );
}
