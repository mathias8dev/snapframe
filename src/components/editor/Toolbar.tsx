"use client";

import React from "react";
import {
  Undo2,
  Redo2,
  Copy,
  Lock,
  Trash2,
  Monitor,
} from "lucide-react";
import useEditorStore from "@/lib/store";
import { DEVICE_TARGETS } from "@/lib/deviceConfigs";

export default function Toolbar() {
  const project = useEditorStore((s) => s.project);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const duplicateSlide = useEditorStore((s) => s.duplicateSlide);
  const removeLayer = useEditorStore((s) => s.removeLayer);
  const toggleLayerLock = useEditorStore((s) => s.toggleLayerLock);
  const setDeviceTarget = useEditorStore((s) => s.setDeviceTarget);
  const { undo, redo } = useEditorStore.temporal.getState();

  // used for context
  void project?.slides.find((s) => s.id === activeSlideId);

  return (
    <div className="h-12 bg-surface border-b border-border flex items-center justify-between px-4">
      {/* Left: actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => undo()}
          className="p-2 rounded-md text-muted hover:text-foreground hover:bg-white/5 transition-colors"
          title="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={() => redo()}
          className="p-2 rounded-md text-muted hover:text-foreground hover:bg-white/5 transition-colors"
          title="Redo"
        >
          <Redo2 size={16} />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          onClick={() => activeSlideId && duplicateSlide(activeSlideId)}
          disabled={!activeSlideId}
          className="p-2 rounded-md text-muted hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-30"
          title="Duplicate Slide"
        >
          <Copy size={16} />
        </button>
        <button
          onClick={() => {
            if (activeSlideId && activeLayerId)
              toggleLayerLock(activeSlideId, activeLayerId);
          }}
          disabled={!activeLayerId}
          className="p-2 rounded-md text-muted hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-30"
          title="Lock/Unlock Layer"
        >
          <Lock size={16} />
        </button>
        <button
          onClick={() => {
            if (activeSlideId && activeLayerId) {
              removeLayer(activeSlideId, activeLayerId);
            }
          }}
          disabled={!activeLayerId}
          className="p-2 rounded-md text-muted hover:text-red-400 hover:bg-white/5 transition-colors disabled:opacity-30"
          title="Delete Layer"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Center: tab pills */}
      <div className="flex items-center gap-1">
        {["Setup", "Background", "Localise", "App Screens"].map((tab) => (
          <button
            key={tab}
            className="px-3 py-1 rounded-full text-xs text-muted hover:text-foreground hover:bg-white/5 transition-colors"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Right: device selector */}
      <div className="flex items-center gap-2">
        <Monitor size={14} className="text-muted" />
        <select
          value={project?.deviceTarget ?? "iphone15pro"}
          onChange={(e) => setDeviceTarget(e.target.value)}
          className="bg-surface border border-border rounded-md px-2 py-1 text-xs text-foreground"
        >
          {DEVICE_TARGETS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
