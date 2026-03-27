export interface Project {
  id: string;
  name: string;
  deviceTarget: string;
  slides: Slide[];
  createdAt: number;
  updatedAt: number;
}

export interface Slide {
  id: string;
  order: number;
  layers: Layer[];
}

export type Layer =
  | LayoutLayer
  | BackgroundLayer
  | TitleLayer
  | DeviceLayer
  | ImageLayer;

export interface BaseLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

export interface LayoutLayer extends BaseLayer {
  type: "layout";
  preset: "portrait" | "landscape" | "split";
}

export interface BackgroundLayer extends BaseLayer {
  type: "background";
  kind: "solid" | "gradient" | "image";
  color1: string;
  color2: string;
  angle: number;
  imageUrl: string | null;
}

export interface TitleLayer extends BaseLayer {
  type: "title";
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  x: number;
  y: number;
  width: number;
  align: "left" | "center" | "right";
  position: "top" | "bottom";
}

export interface DeviceLayer extends BaseLayer {
  type: "device";
  deviceId: string;
  orientation: "portrait" | "landscape";
  sizing: "contain" | "fill" | "cover";
  cornerRounding: "auto" | number;
  frameVisible: boolean;
  frameOpacity: number;
  padding: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  screenshotUrl: string | null;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}

export interface DeviceConfig {
  id: string;
  name: string;
  category: "ios" | "android";
  exportWidth: number;
  exportHeight: number;
  aspectRatio: number;
  cornerRadius: number;
  frameCornerRadius: number;
  dynamicIsland: boolean;
  notch: boolean;
  screenInset: { top: number; bottom: number; left: number; right: number };
  framePath: string;
  screenPath: string;
}

export type LayerType = Layer["type"];

export interface EditorState {
  project: Project | null;
  activeSlideId: string | null;
  activeLayerId: string | null;
  clipboard: Layer | null;
}
