import { v4 as uuid } from "uuid";
import { Project, Slide, BackgroundLayer, TitleLayer, Layer } from "./types";
import { createDefaultDeviceLayer } from "./layerDefaults";

// ---------------------------------------------------------------------------
// Simple template (single-slide, gradient + title + device)
// ---------------------------------------------------------------------------

interface SimpleTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  preview: { bg1: string; bg2: string; angle: number; textColor: string };
  title: string;
  fontFamily: string;
  deviceId: string;
  kind: "simple";
}

// ---------------------------------------------------------------------------
// Elaborate template (multi-slide, per-slide layer overrides)
// ---------------------------------------------------------------------------

interface SlideConfig {
  bg: { color1: string; color2: string; angle: number };
  title: { text: string; fontSize?: number; fontWeight?: number; y?: number; position?: "top" | "bottom"; color?: string };
  device?: { rotation?: number; offsetX?: number; offsetY?: number; padding?: number };
}

interface ElaborateTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  preview: { bg1: string; bg2: string; angle: number; textColor: string };
  fontFamily: string;
  deviceId: string;
  slides: SlideConfig[];
  kind: "elaborate";
}

type TemplateDefinition = SimpleTemplate | ElaborateTemplate;
type TemplateCategory = "Minimal" | "Bold" | "Gradient" | "Dark" | "Colorful" | "Teal" | "Showcase";

// ---------------------------------------------------------------------------
// Template definitions
// ---------------------------------------------------------------------------

