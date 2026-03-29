import { v4 as uuid } from "uuid";
import { Project, Slide, BackgroundLayer, TitleLayer, Layer } from "./types";
import {
  createDefaultDeviceLayer,
  createDefaultShapeLayer,
  createDefaultTextBlockLayer,
  createDefaultIconLayer,
} from "./layerDefaults";
import { ICON_LIBRARY } from "./iconLibrary";

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

interface ShapeConfig {
  shapeType: "rect" | "circle" | "triangle" | "star" | "line" | "arrow";
  fill: string; stroke?: string; strokeWidth?: number;
  x: number; y: number; width: number; height: number;
  opacity?: number; rotation?: number;
}

interface TextBlockConfig {
  text: string; fontSize?: number; fontFamily?: string; fontWeight?: number;
  color?: string; backgroundColor?: string | null;
  x: number; y: number; width?: number;
  align?: "left" | "center" | "right"; opacity?: number;
}

interface IconConfig {
  iconName: string;
  fill?: string; x: number; y: number; size?: number;
  opacity?: number; rotation?: number;
}

interface SlideConfig {
  bg: { color1: string; color2: string; angle: number };
  title: { text: string; fontSize?: number; fontWeight?: number; y?: number; position?: "top" | "bottom"; color?: string };
  device?: { rotation?: number; offsetX?: number; offsetY?: number; padding?: number };
  shapes?: ShapeConfig[];
  textBlocks?: TextBlockConfig[];
  icons?: IconConfig[];
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

