import { v4 as uuid } from "uuid";
import { DeviceLayer, ShapeLayer, TextBlockLayer, IconLayer } from "./types";

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

export function createDefaultShapeLayer(
  shapeType: ShapeLayer["shapeType"] = "rect",
  overrides?: Partial<ShapeLayer>,
): ShapeLayer {
  return {
    id: uuid(),
    name: `Shape`,
    type: "shape",
    visible: true,
    locked: false,
    shapeType,
    fill: "#3b82f6",
    stroke: "#1d4ed8",
    strokeWidth: 0,
    opacity: 1,
    x: 100,
    y: 200,
    width: 120,
    height: 120,
    rotation: 0,
    ...overrides,
  };
}

export function createDefaultTextBlockLayer(
  overrides?: Partial<TextBlockLayer>,
): TextBlockLayer {
  return {
    id: uuid(),
    name: "Text Block",
    type: "textblock",
    visible: true,
    locked: false,
    text: "Your text here",
    fontSize: 24,
    fontFamily: "Inter",
    fontWeight: 400,
    color: "#ffffff",
    backgroundColor: null,
    x: 80,
    y: 300,
    width: 260,
    align: "left",
    opacity: 1,
    ...overrides,
  };
}

export function createDefaultIconLayer(
  svgContent: string = "",
  overrides?: Partial<IconLayer>,
): IconLayer {
  return {
    id: uuid(),
    name: "Icon",
    type: "icon",
    visible: true,
    locked: false,
    svgContent,
    fill: "#ffffff",
    x: 180,
    y: 400,
    size: 64,
    opacity: 1,
    rotation: 0,
    ...overrides,
  };
}