const TEMPLATE_DEFS: TemplateDefinition[] = [
  // ── Minimal ────────────────────────────────────────────────────────
  {
    id: "minimal-white", name: "Clean White", category: "Minimal", kind: "simple",
    preview: { bg1: "#ffffff", bg2: "#f0f0f0", angle: 180, textColor: "#111111" },
    title: "Simple & Clean", fontFamily: "Inter", deviceId: "iosgeneric",
  },
  {
    id: "minimal-gray", name: "Soft Gray", category: "Minimal", kind: "simple",
    preview: { bg1: "#e5e5e5", bg2: "#d4d4d4", angle: 135, textColor: "#262626" },
    title: "Elegant Design", fontFamily: "DM Sans", deviceId: "iosgeneric",
  },

  // ── Bold ───────────────────────────────────────────────────────────
  {
    id: "bold-red", name: "Bold Red", category: "Bold", kind: "simple",
    preview: { bg1: "#dc2626", bg2: "#991b1b", angle: 180, textColor: "#ffffff" },
    title: "Make a Statement", fontFamily: "Montserrat", deviceId: "iosgeneric",
  },
  {
    id: "bold-blue", name: "Electric Blue", category: "Bold", kind: "simple",
    preview: { bg1: "#2563eb", bg2: "#1d4ed8", angle: 135, textColor: "#ffffff" },
    title: "Power Up", fontFamily: "Space Grotesk", deviceId: "iphone14",
  },

  // ── Gradient ───────────────────────────────────────────────────────
  {
    id: "gradient-sunset", name: "Sunset", category: "Gradient", kind: "simple",
    preview: { bg1: "#f97316", bg2: "#ec4899", angle: 135, textColor: "#ffffff" },
    title: "Beautiful Moments", fontFamily: "Playfair Display", deviceId: "iosgeneric",
  },
  {
    id: "gradient-ocean", name: "Ocean", category: "Gradient", kind: "simple",
    preview: { bg1: "#06b6d4", bg2: "#8b5cf6", angle: 135, textColor: "#ffffff" },
    title: "Dive Deep", fontFamily: "Poppins", deviceId: "iosgeneric",
  },
  {
    id: "gradient-aurora", name: "Aurora", category: "Gradient", kind: "simple",
    preview: { bg1: "#10b981", bg2: "#6366f1", angle: 160, textColor: "#ffffff" },
    title: "Northern Lights", fontFamily: "Inter", deviceId: "iphone14",
  },

  // ── Dark ───────────────────────────────────────────────────────────
  {
    id: "dark-midnight", name: "Midnight", category: "Dark", kind: "simple",
    preview: { bg1: "#0f172a", bg2: "#1e293b", angle: 180, textColor: "#e2e8f0" },
    title: "Dark Mode Ready", fontFamily: "Space Grotesk", deviceId: "iosgeneric",
  },
  {
    id: "dark-charcoal", name: "Charcoal", category: "Dark", kind: "simple",
    preview: { bg1: "#171717", bg2: "#262626", angle: 135, textColor: "#d4d4d4" },
    title: "Sleek & Dark", fontFamily: "DM Sans", deviceId: "iosgeneric",
  },

  // ── Colorful ───────────────────────────────────────────────────────
  {
    id: "colorful-candy", name: "Candy", category: "Colorful", kind: "simple",
    preview: { bg1: "#f472b6", bg2: "#a78bfa", angle: 120, textColor: "#ffffff" },
    title: "Sweet & Fun", fontFamily: "Poppins", deviceId: "iosgeneric",
  },
  {
    id: "colorful-tropical", name: "Tropical", category: "Colorful", kind: "simple",
    preview: { bg1: "#34d399", bg2: "#fbbf24", angle: 135, textColor: "#064e3b" },
    title: "Go Tropical", fontFamily: "Montserrat", deviceId: "iphone14",
  },
  {
    id: "colorful-neon", name: "Neon", category: "Colorful", kind: "simple",
    preview: { bg1: "#a855f7", bg2: "#ec4899", angle: 45, textColor: "#ffffff" },
    title: "Glow Up", fontFamily: "Space Grotesk", deviceId: "iosgeneric",
  },

  // ── Teal ───────────────────────────────────────────────────────────
  {
    id: "teal-bright", name: "Teal Bright", category: "Teal", kind: "simple",
    preview: { bg1: "#0D5F5F", bg2: "#1A8080", angle: 160, textColor: "#ffffff" },
    title: "Your Feature", fontFamily: "DM Sans", deviceId: "androidgeneric",
  },
  {
    id: "teal-deep", name: "Teal Deep", category: "Teal", kind: "simple",
    preview: { bg1: "#052E2E", bg2: "#1E7373", angle: 160, textColor: "#ffffff" },
    title: "Track Progress", fontFamily: "DM Sans", deviceId: "androidgeneric",
  },
  {
    id: "teal-forest", name: "Teal Forest", category: "Teal", kind: "simple",
    preview: { bg1: "#0A4040", bg2: "#1E7373", angle: 160, textColor: "#ffffff" },
    title: "Stay Focused", fontFamily: "DM Sans", deviceId: "androidgeneric",
  },
  {
    id: "teal-mint", name: "Teal Mint", category: "Teal", kind: "simple",
    preview: { bg1: "#115E5E", bg2: "#2AA0A0", angle: 135, textColor: "#ffffff" },
    title: "Build Habits", fontFamily: "DM Sans", deviceId: "androidgeneric",
  },

  // ── Showcase (elaborate multi-slide templates) ─────────────────────

  {
    id: "showcase-appstore",
    name: "App Store Showcase",
    category: "Showcase",
    kind: "elaborate",
    preview: { bg1: "#1e40af", bg2: "#7c3aed", angle: 135, textColor: "#ffffff" },
    fontFamily: "Inter",
    deviceId: "iosgeneric",
    slides: [
      {
        bg: { color1: "#1e40af", color2: "#7c3aed", angle: 135 },
        title: { text: "Your App Name", fontSize: 56, fontWeight: 800, y: 60 },
        device: { padding: 50, offsetY: 30 },
      },
      {
        bg: { color1: "#4338ca", color2: "#6d28d9", angle: 160 },
        title: { text: "Beautiful Design", fontSize: 44, y: 70 },
        device: { rotation: -5, offsetX: 20, offsetY: 40, padding: 60 },
      },
      {
        bg: { color1: "#6d28d9", color2: "#a855f7", angle: 180 },
        title: { text: "Powerful Features", fontSize: 44, y: 70 },
        device: { rotation: 5, offsetX: -20, offsetY: 40, padding: 60 },
      },
      {
        bg: { color1: "#7c3aed", color2: "#c084fc", angle: 135 },
        title: { text: "Try It Now", fontSize: 52, fontWeight: 800, y: 65 },
        device: { padding: 45, offsetY: 25 },
      },
    ],
  },

  {
    id: "showcase-teal-listing",
    name: "Teal Listing",
    category: "Showcase",
    kind: "elaborate",
    preview: { bg1: "#0D5F5F", bg2: "#1A8080", angle: 160, textColor: "#ffffff" },
    fontFamily: "DM Sans",
    deviceId: "androidgeneric",
    slides: [
      {
        bg: { color1: "#0D5F5F", color2: "#1A8080", angle: 160 },
        title: { text: "Habits", fontSize: 56, fontWeight: 800, y: 55 },
        device: { padding: 55, offsetY: 35 },
      },
      {
        bg: { color1: "#052E2E", color2: "#1E7373", angle: 160 },
        title: { text: "Habit Calendar", fontSize: 48, fontWeight: 800, y: 55 },
        device: { padding: 55, offsetY: 35 },
      },
      {
        bg: { color1: "#0A4040", color2: "#1E7373", angle: 160 },
        title: { text: "Analytics", fontSize: 56, fontWeight: 800, y: 55 },
        device: { padding: 55, offsetY: 35 },
      },
      {
        bg: { color1: "#0D5F5F", color2: "#1A8080", angle: 160 },
        title: { text: "Deep Work", fontSize: 52, fontWeight: 800, y: 55 },
        device: { padding: 55, offsetY: 35 },
      },
      {
        bg: { color1: "#052E2E", color2: "#1E7373", angle: 160 },
        title: { text: "Focus Stats", fontSize: 48, fontWeight: 800, y: 55 },
        device: { padding: 55, offsetY: 35 },
      },
    ],
  },

  {
    id: "showcase-dynamic",
    name: "Dynamic Angles",
    category: "Showcase",
    kind: "elaborate",
    preview: { bg1: "#0f172a", bg2: "#334155", angle: 135, textColor: "#f8fafc" },
    fontFamily: "Space Grotesk",
    deviceId: "iosgeneric",
    slides: [
      {
        bg: { color1: "#0f172a", color2: "#1e293b", angle: 180 },
        title: { text: "Welcome", fontSize: 52, fontWeight: 800, y: 50, color: "#f8fafc" },
        device: { rotation: -8, offsetX: 30, offsetY: 50, padding: 65 },
      },
      {
        bg: { color1: "#1e293b", color2: "#334155", angle: 135 },
        title: { text: "Explore", fontSize: 52, fontWeight: 800, y: 50, color: "#f8fafc" },
        device: { rotation: 8, offsetX: -30, offsetY: 50, padding: 65 },
      },
      {
        bg: { color1: "#0f172a", color2: "#475569", angle: 160 },
        title: { text: "Create", fontSize: 52, fontWeight: 800, y: 50, color: "#f8fafc" },
        device: { rotation: -3, offsetX: 15, offsetY: 30, padding: 55 },
      },
      {
        bg: { color1: "#1e293b", color2: "#0f172a", angle: 45 },
        title: { text: "Share", fontSize: 52, fontWeight: 800, y: 50, color: "#f8fafc" },
        device: { rotation: 3, offsetX: -15, offsetY: 30, padding: 55 },
      },
      {
        bg: { color1: "#0f172a", color2: "#334155", angle: 180 },
        title: { text: "Download Now", fontSize: 48, fontWeight: 800, y: 55, color: "#f8fafc" },
        device: { padding: 50, offsetY: 20 },
      },
    ],
  },

  {
    id: "showcase-vibrant",
    name: "Vibrant Screens",
    category: "Showcase",
    kind: "elaborate",
    preview: { bg1: "#dc2626", bg2: "#f97316", angle: 135, textColor: "#ffffff" },
    fontFamily: "Montserrat",
    deviceId: "iosgeneric",
    slides: [
      {
        bg: { color1: "#dc2626", color2: "#f97316", angle: 135 },
        title: { text: "Bold & Beautiful", fontSize: 48, fontWeight: 800, y: 60 },
        device: { padding: 50, offsetY: 25 },
      },
      {
        bg: { color1: "#ea580c", color2: "#facc15", angle: 160 },
        title: { text: "Smooth Experience", fontSize: 42, y: 65 },
        device: { rotation: 6, offsetX: -25, offsetY: 45, padding: 60 },
      },
      {
        bg: { color1: "#b91c1c", color2: "#e11d48", angle: 180 },
        title: { text: "Feature Rich", fontSize: 44, y: 65 },
        device: { rotation: -6, offsetX: 25, offsetY: 45, padding: 60 },
      },
      {
        bg: { color1: "#e11d48", color2: "#f472b6", angle: 135 },
        title: { text: "Get Started", fontSize: 50, fontWeight: 800, y: 60 },
        device: { padding: 45, offsetY: 20 },
      },
    ],
  },

  {
    id: "showcase-minimal-pro",
    name: "Minimal Pro",
    category: "Showcase",
    kind: "elaborate",
    preview: { bg1: "#fafafa", bg2: "#e5e5e5", angle: 180, textColor: "#171717" },
    fontFamily: "Inter",
    deviceId: "iosgeneric",
    slides: [
      {
        bg: { color1: "#fafafa", color2: "#e5e5e5", angle: 180 },
        title: { text: "Clean Interface", fontSize: 44, fontWeight: 700, y: 65, color: "#171717" },
        device: { padding: 55, offsetY: 30 },
      },
      {
        bg: { color1: "#f5f5f5", color2: "#d4d4d4", angle: 135 },
        title: { text: "Simple Navigation", fontSize: 40, y: 70, color: "#262626" },
        device: { rotation: -4, offsetX: 20, offsetY: 40, padding: 65 },
      },
      {
        bg: { color1: "#e5e5e5", color2: "#a3a3a3", angle: 160 },
        title: { text: "Thoughtful Details", fontSize: 40, y: 70, color: "#171717" },
        device: { rotation: 4, offsetX: -20, offsetY: 40, padding: 65 },
      },
      {
        bg: { color1: "#fafafa", color2: "#d4d4d4", angle: 180 },
        title: { text: "Download Free", fontSize: 46, fontWeight: 700, y: 60, color: "#171717" },
        device: { padding: 50, offsetY: 25 },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Template API
// ---------------------------------------------------------------------------

export function getTemplates() {
  return TEMPLATE_DEFS;
}

function createSlide(
  order: number,
  slideConfig: SlideConfig,
  fontFamily: string,
  deviceId: string,
  textColor: string,
): Slide {
  return {
    id: uuid(),
    order,
    layers: [
      {
        id: uuid(),
        name: "Background",
        type: "background",
        visible: true,
        locked: false,
        kind: "gradient",
        color1: slideConfig.bg.color1,
        color2: slideConfig.bg.color2,
        angle: slideConfig.bg.angle,
        imageUrl: null,
      } as BackgroundLayer,
      {
        id: uuid(),
        name: "Title",
        type: "title",
        visible: true,
        locked: false,
        text: slideConfig.title.text,
        fontSize: slideConfig.title.fontSize ?? 48,
        fontFamily,
        fontWeight: slideConfig.title.fontWeight ?? 700,
        color: slideConfig.title.color ?? textColor,
        x: 0,
        y: slideConfig.title.y ?? 80,
        width: 100,
        align: "center",
        position: slideConfig.title.position ?? "top",
      } as TitleLayer,
      createDefaultDeviceLayer({
        deviceId,
        rotation: slideConfig.device?.rotation ?? 0,
        offsetX: slideConfig.device?.offsetX ?? 0,
        offsetY: slideConfig.device?.offsetY ?? 0,
        padding: slideConfig.device?.padding ?? 40,
      }),
    ] as Layer[],
  };
}

export function createProjectFromTemplate(template: TemplateDefinition): Project {
  if (template.kind === "elaborate") {
    return {
      id: uuid(),
      name: template.name,
      deviceTarget: template.deviceId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slides: template.slides.map((sc, i) =>
        createSlide(i, sc, template.fontFamily, template.deviceId, template.preview.textColor)
      ),
    };
  }

  // Simple template — single slide
  return {
    id: uuid(),
    name: template.name,
    deviceTarget: template.deviceId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    slides: [
      createSlide(
        0,
        {
          bg: { color1: template.preview.bg1, color2: template.preview.bg2, angle: template.preview.angle },
          title: { text: template.title },
        },
        template.fontFamily,
        template.deviceId,
        template.preview.textColor,
      ),
    ],
  };
}

export const TEMPLATE_CATEGORIES = [
  "All",
  "Showcase",
  "Minimal",
  "Bold",
  "Gradient",
  "Dark",
  "Colorful",
  "Teal",
] as const;