  // ── Showcase (elaborate multi-slide templates with objects) ─────

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
        shapes: [
          { shapeType: "circle", fill: "#ffffff10", x: -30, y: -30, width: 200, height: 200 },
          { shapeType: "circle", fill: "#ffffff08", x: 300, y: 650, width: 160, height: 160 },
        ],
        icons: [
          { iconName: "Star", fill: "#fbbf24", x: 30, y: 750, size: 28, rotation: 15 },
          { iconName: "Sparkles", fill: "#c084fc", x: 370, y: 100, size: 24 },
        ],
      },
      {
        bg: { color1: "#4338ca", color2: "#6d28d9", angle: 160 },
        title: { text: "Beautiful Design", fontSize: 44, y: 70 },
        device: { rotation: -5, offsetX: 20, offsetY: 40, padding: 60 },
        textBlocks: [
          { text: "Crafted with care", fontSize: 14, x: 60, y: 140, width: 300, color: "#c4b5fd", align: "center" },
        ],
        icons: [{ iconName: "Palette", fill: "#a78bfa", x: 350, y: 750, size: 32 }],
      },
      {
        bg: { color1: "#6d28d9", color2: "#a855f7", angle: 180 },
        title: { text: "Powerful Features", fontSize: 44, y: 70 },
        device: { rotation: 5, offsetX: -20, offsetY: 40, padding: 60 },
        icons: [
          { iconName: "Zap", fill: "#fbbf24", x: 30, y: 130, size: 28 },
          { iconName: "Shield Check", fill: "#86efac", x: 360, y: 760, size: 28 },
        ],
      },
      {
        bg: { color1: "#7c3aed", color2: "#c084fc", angle: 135 },
        title: { text: "Try It Now", fontSize: 52, fontWeight: 800, y: 65 },
        device: { padding: 45, offsetY: 25 },
        shapes: [{ shapeType: "rect", fill: "#ffffff20", x: 100, y: 750, width: 220, height: 44 }],
        textBlocks: [{ text: "Free on the App Store", fontSize: 14, x: 110, y: 758, width: 200, color: "#ffffff", align: "center", fontWeight: 600 }],
        icons: [{ iconName: "Download", fill: "#ffffff", x: 190, y: 710, size: 24 }],
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
        textBlocks: [{ text: "Track your daily habits with\nweekly completion view", fontSize: 13, x: 60, y: 135, width: 300, color: "#ffffffb8", align: "center" }],
        icons: [{ iconName: "Check Circle", fill: "#5eead4", x: 30, y: 750, size: 24 }],
      },
      {
        bg: { color1: "#052E2E", color2: "#1E7373", angle: 160 },
        title: { text: "Analytics", fontSize: 56, fontWeight: 800, y: 55 },
        device: { padding: 55, offsetY: 35 },
        textBlocks: [{ text: "Success rate, trends,\nand performance insights", fontSize: 13, x: 60, y: 135, width: 300, color: "#ffffffad", align: "center" }],
        icons: [{ iconName: "Activity", fill: "#2dd4bf", x: 360, y: 760, size: 24 }],
      },
      {
        bg: { color1: "#0A4040", color2: "#1E7373", angle: 160 },
        title: { text: "Deep Work", fontSize: 52, fontWeight: 800, y: 55 },
        device: { padding: 55, offsetY: 35 },
        textBlocks: [{ text: "Focus timer with session\nstats and quick-start", fontSize: 13, x: 60, y: 135, width: 300, color: "#ffffffb8", align: "center" }],
        icons: [
          { iconName: "Clock", fill: "#99f6e4", x: 30, y: 750, size: 24 },
          { iconName: "Target", fill: "#5eead4", x: 370, y: 750, size: 24 },
        ],
      },
      {
        bg: { color1: "#0D5F5F", color2: "#1A8080", angle: 160 },
        title: { text: "Resources", fontSize: 52, fontWeight: 800, y: 55 },
        device: { padding: 55, offsetY: 35 },
        textBlocks: [{ text: "Articles and podcasts on\nproductivity and growth", fontSize: 13, x: 60, y: 135, width: 300, color: "#ffffffb8", align: "center" }],
        icons: [{ iconName: "Book Open", fill: "#99f6e4", x: 360, y: 760, size: 24 }],
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
        shapes: [
          { shapeType: "circle", fill: "#3b82f620", x: 280, y: 40, width: 180, height: 180 },
          { shapeType: "triangle", fill: "#8b5cf620", x: 10, y: 680, width: 100, height: 100, rotation: 15 },
        ],
        icons: [{ iconName: "Sparkles", fill: "#60a5fa", x: 20, y: 140, size: 20, opacity: 0.6 }],
      },
      {
        bg: { color1: "#1e293b", color2: "#334155", angle: 135 },
        title: { text: "Explore", fontSize: 52, fontWeight: 800, y: 50, color: "#f8fafc" },
        device: { rotation: 8, offsetX: -30, offsetY: 50, padding: 65 },
        icons: [{ iconName: "Search", fill: "#94a3b8", x: 370, y: 140, size: 20, opacity: 0.5 }],
      },
      {
        bg: { color1: "#0f172a", color2: "#475569", angle: 160 },
        title: { text: "Create", fontSize: 52, fontWeight: 800, y: 50, color: "#f8fafc" },
        device: { rotation: -3, offsetX: 15, offsetY: 30, padding: 55 },
        icons: [
          { iconName: "Pen Tool", fill: "#a78bfa", x: 350, y: 130, size: 24 },
          { iconName: "Layers", fill: "#60a5fa", x: 30, y: 760, size: 22 },
        ],
      },
      {
        bg: { color1: "#1e293b", color2: "#0f172a", angle: 45 },
        title: { text: "Share", fontSize: 52, fontWeight: 800, y: 50, color: "#f8fafc" },
        device: { rotation: 3, offsetX: -15, offsetY: 30, padding: 55 },
        icons: [
          { iconName: "Share", fill: "#34d399", x: 30, y: 130, size: 24 },
          { iconName: "Globe", fill: "#60a5fa", x: 370, y: 760, size: 22 },
        ],
      },
      {
        bg: { color1: "#0f172a", color2: "#334155", angle: 180 },
        title: { text: "Download Now", fontSize: 48, fontWeight: 800, y: 55, color: "#f8fafc" },
        device: { padding: 50, offsetY: 20 },
        shapes: [{ shapeType: "rect", fill: "#3b82f6", x: 110, y: 750, width: 200, height: 40 }],
        textBlocks: [{ text: "Get it free", fontSize: 14, x: 125, y: 758, width: 170, color: "#ffffff", align: "center", fontWeight: 600 }],
        icons: [{ iconName: "Download", fill: "#ffffff", x: 195, y: 710, size: 22 }],
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
        shapes: [
          { shapeType: "star", fill: "#fbbf2430", x: 320, y: 60, width: 80, height: 80, rotation: 10 },
          { shapeType: "circle", fill: "#ffffff10", x: -20, y: 700, width: 150, height: 150 },
        ],
        icons: [{ iconName: "Flame", fill: "#fef08a", x: 30, y: 750, size: 28 }],
      },
      {
        bg: { color1: "#ea580c", color2: "#facc15", angle: 160 },
        title: { text: "Smooth Experience", fontSize: 42, y: 65 },
        device: { rotation: 6, offsetX: -25, offsetY: 45, padding: 60 },
        textBlocks: [{ text: "Designed for speed", fontSize: 13, x: 60, y: 130, width: 300, color: "#ffffffcc", align: "center" }],
        icons: [{ iconName: "Zap", fill: "#ffffff", x: 360, y: 760, size: 24 }],
      },
      {
        bg: { color1: "#b91c1c", color2: "#e11d48", angle: 180 },
        title: { text: "Feature Rich", fontSize: 44, y: 65 },
        device: { rotation: -6, offsetX: 25, offsetY: 45, padding: 60 },
        icons: [
          { iconName: "Check Circle", fill: "#86efac", x: 30, y: 130, size: 24 },
          { iconName: "Trophy", fill: "#fbbf24", x: 370, y: 760, size: 24 },
        ],
      },
      {
        bg: { color1: "#e11d48", color2: "#f472b6", angle: 135 },
        title: { text: "Get Started", fontSize: 50, fontWeight: 800, y: 60 },
        device: { padding: 45, offsetY: 20 },
        shapes: [{ shapeType: "rect", fill: "#ffffff25", x: 110, y: 750, width: 200, height: 40 }],
        textBlocks: [{ text: "Download Free", fontSize: 14, x: 120, y: 758, width: 180, color: "#ffffff", align: "center", fontWeight: 600 }],
        icons: [{ iconName: "Heart", fill: "#fda4af", x: 195, y: 710, size: 22 }],
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
        shapes: [{ shapeType: "rect", fill: "#00000008", x: 0, y: 0, width: 420, height: 180 }],
        textBlocks: [{ text: "Thoughtfully designed", fontSize: 13, x: 60, y: 135, width: 300, color: "#737373", align: "center" }],
      },
      {
        bg: { color1: "#f5f5f5", color2: "#d4d4d4", angle: 135 },
        title: { text: "Simple Navigation", fontSize: 40, y: 70, color: "#262626" },
        device: { rotation: -4, offsetX: 20, offsetY: 40, padding: 65 },
        icons: [{ iconName: "Compass", fill: "#525252", x: 350, y: 760, size: 22 }],
      },
      {
        bg: { color1: "#e5e5e5", color2: "#a3a3a3", angle: 160 },
        title: { text: "Thoughtful Details", fontSize: 40, y: 70, color: "#171717" },
        device: { rotation: 4, offsetX: -20, offsetY: 40, padding: 65 },
        icons: [
          { iconName: "Sparkles", fill: "#404040", x: 30, y: 760, size: 22 },
          { iconName: "Eye", fill: "#525252", x: 370, y: 130, size: 20, opacity: 0.5 },
        ],
      },
      {
        bg: { color1: "#fafafa", color2: "#d4d4d4", angle: 180 },
        title: { text: "Download Free", fontSize: 46, fontWeight: 700, y: 60, color: "#171717" },
        device: { padding: 50, offsetY: 25 },
        shapes: [{ shapeType: "rect", fill: "#171717", x: 130, y: 750, width: 160, height: 38 }],
        textBlocks: [{ text: "App Store", fontSize: 13, x: 140, y: 758, width: 140, color: "#ffffff", align: "center", fontWeight: 600 }],
        icons: [{ iconName: "Download", fill: "#ffffff", x: 195, y: 712, size: 20 }],
      },
    ],
  },

  // ── Creative templates ────────────────────────────────────────────

  {
    id: "showcase-neon-nights",
    name: "Neon Nights",
    category: "Showcase",
    kind: "elaborate",
    preview: { bg1: "#020617", bg2: "#0f172a", angle: 180, textColor: "#f0abfc" },
    fontFamily: "Space Grotesk",
    deviceId: "iosgeneric",
    slides: [
      {
        bg: { color1: "#020617", color2: "#0f172a", angle: 180 },
        title: { text: "Neon Vibes", fontSize: 56, fontWeight: 800, y: 50, color: "#f0abfc" },
        device: { padding: 55, offsetY: 35, rotation: -3 },
        shapes: [
          { shapeType: "circle", fill: "#a855f730", x: -60, y: -40, width: 250, height: 250 },
          { shapeType: "circle", fill: "#ec489920", x: 280, y: 620, width: 200, height: 200 },
          { shapeType: "circle", fill: "#06b6d418", x: 150, y: 760, width: 100, height: 100 },
          { shapeType: "rect", fill: "#c084fc", x: 0, y: 155, width: 420, height: 2 },
        ],
        textBlocks: [{ text: "Experience the future", fontSize: 14, x: 60, y: 130, width: 300, color: "#c084fc90", align: "center" }],
        icons: [
          { iconName: "Zap", fill: "#fbbf24", x: 30, y: 55, size: 20 },
          { iconName: "Sparkles", fill: "#f0abfc", x: 375, y: 55, size: 20 },
        ],
      },
      {
        bg: { color1: "#0f172a", color2: "#020617", angle: 135 },
        title: { text: "Glow Up", fontSize: 52, fontWeight: 800, y: 50, color: "#67e8f9" },
        device: { rotation: 5, offsetX: -20, offsetY: 40, padding: 60 },
        shapes: [
          { shapeType: "circle", fill: "#06b6d425", x: 300, y: 30, width: 180, height: 180 },
          { shapeType: "star", fill: "#fbbf2420", x: 10, y: 700, width: 90, height: 90, rotation: 12 },
          { shapeType: "rect", fill: "#22d3ee", x: 0, y: 155, width: 420, height: 1 },
        ],
        icons: [{ iconName: "Star", fill: "#fbbf24", x: 360, y: 760, size: 24, rotation: -10 }],
      },
      {
        bg: { color1: "#020617", color2: "#1e1b4b", angle: 160 },
        title: { text: "Level Up", fontSize: 52, fontWeight: 800, y: 50, color: "#34d399" },
        device: { rotation: -5, offsetX: 20, offsetY: 40, padding: 60 },
        shapes: [
          { shapeType: "triangle", fill: "#34d39920", x: 320, y: 680, width: 120, height: 120, rotation: 30 },
          { shapeType: "circle", fill: "#10b98120", x: -40, y: 60, width: 160, height: 160 },
          { shapeType: "rect", fill: "#34d399", x: 0, y: 155, width: 420, height: 1 },
        ],
        icons: [
          { iconName: "Trophy", fill: "#fbbf24", x: 30, y: 760, size: 24 },
          { iconName: "Crown", fill: "#fbbf24", x: 370, y: 55, size: 20, opacity: 0.7 },
        ],
      },
      {
        bg: { color1: "#0f172a", color2: "#020617", angle: 180 },
        title: { text: "Get It Now", fontSize: 52, fontWeight: 800, y: 55, color: "#f0abfc" },
        device: { padding: 50, offsetY: 25 },
        shapes: [
          { shapeType: "rect", fill: "#a855f7", x: 100, y: 745, width: 220, height: 44 },
          { shapeType: "circle", fill: "#a855f720", x: 120, y: 690, width: 180, height: 180 },
          { shapeType: "circle", fill: "#ec489910", x: -30, y: -30, width: 200, height: 200 },
          { shapeType: "rect", fill: "#c084fc", x: 0, y: 155, width: 420, height: 2 },
        ],
        textBlocks: [{ text: "Download Free", fontSize: 15, x: 115, y: 754, width: 190, color: "#ffffff", align: "center", fontWeight: 700 }],
        icons: [{ iconName: "Download", fill: "#ffffff", x: 190, y: 705, size: 24 }],
      },
    ],
  },

  {
    id: "showcase-geometric",
    name: "Geometric",
    category: "Showcase",
    kind: "elaborate",
    preview: { bg1: "#fef3c7", bg2: "#fde68a", angle: 135, textColor: "#78350f" },
    fontFamily: "Montserrat",
    deviceId: "iosgeneric",
    slides: [
      {
        bg: { color1: "#fef3c7", color2: "#fde68a", angle: 135 },
        title: { text: "Hello.", fontSize: 64, fontWeight: 800, y: 45, color: "#78350f" },
        device: { padding: 60, offsetY: 40, rotation: -6 },
        shapes: [
          { shapeType: "triangle", fill: "#f59e0b40", x: 300, y: 20, width: 140, height: 140, rotation: 20 },
          { shapeType: "circle", fill: "#d9770640", x: -30, y: 680, width: 120, height: 120 },
          { shapeType: "rect", fill: "#92400e20", x: 350, y: 700, width: 80, height: 80, rotation: 45 },
          { shapeType: "star", fill: "#f59e0b30", x: 40, y: 100, width: 50, height: 50, rotation: -15 },
        ],
        textBlocks: [{ text: "Meet your new favorite app", fontSize: 14, x: 50, y: 130, width: 320, color: "#92400e", align: "center" }],
      },
      {
        bg: { color1: "#fde68a", color2: "#fed7aa", angle: 160 },
        title: { text: "Simple.", fontSize: 60, fontWeight: 800, y: 50, color: "#78350f" },
        device: { rotation: 6, offsetX: -25, offsetY: 45, padding: 65 },
        shapes: [
          { shapeType: "circle", fill: "#ea580c20", x: 320, y: 50, width: 100, height: 100 },
          { shapeType: "triangle", fill: "#c2410c20", x: 20, y: 720, width: 90, height: 90, rotation: -10 },
          { shapeType: "rect", fill: "#f59e0b25", x: 0, y: 150, width: 420, height: 3 },
        ],
        icons: [{ iconName: "Lightbulb", fill: "#92400e", x: 360, y: 760, size: 22 }],
      },
      {
        bg: { color1: "#fed7aa", color2: "#fef3c7", angle: 180 },
        title: { text: "Powerful.", fontSize: 56, fontWeight: 800, y: 50, color: "#78350f" },
        device: { rotation: -4, offsetX: 15, offsetY: 35, padding: 60 },
        shapes: [
          { shapeType: "star", fill: "#f59e0b35", x: 310, y: 700, width: 100, height: 100, rotation: 10 },
          { shapeType: "triangle", fill: "#ea580c15", x: 280, y: 30, width: 160, height: 160, rotation: 45 },
        ],
        icons: [
          { iconName: "Zap", fill: "#b45309", x: 30, y: 760, size: 22 },
          { iconName: "Shield Check", fill: "#92400e", x: 30, y: 55, size: 18, opacity: 0.5 },
        ],
      },
      {
        bg: { color1: "#fef3c7", color2: "#fde68a", angle: 45 },
        title: { text: "Yours.", fontSize: 64, fontWeight: 800, y: 50, color: "#78350f" },
        device: { padding: 50, offsetY: 25 },
        shapes: [
          { shapeType: "circle", fill: "#78350f", x: 130, y: 745, width: 160, height: 44 },
          { shapeType: "triangle", fill: "#f59e0b30", x: -20, y: -20, width: 120, height: 120, rotation: 0 },
          { shapeType: "rect", fill: "#d9770620", x: 330, y: 650, width: 100, height: 100, rotation: 30 },
        ],
        textBlocks: [{ text: "Get Started", fontSize: 15, x: 145, y: 754, width: 130, color: "#ffffff", align: "center", fontWeight: 700 }],
      },
    ],
  },

  {
    id: "showcase-feature-cards",
    name: "Feature Cards",
    category: "Showcase",
    kind: "elaborate",
    preview: { bg1: "#ecfdf5", bg2: "#d1fae5", angle: 180, textColor: "#065f46" },
    fontFamily: "Inter",
    deviceId: "iosgeneric",
    slides: [
      {
        bg: { color1: "#ecfdf5", color2: "#d1fae5", angle: 180 },
        title: { text: "Your App", fontSize: 52, fontWeight: 800, y: 45, color: "#065f46" },
        device: { padding: 55, offsetY: 60 },
        shapes: [
          { shapeType: "rect", fill: "#ffffff", x: 30, y: 120, width: 360, height: 70, opacity: 0.8 },
        ],
        textBlocks: [
          { text: "The smarter way to get things done.\nBuilt for people who care about quality.", fontSize: 13, x: 50, y: 135, width: 320, color: "#047857", align: "center" },
        ],
        icons: [
          { iconName: "Sparkles", fill: "#10b981", x: 30, y: 45, size: 22 },
          { iconName: "Star", fill: "#fbbf24", x: 370, y: 45, size: 20, rotation: 10 },
        ],
      },
      {
        bg: { color1: "#d1fae5", color2: "#a7f3d0", angle: 135 },
        title: { text: "Fast", fontSize: 56, fontWeight: 800, y: 45, color: "#065f46" },
        device: { rotation: -5, offsetX: 20, offsetY: 55, padding: 60 },
        shapes: [
          { shapeType: "rect", fill: "#ffffff90", x: 30, y: 120, width: 360, height: 50 },
        ],
        textBlocks: [{ text: "Blazing speed with zero compromises", fontSize: 13, x: 50, y: 135, width: 320, color: "#047857", align: "center" }],
        icons: [
          { iconName: "Zap", fill: "#059669", x: 370, y: 45, size: 24 },
          { iconName: "Flame", fill: "#f97316", x: 30, y: 760, size: 20, opacity: 0.6 },
        ],
      },
      {
        bg: { color1: "#a7f3d0", color2: "#6ee7b7", angle: 160 },
        title: { text: "Secure", fontSize: 52, fontWeight: 800, y: 45, color: "#065f46" },
        device: { rotation: 5, offsetX: -20, offsetY: 55, padding: 60 },
        shapes: [
          { shapeType: "rect", fill: "#ffffff90", x: 30, y: 120, width: 360, height: 50 },
        ],
        textBlocks: [{ text: "Your data stays yours. Always.", fontSize: 13, x: 50, y: 135, width: 320, color: "#047857", align: "center" }],
        icons: [
          { iconName: "Shield Check", fill: "#059669", x: 30, y: 45, size: 24 },
          { iconName: "Lock", fill: "#065f46", x: 370, y: 760, size: 20, opacity: 0.5 },
        ],
      },
      {
        bg: { color1: "#ecfdf5", color2: "#d1fae5", angle: 180 },
        title: { text: "Try Free", fontSize: 52, fontWeight: 800, y: 50, color: "#065f46" },
        device: { padding: 50, offsetY: 30 },
        shapes: [
          { shapeType: "rect", fill: "#059669", x: 110, y: 745, width: 200, height: 44 },
          { shapeType: "rect", fill: "#ffffff80", x: 30, y: 120, width: 360, height: 50 },
        ],
        textBlocks: [
          { text: "No credit card required", fontSize: 13, x: 60, y: 135, width: 300, color: "#047857", align: "center" },
          { text: "Download Now", fontSize: 15, x: 125, y: 754, width: 170, color: "#ffffff", align: "center", fontWeight: 700 },
        ],
        icons: [
          { iconName: "Heart", fill: "#ef4444", x: 195, y: 705, size: 22 },
          { iconName: "Check", fill: "#10b981", x: 30, y: 45, size: 20 },
          { iconName: "Check", fill: "#10b981", x: 370, y: 45, size: 20 },
        ],
      },
    ],
  },

  {
    id: "showcase-glass",
    name: "Glassmorphism",
    category: "Showcase",
    kind: "elaborate",
    preview: { bg1: "#4f46e5", bg2: "#7c3aed", angle: 135, textColor: "#ffffff" },
    fontFamily: "Poppins",
    deviceId: "iosgeneric",
    slides: [
      {
        bg: { color1: "#4f46e5", color2: "#7c3aed", angle: 135 },
        title: { text: "Clarity", fontSize: 60, fontWeight: 800, y: 45 },
        device: { padding: 55, offsetY: 50, rotation: -2 },
        shapes: [
          { shapeType: "circle", fill: "#818cf830", x: -80, y: -60, width: 300, height: 300 },
          { shapeType: "circle", fill: "#c084fc25", x: 250, y: 580, width: 250, height: 250 },
          { shapeType: "rect", fill: "#ffffff12", x: 30, y: 120, width: 360, height: 60 },
        ],
        textBlocks: [{ text: "Design meets function", fontSize: 15, x: 50, y: 138, width: 320, color: "#e0e7ff", align: "center" }],
      },
      {
        bg: { color1: "#6366f1", color2: "#8b5cf6", angle: 160 },
        title: { text: "Fluid", fontSize: 60, fontWeight: 800, y: 45 },
        device: { rotation: 6, offsetX: -30, offsetY: 50, padding: 65 },
        shapes: [
          { shapeType: "circle", fill: "#a78bfa30", x: 280, y: 20, width: 200, height: 200 },
          { shapeType: "circle", fill: "#818cf820", x: -40, y: 650, width: 180, height: 180 },
          { shapeType: "rect", fill: "#ffffff10", x: 30, y: 120, width: 360, height: 50 },
        ],
        textBlocks: [{ text: "Everything flows", fontSize: 14, x: 60, y: 133, width: 300, color: "#c7d2fe", align: "center" }],
        icons: [{ iconName: "Droplets", fill: "#c7d2fe", x: 370, y: 760, size: 22, opacity: 0.6 }],
      },
      {
        bg: { color1: "#7c3aed", color2: "#a855f7", angle: 180 },
        title: { text: "Smart", fontSize: 60, fontWeight: 800, y: 45 },
        device: { rotation: -6, offsetX: 30, offsetY: 50, padding: 65 },
        shapes: [
          { shapeType: "circle", fill: "#c084fc25", x: -60, y: 30, width: 220, height: 220 },
          { shapeType: "circle", fill: "#f0abfc15", x: 300, y: 680, width: 160, height: 160 },
          { shapeType: "rect", fill: "#ffffff10", x: 30, y: 120, width: 360, height: 50 },
        ],
        textBlocks: [{ text: "Intelligence built in", fontSize: 14, x: 60, y: 133, width: 300, color: "#e9d5ff", align: "center" }],
        icons: [{ iconName: "Brain", fill: "#e9d5ff", x: 30, y: 760, size: 22, opacity: 0.6 }],
      },
      {
        bg: { color1: "#4f46e5", color2: "#6d28d9", angle: 45 },
        title: { text: "Begin", fontSize: 60, fontWeight: 800, y: 50 },
        device: { padding: 50, offsetY: 30 },
        shapes: [
          { shapeType: "circle", fill: "#818cf830", x: 200, y: -40, width: 280, height: 280 },
          { shapeType: "circle", fill: "#a78bfa20", x: -50, y: 600, width: 200, height: 200 },
          { shapeType: "rect", fill: "#ffffff18", x: 95, y: 740, width: 230, height: 50 },
        ],
        textBlocks: [{ text: "Start your journey", fontSize: 16, x: 105, y: 752, width: 210, color: "#ffffff", align: "center", fontWeight: 600 }],
        icons: [
          { iconName: "Arrow Right", fill: "#ffffff", x: 285, y: 750, size: 20 },
          { iconName: "Sparkles", fill: "#fbbf24", x: 30, y: 50, size: 18, opacity: 0.5 },
          { iconName: "Sparkles", fill: "#fbbf24", x: 375, y: 55, size: 14, opacity: 0.3, rotation: 20 },
        ],
      },
    ],
  },

  {
    id: "showcase-editorial",
    name: "Editorial",
    category: "Showcase",
    kind: "elaborate",
    preview: { bg1: "#1c1917", bg2: "#292524", angle: 180, textColor: "#fafaf9" },
    fontFamily: "Playfair Display",
    deviceId: "iosgeneric",
    slides: [
      {
        bg: { color1: "#1c1917", color2: "#292524", angle: 180 },
        title: { text: "Refined", fontSize: 64, fontWeight: 700, y: 40, color: "#fafaf9" },
        device: { padding: 60, offsetY: 55, rotation: -3 },
        shapes: [
          { shapeType: "rect", fill: "#d6d3d1", x: 100, y: 125, width: 220, height: 1 },
          { shapeType: "rect", fill: "#a8a29e50", x: 0, y: 780, width: 420, height: 60 },
        ],
        textBlocks: [
          { text: "E S T.  2 0 2 6", fontSize: 11, x: 130, y: 110, width: 160, color: "#a8a29e", align: "center" },
          { text: "Where craft meets technology", fontSize: 14, x: 60, y: 795, width: 300, color: "#d6d3d1", align: "center" },
        ],
      },
      {
        bg: { color1: "#292524", color2: "#1c1917", angle: 135 },
        title: { text: "Curated", fontSize: 56, fontWeight: 700, y: 45, color: "#fafaf9" },
        device: { rotation: 5, offsetX: -25, offsetY: 50, padding: 65 },
        shapes: [
          { shapeType: "rect", fill: "#78716c", x: 120, y: 130, width: 180, height: 1 },
        ],
        textBlocks: [{ text: "Every detail intentional", fontSize: 13, x: 80, y: 115, width: 260, color: "#a8a29e", align: "center" }],
      },
      {
        bg: { color1: "#1c1917", color2: "#44403c", angle: 160 },
        title: { text: "Timeless", fontSize: 52, fontWeight: 700, y: 45, color: "#fafaf9" },
        device: { rotation: -5, offsetX: 25, offsetY: 50, padding: 65 },
        shapes: [
          { shapeType: "rect", fill: "#78716c", x: 110, y: 130, width: 200, height: 1 },
          { shapeType: "circle", fill: "#78716c15", x: 300, y: 680, width: 140, height: 140 },
        ],
        textBlocks: [{ text: "Built to last", fontSize: 13, x: 80, y: 115, width: 260, color: "#a8a29e", align: "center" }],
        icons: [{ iconName: "Crown", fill: "#d6d3d1", x: 30, y: 760, size: 20, opacity: 0.4 }],
      },
      {
        bg: { color1: "#292524", color2: "#1c1917", angle: 180 },
        title: { text: "Discover", fontSize: 56, fontWeight: 700, y: 50, color: "#fafaf9" },
        device: { padding: 55, offsetY: 30 },
        shapes: [
          { shapeType: "rect", fill: "#fafaf9", x: 120, y: 745, width: 180, height: 42 },
          { shapeType: "rect", fill: "#78716c", x: 130, y: 135, width: 160, height: 1 },
        ],
        textBlocks: [
          { text: "Available now", fontSize: 14, x: 135, y: 754, width: 150, color: "#1c1917", align: "center", fontWeight: 600 },
          { text: "A new standard", fontSize: 13, x: 80, y: 120, width: 260, color: "#a8a29e", align: "center" },
        ],
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

function findIconSvg(name: string): string {
  return ICON_LIBRARY.find((ic) => ic.name === name)?.svg ?? ICON_LIBRARY[0]?.svg ?? "";
}

function createSlide(
  order: number,
  slideConfig: SlideConfig,
  fontFamily: string,
  deviceId: string,
  textColor: string,
): Slide {
  const layers: Layer[] = [
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
  ];

  // Shapes (behind everything else)
  for (const s of slideConfig.shapes ?? []) {
    layers.push(createDefaultShapeLayer(s.shapeType, {
      fill: s.fill, stroke: s.stroke ?? s.fill, strokeWidth: s.strokeWidth ?? 0,
      x: s.x, y: s.y, width: s.width, height: s.height,
      opacity: s.opacity ?? 1, rotation: s.rotation ?? 0,
    }));
  }

  // Title
  layers.push({
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
  } as TitleLayer);

  // Text blocks
  for (const tb of slideConfig.textBlocks ?? []) {
    layers.push(createDefaultTextBlockLayer({
      text: tb.text, fontSize: tb.fontSize ?? 18,
      fontFamily: tb.fontFamily ?? fontFamily,
      fontWeight: tb.fontWeight ?? 400,
      color: tb.color ?? textColor,
      backgroundColor: tb.backgroundColor ?? null,
      x: tb.x, y: tb.y, width: tb.width ?? 300,
      align: tb.align ?? "center",
      opacity: tb.opacity ?? 1,
    }));
  }

  // Device
  layers.push(createDefaultDeviceLayer({
    deviceId,
    rotation: slideConfig.device?.rotation ?? 0,
    offsetX: slideConfig.device?.offsetX ?? 0,
    offsetY: slideConfig.device?.offsetY ?? 0,
    padding: slideConfig.device?.padding ?? 40,
  }));

  // Icons (on top)
  for (const ic of slideConfig.icons ?? []) {
    layers.push(createDefaultIconLayer(findIconSvg(ic.iconName), {
      fill: ic.fill ?? "#ffffff",
      x: ic.x, y: ic.y, size: ic.size ?? 48,
      opacity: ic.opacity ?? 1, rotation: ic.rotation ?? 0,
    }));
  }

  return { id: uuid(), order, layers };
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
