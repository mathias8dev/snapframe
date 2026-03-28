import { DeviceConfig, DeviceButton } from "./types";

// ── Shared button layouts ──────────────────────────────────────────────────

// iPhone with side button (iPhone X and later)
const IPHONE_MODERN_BUTTONS: DeviceButton[] = [
  // Power (right side)
  { side: "right", offsetPercent: 0.25, lengthPercent: 0.06 },
  // Volume up (left side)
  { side: "left", offsetPercent: 0.22, lengthPercent: 0.045 },
  // Volume down (left side)
  { side: "left", offsetPercent: 0.29, lengthPercent: 0.045 },
  // Mute switch (left side, shorter)
  { side: "left", offsetPercent: 0.16, lengthPercent: 0.025 },
];

// iPhone SE (home button era) - same sides but different positions
const IPHONE_SE_BUTTONS: DeviceButton[] = [
  { side: "right", offsetPercent: 0.08, lengthPercent: 0.05 },
  { side: "left", offsetPercent: 0.14, lengthPercent: 0.045 },
  { side: "left", offsetPercent: 0.21, lengthPercent: 0.045 },
  { side: "left", offsetPercent: 0.08, lengthPercent: 0.025 },
];

// iPad - power on top, volume on right
const IPAD_BUTTONS: DeviceButton[] = [
  { side: "top", offsetPercent: 0.92, lengthPercent: 0.04 },
  { side: "right", offsetPercent: 0.07, lengthPercent: 0.04 },
  { side: "right", offsetPercent: 0.13, lengthPercent: 0.04 },
];

// Android - power + volume on right side
const ANDROID_BUTTONS: DeviceButton[] = [
  { side: "right", offsetPercent: 0.27, lengthPercent: 0.05 },
  { side: "right", offsetPercent: 0.18, lengthPercent: 0.06 },
];

// Samsung - power right, volume left
const SAMSUNG_BUTTONS: DeviceButton[] = [
  { side: "right", offsetPercent: 0.27, lengthPercent: 0.05 },
  { side: "left", offsetPercent: 0.2, lengthPercent: 0.06 },
];

// Pixel - power right, volume right (stacked)
const PIXEL_BUTTONS: DeviceButton[] = [
  { side: "right", offsetPercent: 0.28, lengthPercent: 0.04 },
  { side: "right", offsetPercent: 0.18, lengthPercent: 0.06 },
];

// ── Device configs ─────────────────────────────────────────────────────────

