"use client";

import React from "react";
import { v4 as uuid } from "uuid";
import {
  Plus,
  Paintbrush,
  Type,
  Smartphone,
  Image,
} from "lucide-react";
import useEditorStore from "@/lib/store";
import {
  BackgroundLayer,
  TitleLayer,
  DeviceLayer,
  ImageLayer,
} from "@/lib/types";

const LAYER_OPTIONS = [
  {
    type: "background" as const,
    label: "Background",
    icon: Paintbrush,
    create: (): BackgroundLayer => ({
      id: uuid(),
      name: "Background",
      type: "background",
      visible: true,
      locked: false,
      kind: "solid",
      color1: "#3b82f6",
      color2: "#8b5cf6",
      angle: 135,
      imageUrl: null,
    }),
  },
  {
    type: "title" as const,
    label: "Title",
    icon: Type,
    create: (): TitleLayer => ({
      id: uuid(),
      name: "Title",
      type: "title",
      visible: true,
      locked: false,
      text: "New Title",
      fontSize: 36,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#ffffff",
      x: 0,
      y: 80,
      width: 100,
      align: "center",
      position: "top",
    }),
  },
  {
    type: "device" as const,
    label: "Device",
    icon: Smartphone,
    create: (): DeviceLayer => ({
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
      offsetX: 0,
      offsetY: 0,
      screenshotUrl: null,
    }),
  },
  {
    type: "image" as const,
    label: "Image",
    icon: Image,
    create: (): ImageLayer => ({
      id: uuid(),
      name: "Image",
      type: "image",
      visible: true,
      locked: false,
      url: "",
      x: 50,
      y: 50,
      width: 200,
      height: 200,
      opacity: 1,
    }),
  },
];

export default function AddLayerMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const addLayer = useEditorStore((s) => s.addLayer);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-accent hover:bg-accent-hover text-white transition-colors"
      >
        <Plus size={14} />
        Add Layer
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 z-50 bg-surface border border-border rounded-lg shadow-xl py-1 min-w-[160px]"
          onMouseLeave={() => setIsOpen(false)}
        >
          {LAYER_OPTIONS.map(({ type, label, icon: Icon, create }) => (
            <button
              key={type}
              onClick={() => {
                if (activeSlideId) {
                  addLayer(activeSlideId, create());
                }
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
