import { DeviceConfig } from "./types";

export const DEVICES: Record<string, DeviceConfig> = {
  iphone15pro: {
    id: "iphone15pro",
    name: "iPhone 15 Pro",
    category: "iphone",
    exportWidth: 1320,
    exportHeight: 2868,
    aspectRatio: 19.5 / 9,
    cornerRadius: 55,
    frameCornerRadius: 60,
    dynamicIsland: true,
    notch: false,
    screenInset: { top: 71, bottom: 34, left: 21, right: 21 },
    framePath: "",
    screenPath: "",
  },
  iphone14: {
    id: "iphone14",
    name: "iPhone 14",
    category: "iphone",
    exportWidth: 1170,
    exportHeight: 2532,
    aspectRatio: 19.5 / 9,
    cornerRadius: 47,
    frameCornerRadius: 53,
    dynamicIsland: false,
    notch: true,
    screenInset: { top: 68, bottom: 34, left: 19, right: 19 },
    framePath: "",
    screenPath: "",
  },
  iphone13mini: {
    id: "iphone13mini",
    name: "iPhone 13 mini",
    category: "iphone",
    exportWidth: 1080,
    exportHeight: 2340,
    aspectRatio: 19.5 / 9,
    cornerRadius: 44,
    frameCornerRadius: 50,
    dynamicIsland: false,
    notch: true,
    screenInset: { top: 64, bottom: 30, left: 18, right: 18 },
    framePath: "",
    screenPath: "",
  },
  ipadpro13: {
    id: "ipadpro13",
    name: 'iPad Pro 13"',
    category: "ipad",
    exportWidth: 2048,
    exportHeight: 2732,
    aspectRatio: 4 / 3,
    cornerRadius: 30,
    frameCornerRadius: 36,
    dynamicIsland: false,
    notch: false,
    screenInset: { top: 40, bottom: 40, left: 40, right: 40 },
    framePath: "",
    screenPath: "",
  },
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
    framePath: "",
    screenPath: "",
  },
};

export const DEVICE_LIST = Object.values(DEVICES);

export const DEVICE_TARGETS = [
  { id: "iphone15pro", label: 'iOS Phones 6.9"' },
  { id: "iphone14", label: 'iOS Phones 6.1"' },
  { id: "ipadpro13", label: 'iPad Pro 13"' },
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
