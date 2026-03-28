import { v4 as uuid } from "uuid";
import { DeviceLayer } from "./types";

export function createDefaultDeviceLayer(
  overrides?: Partial<DeviceLayer>,
): DeviceLayer {
  return {
    id: uuid(),
    name: "Device",
    type: "device",
    visible: true,
    locked: false,
    deviceId: "iosgeneric",
    orientation: "portrait",
    sizing: "contain",
    cornerRounding: "auto",
    frameVisible: true,
    frameOpacity: 1,
    padding: 40,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    screenshotUrl: null,
    ...overrides,
  };
}
