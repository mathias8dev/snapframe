import { DeviceConfig, DeviceButton, DeviceLayer } from "./types";

// ── Reference canvas size (editor default) ─────────────────────────────────

export const REF_W = 420;
export const REF_H = 840;

// ── Device rendering colors ────────────────────────────────────────────────

export const FRAME_FILL = "#1a1a1a";
export const FRAME_STROKE = "#333";
export const SCREEN_BG = "#000";
export const CANVAS_BG = "#18181b";

// ── Device chrome dimensions (in export pixels, scaled at render time) ─────

export const SCREEN_CORNER_RATIO = 0.85;

export const DYNAMIC_ISLAND = { width: 80, height: 24, yOffset: 12 };
export const NOTCH = { width: 120, height: 28, radius: 14 };
export const BUTTON_THICKNESS = 3;

// ── Title area reserved above/below device ─────────────────────────────────

export const TITLE_AREA_RESERVE = 120;
export const DEVICE_Y_OFFSET = 40;

// ── Device frame layout computation ────────────────────────────────────────

export interface DeviceLayout {
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;
  cr: number;
  screenX: number;
  screenY: number;
  screenW: number;
  screenH: number;
  screenCr: number;
  pivotX: number;
  pivotY: number;
  scale: number;
}

export function computeDeviceLayout(
  device: DeviceConfig,
  canvasW: number,
  canvasH: number,
  layer: Pick<DeviceLayer, "padding" | "cornerRounding">,
  thumbScale?: { x: number; y: number },
): DeviceLayout {
  const sx = thumbScale?.x ?? 1;
  const sy = thumbScale?.y ?? 1;

  const padding = layer.padding * sx;
  const availW = canvasW - padding * 2;
  const availH = canvasH - padding * 2 - TITLE_AREA_RESERVE * sy;

  const scale = Math.min(availW / device.exportWidth, availH / device.exportHeight);

  const frameW = device.exportWidth * scale;
  const frameH = device.exportHeight * scale;
  const frameX = (canvasW - frameW) / 2;
  const frameY = (canvasH - frameH) / 2 + DEVICE_Y_OFFSET * sy;

  const cr =
    layer.cornerRounding === "auto"
      ? device.cornerRadius * scale
      : layer.cornerRounding * scale;

  const screenX = frameX + device.screenInset.left * scale;
  const screenY = frameY + device.screenInset.top * scale;
  const screenW = frameW - (device.screenInset.left + device.screenInset.right) * scale;
  const screenH = frameH - (device.screenInset.top + device.screenInset.bottom) * scale;
  const screenCr = cr * SCREEN_CORNER_RATIO;

  return {
    frameX, frameY, frameW, frameH, cr,
    screenX, screenY, screenW, screenH, screenCr,
    pivotX: frameX + frameW / 2,
    pivotY: frameY + frameH / 2,
    scale,
  };
}

// ── Button rect computation ────────────────────────────────────────────────

export interface ButtonRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

export function computeButtonRect(
  btn: DeviceButton,
  frameX: number,
  frameY: number,
  frameW: number,
  frameH: number,
  scale: number,
): ButtonRect {
  const thickness = BUTTON_THICKNESS * scale;
  const radius = thickness / 2;

  if (btn.side === "right") {
    return {
      x: frameX + frameW,
      y: frameY + btn.offsetPercent * frameH,
      width: thickness,
      height: btn.lengthPercent * frameH,
      radius,
    };
  }

  if (btn.side === "left") {
    return {
      x: frameX - thickness,
      y: frameY + btn.offsetPercent * frameH,
      width: thickness,
      height: btn.lengthPercent * frameH,
      radius,
    };
  }

  // top
  return {
    x: frameX + btn.offsetPercent * frameW,
    y: frameY - thickness,
    width: btn.lengthPercent * frameW,
    height: thickness,
    radius,
  };
}
