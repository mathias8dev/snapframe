# SnapFrame

An App Store screenshot generator built with Next.js, TypeScript, Tailwind CSS, and Konva.js. Design beautiful, high-converting screenshots for the App Store and Google Play with an intuitive layer-based editor.

## Features

### Layer-Based Editor
- **Background Layer** -- Solid color, linear gradient, or image fills
- **Title Layer** -- Customizable text with font family, size, weight, color, alignment, and position
- **Device Layer** -- Realistic device frames with Dynamic Island, notch, corner radius, rotation, and position offset
- **Image Layer** -- Standalone images with opacity, position, and z-ordering
- Drag-to-reorder layers, toggle visibility/lock, duplicate and delete
- Full undo/redo support (50 steps)

### Device Support
- **iOS**: iOS Generic, iPhone SE, iPhone 13 mini, iPhone 14, iPhone 15 Pro, iPhone 16 Pro, iPhone 16 Pro Max, iPad Air, iPad Pro 11", iPad Pro 13"
- **Android**: Android Generic, Pixel 9, Pixel 9 Pro, Galaxy S24, Galaxy S24 Ultra, OnePlus 12
- Device-specific features: Dynamic Island, notch rendering, screen insets
- Adjustable frame visibility, opacity, corner rounding, rotation, padding, and position

### Export
- Export as PNG or JPEG at 1x, 2x, or 3x resolution
- Single slide or batch export (all slides as ZIP)
- Auto-detects platform (Apple/Google) from project device target
- Default export size matches the device's native resolution
- Additional App Store and Google Play store-specific size presets
- Displays store requirements (formats, file size limits, screenshot counts)

### Templates
12 pre-designed templates across 5 categories: Minimal, Bold, Gradient, Dark, and Colorful. One-click to create a new project from any template.

### Projects
- Create, rename, and delete projects
- All data persisted locally in the browser (localStorage)
- Project list with gradient previews and metadata

### Canvas
- Ctrl + scroll to zoom in/out (25%--300%)
- Click outside the canvas to deselect layers
- Drag device frames and text directly on the canvas

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Canvas | Konva.js + React Konva |
| State | Zustand + Immer + Zundo |
| Drag & Drop | @dnd-kit |
| UI Primitives | Radix UI |
| Icons | Lucide React |
| Color Picker | React Colorful |
| Export | Canvas API + JSZip |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone <repo-url>
cd snapframe
npm install
```

### Development

```bash
npm run dev
```

Opens at [http://localhost:32000](http://localhost:32000).

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── projects/page.tsx        # Project list
│   ├── templates/page.tsx       # Template gallery
│   └── editor/[id]/page.tsx     # Main editor
├── components/editor/
│   ├── Canvas.tsx               # Konva stage, renders all layers
│   ├── Toolbar.tsx              # Undo/redo, device target selector
│   ├── SlideStrip.tsx           # Slide thumbnails
│   ├── LayerPanel.tsx           # Layer list with drag-to-reorder
│   ├── LayerControls.tsx        # Property inspector for selected layer
│   ├── AddLayerMenu.tsx         # Add new layers
│   ├── DeviceFrame.tsx          # Device picker modal
│   └── ExportModal.tsx          # Export dialog
└── lib/
    ├── types.ts                 # TypeScript interfaces
    ├── store.ts                 # Zustand store with undo/redo
    ├── deviceConfigs.ts         # Device specs (dimensions, insets, features)
    ├── templates.ts             # 12 template definitions
    └── utils.ts                 # Utility functions
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 32000 |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## License

MIT
