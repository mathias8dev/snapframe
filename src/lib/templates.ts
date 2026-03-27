import { v4 as uuid } from "uuid";
import { Project, BackgroundLayer, TitleLayer, DeviceLayer } from "./types";

interface TemplateDefinition {
  id: string;
  name: string;
  category: "Minimal" | "Bold" | "Gradient" | "Dark" | "Colorful";
  preview: { bg1: string; bg2: string; angle: number; textColor: string };
  title: string;
  fontFamily: string;
  deviceId: string;
}

const TEMPLATE_DEFS: TemplateDefinition[] = [
  {
    id: "minimal-white",
    name: "Clean White",
    category: "Minimal",
    preview: { bg1: "#ffffff", bg2: "#f0f0f0", angle: 180, textColor: "#111111" },
    title: "Simple & Clean",
    fontFamily: "Inter",
    deviceId: "iosgeneric",
  },
  {
    id: "minimal-gray",
    name: "Soft Gray",
    category: "Minimal",
    preview: { bg1: "#e5e5e5", bg2: "#d4d4d4", angle: 135, textColor: "#262626" },
    title: "Elegant Design",
    fontFamily: "DM Sans",
    deviceId: "iosgeneric",
  },
  {
    id: "bold-red",
    name: "Bold Red",
    category: "Bold",
    preview: { bg1: "#dc2626", bg2: "#991b1b", angle: 180, textColor: "#ffffff" },
    title: "Make a Statement",
    fontFamily: "Montserrat",
    deviceId: "iosgeneric",
  },
  {
    id: "bold-blue",
    name: "Electric Blue",
    category: "Bold",
    preview: { bg1: "#2563eb", bg2: "#1d4ed8", angle: 135, textColor: "#ffffff" },
    title: "Power Up",
    fontFamily: "Space Grotesk",
    deviceId: "iphone14",
  },
  {
    id: "gradient-sunset",
    name: "Sunset",
    category: "Gradient",
    preview: { bg1: "#f97316", bg2: "#ec4899", angle: 135, textColor: "#ffffff" },
    title: "Beautiful Moments",
    fontFamily: "Playfair Display",
    deviceId: "iosgeneric",
  },
  {
    id: "gradient-ocean",
    name: "Ocean",
    category: "Gradient",
    preview: { bg1: "#06b6d4", bg2: "#8b5cf6", angle: 135, textColor: "#ffffff" },
    title: "Dive Deep",
    fontFamily: "Poppins",
    deviceId: "iosgeneric",
  },
  {
    id: "gradient-aurora",
    name: "Aurora",
    category: "Gradient",
    preview: { bg1: "#10b981", bg2: "#6366f1", angle: 160, textColor: "#ffffff" },
    title: "Northern Lights",
    fontFamily: "Inter",
    deviceId: "iphone14",
  },
  {
    id: "dark-midnight",
    name: "Midnight",
    category: "Dark",
    preview: { bg1: "#0f172a", bg2: "#1e293b", angle: 180, textColor: "#e2e8f0" },
    title: "Dark Mode Ready",
    fontFamily: "Space Grotesk",
    deviceId: "iosgeneric",
  },
  {
    id: "dark-charcoal",
    name: "Charcoal",
    category: "Dark",
    preview: { bg1: "#171717", bg2: "#262626", angle: 135, textColor: "#d4d4d4" },
    title: "Sleek & Dark",
    fontFamily: "DM Sans",
    deviceId: "iosgeneric",
  },
  {
    id: "colorful-candy",
    name: "Candy",
    category: "Colorful",
    preview: { bg1: "#f472b6", bg2: "#a78bfa", angle: 120, textColor: "#ffffff" },
    title: "Sweet & Fun",
    fontFamily: "Poppins",
    deviceId: "iosgeneric",
  },
  {
    id: "colorful-tropical",
    name: "Tropical",
    category: "Colorful",
    preview: { bg1: "#34d399", bg2: "#fbbf24", angle: 135, textColor: "#064e3b" },
    title: "Go Tropical",
    fontFamily: "Montserrat",
    deviceId: "iphone14",
  },
  {
    id: "colorful-neon",
    name: "Neon",
    category: "Colorful",
    preview: { bg1: "#a855f7", bg2: "#ec4899", angle: 45, textColor: "#ffffff" },
    title: "Glow Up",
    fontFamily: "Space Grotesk",
    deviceId: "iosgeneric",
  },
];

export function getTemplates() {
  return TEMPLATE_DEFS;
}

export function createProjectFromTemplate(template: TemplateDefinition): Project {
  const slideId = uuid();
  return {
    id: uuid(),
    name: template.name,
    deviceTarget: template.deviceId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    slides: [
      {
        id: slideId,
        order: 0,
        layers: [
          {
            id: uuid(),
            name: "Background",
            type: "background",
            visible: true,
            locked: false,
            kind: "gradient",
            color1: template.preview.bg1,
            color2: template.preview.bg2,
            angle: template.preview.angle,
            imageUrl: null,
          } as BackgroundLayer,
          {
            id: uuid(),
            name: "Title",
            type: "title",
            visible: true,
            locked: false,
            text: template.title,
            fontSize: 48,
            fontFamily: template.fontFamily,
            fontWeight: 700,
            color: template.preview.textColor,
            x: 0,
            y: 80,
            width: 100,
            align: "center",
            position: "top",
          } as TitleLayer,
          {
            id: uuid(),
            name: "Device",
            type: "device",
            visible: true,
            locked: false,
            deviceId: template.deviceId,
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
          } as DeviceLayer,
        ],
      },
    ],
  };
}

export const TEMPLATE_CATEGORIES = [
  "All",
  "Minimal",
  "Bold",
  "Gradient",
  "Dark",
  "Colorful",
] as const;
