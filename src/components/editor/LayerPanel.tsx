"use client";

import React, { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  GripVertical,
  Image,
  Type,
  Smartphone,
  Paintbrush,
  Layers,
  Shapes,
  TextCursor,
  Sticker,
} from "lucide-react";
import useEditorStore from "@/lib/store";
import { Layer } from "@/lib/types";
import { cn } from "@/lib/utils";

const layerIcons: Record<string, React.ElementType> = {
  background: Paintbrush,
  title: Type,
  device: Smartphone,
  image: Image,
  layout: Layers,
  shape: Shapes,
  textblock: TextCursor,
  icon: Sticker,
};

function SortableLayerItem({
  layer,
  slideId,
  isActive,
}: {
  layer: Layer;
  slideId: string;
  isActive: boolean;
}) {
  const {
    setActiveLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    duplicateLayer,
    removeLayer,
    updateLayer,
  } = useEditorStore();

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(layer.name);
  const renameRef = useRef<HTMLInputElement>(null);

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== layer.name) {
      updateLayer(slideId, layer.id, { name: trimmed });
    }
    setIsRenaming(false);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = layerIcons[layer.type] || Layers;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer group text-sm",
        isActive
          ? "bg-accent/20 border border-accent/40"
          : "hover:bg-white/5 border border-transparent"
      )}
      onClick={() => setActiveLayer(layer.id)}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted hover:text-foreground p-0.5"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>

      <Icon size={14} className="text-muted shrink-0" />

      {isRenaming ? (
        <input
          ref={renameRef}
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") { setRenameValue(layer.name); setIsRenaming(false); }
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-transparent border border-accent rounded px-1 py-0 text-xs text-foreground outline-none min-w-0"
        />
      ) : (
        <span
          className="flex-1 truncate text-xs"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setRenameValue(layer.name);
            setIsRenaming(true);
          }}
        >
          {layer.name}
        </span>
      )}

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLayerVisibility(slideId, layer.id);
          }}
          className="p-0.5 hover:text-foreground text-muted"
        >
          {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLayerLock(slideId, layer.id);
          }}
          className="p-0.5 hover:text-foreground text-muted"
        >
          {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            duplicateLayer(slideId, layer.id);
          }}
          className="p-0.5 hover:text-foreground text-muted"
        >
          <Copy size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeLayer(slideId, layer.id);
          }}
          className="p-0.5 hover:text-red-400 text-muted"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

export default function LayerPanel() {
  const project = useEditorStore((s) => s.project);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const reorderLayers = useEditorStore((s) => s.reorderLayers);

  const slide = project?.slides.find((s) => s.id === activeSlideId);
  const layers = slide?.layers ?? [];
  const reversedLayers = [...layers].reverse();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !slide) return;

    const realOldIndex = layers.length - 1 - reversedLayers.findIndex((l) => l.id === active.id);
    const realNewIndex = layers.length - 1 - reversedLayers.findIndex((l) => l.id === over.id);
    if (realOldIndex >= 0 && realNewIndex >= 0) {
      reorderLayers(slide.id, realOldIndex, realNewIndex);
    }
  };

  if (!slide) return null;

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider px-2 mb-1">
        Layers
      </h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={reversedLayers.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {reversedLayers.map((layer) => (
            <SortableLayerItem
              key={layer.id}
              layer={layer}
              slideId={slide.id}
              isActive={layer.id === activeLayerId}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