export const DEVICES: Record<string, DeviceConfig> = {
  // ── iOS Generic ───────────────────────────────────────────────────
  iosgeneric: {
    id: "iosgeneric",
    name: "iOS Generic",
    category: "ios",
    exportWidth: 1290,
    exportHeight: 2796,
    aspectRatio: 19.5 / 9,
    cornerRadius: 50,
    frameCornerRadius: 56,
    dynamicIsland: true,
    notch: false,
    screenInset: { top: 68, bottom: 34, left: 20, right: 20 },
    buttons: IPHONE_MODERN_BUTTONS,
    framePath: "",
    screenPath: "",
  },

  // ── iPhones ───────────────────────────────────────────────────────
  iphone16promax: {
    id: "iphone16promax",
    name: "iPhone 16 Pro Max",
    category: "ios",
    exportWidth: 1320,
    exportHeight: 2868,
    aspectRatio: 19.5 / 9,
    cornerRadius: 55,
    frameCornerRadius: 60,
    dynamicIsland: true,
    notch: false,
    screenInset: { top: 71, bottom: 34, left: 21, right: 21 },
    buttons: IPHONE_MODERN_BUTTONS,
    framePath: "",
    screenPath: "",
  },
  iphone16pro: {
    id: "iphone16pro",
    name: "iPhone 16 Pro",
    category: "ios",
    exportWidth: 1206,
    exportHeight: 2622,
    aspectRatio: 19.5 / 9,
    cornerRadius: 53,
    frameCornerRadius: 58,
    dynamicIsland: true,
    notch: false,
    screenInset: { top: 68, bottom: 34, left: 20, right: 20 },
    buttons: IPHONE_MODERN_BUTTONS,
    framePath: "",
    screenPath: "",
  },
  iphone15pro: {
    id: "iphone15pro",
    name: "iPhone 15 Pro",
    category: "ios",
    exportWidth: 1179,
    exportHeight: 2556,
    aspectRatio: 19.5 / 9,
    cornerRadius: 55,
    frameCornerRadius: 60,
    dynamicIsland: true,
    notch: false,
    screenInset: { top: 71, bottom: 34, left: 21, right: 21 },
    buttons: IPHONE_MODERN_BUTTONS,
    framePath: "",
    screenPath: "",
  },
  iphone14: {
    id: "iphone14",
    name: "iPhone 14",
    category: "ios",
    exportWidth: 1170,
    exportHeight: 2532,
    aspectRatio: 19.5 / 9,
    cornerRadius: 47,
    frameCornerRadius: 53,
    dynamicIsland: false,
    notch: true,
    screenInset: { top: 68, bottom: 34, left: 19, right: 19 },
    buttons: IPHONE_MODERN_BUTTONS,
    framePath: "",
    screenPath: "",
  },
  iphone13mini: {
    id: "iphone13mini",
    name: "iPhone 13 mini",
    category: "ios",
    exportWidth: 1080,
    exportHeight: 2340,
    aspectRatio: 19.5 / 9,
    cornerRadius: 44,
    frameCornerRadius: 50,
    dynamicIsland: false,
    notch: true,
    screenInset: { top: 64, bottom: 30, left: 18, right: 18 },
    buttons: IPHONE_MODERN_BUTTONS,
    framePath: "",
    screenPath: "",
  },
  iphonese: {
    id: "iphonese",
    name: "iPhone SE",
    category: "ios",
    exportWidth: 750,
    exportHeight: 1334,
    aspectRatio: 16 / 9,
    cornerRadius: 0,
    frameCornerRadius: 0,
    dynamicIsland: false,
    notch: false,
    screenInset: { top: 40, bottom: 40, left: 16, right: 16 },
    buttons: IPHONE_SE_BUTTONS,
    framePath: "",
    screenPath: "",
  },

  // ── iPads ─────────────────────────────────────────────────────────
  ipadpro13: {
    id: "ipadpro13",
    name: 'iPad Pro 13"',
    category: "ios",
    exportWidth: 2064,
    exportHeight: 2752,
    aspectRatio: 4 / 3,
    cornerRadius: 30,
    frameCornerRadius: 36,
    dynamicIsland: false,
    notch: false,
    screenInset: { top: 40, bottom: 40, left: 40, right: 40 },
    buttons: IPAD_BUTTONS,
    framePath: "",
    screenPath: "",
  },
  ipadpro11: {
    id: "ipadpro11",
    name: 'iPad Pro 11"',
    category: "ios",
    exportWidth: 1668,
    exportHeight: 2388,
    aspectRatio: 4.3 / 3,
    cornerRadius: 28,
    frameCornerRadius: 34,
    dynamicIsland: false,
    notch: false,
    screenInset: { top: 36, bottom: 36, left: 36, right: 36 },
    buttons: IPAD_BUTTONS,
    framePath: "",
    screenPath: "",
  },
  ipadair: {
    id: "ipadair",
    name: "iPad Air",
    category: "ios",
    exportWidth: 1640,
    exportHeight: 2360,
    aspectRatio: 4.3 / 3,
    cornerRadius: 26,
    frameCornerRadius: 32,
    dynamicIsland: false,
    notch: false,
    screenInset: { top: 36, bottom: 36, left: 36, right: 36 },
    buttons: IPAD_BUTTONS,
    framePath: "",
    screenPath: "",
  },

  // ── Android Generic ───────────────────────────────────────────────
  androidgeneric: {
    id: "androidgeneric",
    name: "Android Generic",
    category: "android",
    exportWidth: 1080,
    exportHeight: 2400,
    aspectRatio: 20 / 9,
    cornerRadius: 36,
    frameCornerRadius: 42,
    dynamicIsland: false,
    notch: false,
    screenInset: { top: 30, bottom: 30, left: 18, right: 18 },
    buttons: ANDROID_BUTTONS,
    framePath: "",
    screenPath: "",
  },

  // ── Android Devices ───────────────────────────────────────────────
  pixels9pro: {
    id: "pixels9pro",
    name: "Pixel 9 Pro",
    category: "android",
    exportWidth: 1280,
    exportHeight: 2856,
    aspectRatio: 20 / 9,
    cornerRadius: 50,
    frameCornerRadius: 56,
    dynamicIsland: false,
    notch: false,
    screenInset: { top: 36, bottom: 36, left: 20, right: 20 },
    buttons: PIXEL_BUTTONS,
    framePath: "",
    screenPath: "",
  },
  pixels9: {
    id: "pixels9",
    name: "Pixel 9",
    category: "android",
    exportWidth: 1080,
    exportHeight: 2424,
    aspectRatio: 20 / 9,
    cornerRadius: 46,
    frameCornerRadius: 52,
    dynamicIsland: false,
    notch: false,
    screenInset: { top: 32, bottom: 32, left: 18, right: 18 },
    buttons: PIXEL_BUTTONS,
    framePath: "",
    screenPath: "",
  },
  galaxys24ultra: {
    id: "galaxys24ultra",
    name: "Galaxy S24 Ultra",
    category: "android",
    exportWidth: 1440,
    exportHeight: 3120,
    aspectRatio: 19.5 / 9,
    cornerRadius: 42,
    frameCornerRadius: 48,
    dynamicIsland: false,
    notch: false,
    screenInset: { top: 34, bottom: 34, left: 20, right: 20 },
    buttons: SAMSUNG_BUTTONS,
    framePath: "",
    screenPath: "",
  },
  galaxys24: {
    id: "galaxys24",
    name: "Galaxy S24",
    category: "android",
    exportWidth: 1080,
    exportHeight: 2340,
    aspectRatio: 19.5 / 9,
    cornerRadius: 40,
    frameCornerRadius: 46,
    dynamicIsland: false,
    notch: false,
    screenInset: { top: 30, bottom: 30, left: 18, right: 18 },
    buttons: SAMSUNG_BUTTONS,
    framePath: "",
    screenPath: "",
  },
  oneplus12: {
    id: "oneplus12",
    name: "OnePlus 12",
    category: "android",
    exportWidth: 1440,
    exportHeight: 3168,
    aspectRatio: 20 / 9,
    cornerRadius: 48,
    frameCornerRadius: 54,
    dynamicIsland: false,
    notch: false,
    screenInset: { top: 36, bottom: 36, left: 20, right: 20 },
    buttons: ANDROID_BUTTONS,
    framePath: "",
    screenPath: "",
  },
};

export const DEVICE_LIST = Object.values(DEVICES);

export const DEVICE_TARGETS = [
  { id: "iosgeneric", label: "iOS" },
  { id: "androidgeneric", label: "Android" },
] as const;

export function getDeviceDisplayDimensions(
  deviceId: string,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number; scale: number } {
  const device = DEVICES[deviceId];
  if (!device) return { width: maxWidth, height: maxHeight, scale: 1 };

  const scaleX = maxWidth / device.exportWidth;
  const scaleY = maxHeight / device.exportHeight;
  const scale = Math.min(scaleX, scaleY);

  return {
    width: device.exportWidth * scale,
    height: device.exportHeight * scale,
    scale,
  };
}
