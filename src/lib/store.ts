import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { temporal } from "zundo";
import { v4 as uuid } from "uuid";
import {
  Project,
  Slide,
  Layer,
  BackgroundLayer,
  TitleLayer,
  DeviceLayer,
} from "./types";

interface EditorStore {
  project: Project | null;
  activeSlideId: string | null;
  activeLayerId: string | null;

  // Project actions
  loadProject: (project: Project) => void;
  createProject: (name: string, deviceTarget: string) => Project;
  updateProjectName: (name: string) => void;
  setDeviceTarget: (target: string) => void;

  // Slide actions
  setActiveSlide: (id: string) => void;
  addSlide: () => void;
  duplicateSlide: (id: string) => void;
  removeSlide: (id: string) => void;
  moveSlide: (fromIndex: number, toIndex: number) => void;

  // Layer actions
  setActiveLayer: (id: string | null) => void;
  addLayer: (slideId: string, layer: Layer) => void;
  removeLayer: (slideId: string, layerId: string) => void;
  updateLayer: (slideId: string, layerId: string, patch: Partial<Layer>) => void;
  reorderLayers: (slideId: string, fromIndex: number, toIndex: number) => void;
  duplicateLayer: (slideId: string, layerId: string) => void;
  toggleLayerVisibility: (slideId: string, layerId: string) => void;
  toggleLayerLock: (slideId: string, layerId: string) => void;

  // Helpers
  getActiveSlide: () => Slide | null;
  getActiveLayer: () => Layer | null;
}

function createDefaultSlide(): Slide {
  return {
    id: uuid(),
    order: 0,
    layers: [
      {
        id: uuid(),
        name: "Background",
        type: "background",
        visible: true,
        locked: false,
        kind: "gradient",
        color1: "#7c3aed",
        color2: "#2563eb",
        angle: 135,
        imageUrl: null,
      } as BackgroundLayer,
      {
        id: uuid(),
        name: "Title",
        type: "title",
        visible: true,
        locked: false,
        text: "Your App Title",
        fontSize: 48,
        fontFamily: "Inter",
        fontWeight: 700,
        color: "#ffffff",
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
        deviceId: "iphone15pro",
        orientation: "portrait",
        sizing: "contain",
        cornerRounding: "auto",
        frameVisible: true,
        frameOpacity: 1,
        padding: 40,
        rotation: 0,
        screenshotUrl: null,
      } as DeviceLayer,
    ],
  };
}

export function createNewProject(name: string, deviceTarget: string): Project {
  const slide = createDefaultSlide();
  return {
    id: uuid(),
    name,
    deviceTarget,
    slides: [slide],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

const useEditorStore = create<EditorStore>()(
  temporal(
    immer((set, get) => ({
      project: null,
      activeSlideId: null,
      activeLayerId: null,

      loadProject: (project) =>
        set((state) => {
          state.project = project;
          state.activeSlideId = project.slides[0]?.id ?? null;
          state.activeLayerId = null;
        }),

      createProject: (name, deviceTarget) => {
        const project = createNewProject(name, deviceTarget);
        set((state) => {
          state.project = project;
          state.activeSlideId = project.slides[0]?.id ?? null;
          state.activeLayerId = null;
        });
        return project;
      },

      updateProjectName: (name) =>
        set((state) => {
          if (state.project) {
            state.project.name = name;
            state.project.updatedAt = Date.now();
          }
        }),

      setDeviceTarget: (target) =>
        set((state) => {
          if (state.project) {
            state.project.deviceTarget = target;
            state.project.updatedAt = Date.now();
          }
        }),

      setActiveSlide: (id) =>
        set((state) => {
          state.activeSlideId = id;
          state.activeLayerId = null;
        }),

      addSlide: () =>
        set((state) => {
          if (!state.project) return;
          const currentSlide = state.project.slides.find(
            (s) => s.id === state.activeSlideId
          );
          const newSlide: Slide = currentSlide
            ? {
                id: uuid(),
                order: state.project.slides.length,
                layers: JSON.parse(JSON.stringify(currentSlide.layers)).map(
                  (l: Layer) => ({ ...l, id: uuid() })
                ),
              }
            : createDefaultSlide();
          newSlide.order = state.project.slides.length;
          state.project.slides.push(newSlide);
          state.activeSlideId = newSlide.id;
          state.activeLayerId = null;
          state.project.updatedAt = Date.now();
        }),

      duplicateSlide: (id) =>
        set((state) => {
          if (!state.project) return;
          const slide = state.project.slides.find((s) => s.id === id);
          if (!slide) return;
          const newSlide: Slide = {
            ...JSON.parse(JSON.stringify(slide)),
            id: uuid(),
            order: state.project.slides.length,
          };
          newSlide.layers = newSlide.layers.map((l: Layer) => ({
            ...l,
            id: uuid(),
          }));
          const idx = state.project.slides.findIndex((s) => s.id === id);
          state.project.slides.splice(idx + 1, 0, newSlide);
          state.project.slides.forEach((s, i) => (s.order = i));
          state.activeSlideId = newSlide.id;
          state.project.updatedAt = Date.now();
        }),

      removeSlide: (id) =>
        set((state) => {
          if (!state.project || state.project.slides.length <= 1) return;
          const idx = state.project.slides.findIndex((s) => s.id === id);
          state.project.slides.splice(idx, 1);
          state.project.slides.forEach((s, i) => (s.order = i));
          if (state.activeSlideId === id) {
            state.activeSlideId =
              state.project.slides[Math.max(0, idx - 1)]?.id ?? null;
          }
          state.project.updatedAt = Date.now();
        }),

      moveSlide: (fromIndex, toIndex) =>
        set((state) => {
          if (!state.project) return;
          const [moved] = state.project.slides.splice(fromIndex, 1);
          state.project.slides.splice(toIndex, 0, moved);
          state.project.slides.forEach((s, i) => (s.order = i));
          state.project.updatedAt = Date.now();
        }),

      setActiveLayer: (id) =>
        set((state) => {
          state.activeLayerId = id;
        }),

      addLayer: (slideId, layer) =>
        set((state) => {
          if (!state.project) return;
          const slide = state.project.slides.find((s) => s.id === slideId);
          if (!slide) return;
          slide.layers.push(layer);
          state.activeLayerId = layer.id;
          state.project.updatedAt = Date.now();
        }),

      removeLayer: (slideId, layerId) =>
        set((state) => {
          if (!state.project) return;
          const slide = state.project.slides.find((s) => s.id === slideId);
          if (!slide) return;
          slide.layers = slide.layers.filter((l) => l.id !== layerId);
          if (state.activeLayerId === layerId) {
            state.activeLayerId = null;
          }
          state.project.updatedAt = Date.now();
        }),

      updateLayer: (slideId, layerId, patch) =>
        set((state) => {
          if (!state.project) return;
          const slide = state.project.slides.find((s) => s.id === slideId);
          if (!slide) return;
          const layer = slide.layers.find((l) => l.id === layerId);
          if (!layer) return;
          Object.assign(layer, patch);
          state.project.updatedAt = Date.now();
        }),

      reorderLayers: (slideId, fromIndex, toIndex) =>
        set((state) => {
          if (!state.project) return;
          const slide = state.project.slides.find((s) => s.id === slideId);
          if (!slide) return;
          const [moved] = slide.layers.splice(fromIndex, 1);
          slide.layers.splice(toIndex, 0, moved);
          state.project.updatedAt = Date.now();
        }),

      duplicateLayer: (slideId, layerId) =>
        set((state) => {
          if (!state.project) return;
          const slide = state.project.slides.find((s) => s.id === slideId);
          if (!slide) return;
          const layer = slide.layers.find((l) => l.id === layerId);
          if (!layer) return;
          const newLayer = {
            ...JSON.parse(JSON.stringify(layer)),
            id: uuid(),
            name: `${layer.name} copy`,
          };
          const idx = slide.layers.findIndex((l) => l.id === layerId);
          slide.layers.splice(idx + 1, 0, newLayer);
          state.activeLayerId = newLayer.id;
          state.project.updatedAt = Date.now();
        }),

      toggleLayerVisibility: (slideId, layerId) =>
        set((state) => {
          if (!state.project) return;
          const slide = state.project.slides.find((s) => s.id === slideId);
          if (!slide) return;
          const layer = slide.layers.find((l) => l.id === layerId);
          if (!layer) return;
          layer.visible = !layer.visible;
          state.project.updatedAt = Date.now();
        }),

      toggleLayerLock: (slideId, layerId) =>
        set((state) => {
          if (!state.project) return;
          const slide = state.project.slides.find((s) => s.id === slideId);
          if (!slide) return;
          const layer = slide.layers.find((l) => l.id === layerId);
          if (!layer) return;
          layer.locked = !layer.locked;
          state.project.updatedAt = Date.now();
        }),

      getActiveSlide: () => {
        const state = get();
        if (!state.project || !state.activeSlideId) return null;
        return (
          state.project.slides.find((s) => s.id === state.activeSlideId) ?? null
        );
      },

      getActiveLayer: () => {
        const state = get();
        if (!state.project || !state.activeSlideId || !state.activeLayerId)
          return null;
        const slide = state.project.slides.find(
          (s) => s.id === state.activeSlideId
        );
        if (!slide) return null;
        return slide.layers.find((l) => l.id === state.activeLayerId) ?? null;
      },
    })),
    { limit: 50 }
  )
);

export default useEditorStore;

// localStorage persistence helper
let saveTimeout: NodeJS.Timeout | null = null;

export function persistProject(project: Project) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    persistProjectSync(project);
  }, 500);
}

export function persistProjectSync(project: Project) {
  const projects = getStoredProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem("snapframe_projects", JSON.stringify(projects));
}

export function getStoredProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("snapframe_projects") || "[]");
  } catch {
    return [];
  }
}

export function deleteStoredProject(id: string) {
  const projects = getStoredProjects().filter((p) => p.id !== id);
  localStorage.setItem("snapframe_projects", JSON.stringify(projects));
}
