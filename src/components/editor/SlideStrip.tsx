"use client";

import React from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import { Plus, MoreVertical, Copy, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import useEditorStore from "@/lib/store";
import { BackgroundLayer, TitleLayer } from "@/lib/types";
import { cn } from "@/lib/utils";

function SlideThumbnail({
  slideId,
  index,
  isActive,
}: {
  slideId: string;
  index: number;
  isActive: boolean;
}) {
  const project = useEditorStore((s) => s.project);
  const setActiveSlide = useEditorStore((s) => s.setActiveSlide);
  const duplicateSlide = useEditorStore((s) => s.duplicateSlide);
  const removeSlide = useEditorStore((s) => s.removeSlide);
  const moveSlide = useEditorStore((s) => s.moveSlide);
  const [showMenu, setShowMenu] = React.useState(false);

  const slide = project?.slides.find((s) => s.id === slideId);
  if (!slide) return null;

  const thumbW = 140;
  const thumbH = 250;

  const bgLayer = slide.layers.find((l) => l.type === "background") as BackgroundLayer | undefined;
  const titleLayer = slide.layers.find((l) => l.type === "title") as TitleLayer | undefined;

  return (
    <div className="relative group">
      <div
        onClick={() => setActiveSlide(slideId)}
        className={cn(
          "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
          isActive
            ? "border-accent shadow-lg shadow-accent/20"
            : "border-transparent hover:border-border"
        )}
      >
        <div className="absolute top-1 left-1.5 z-10 text-[10px] text-white/60 font-medium">
          {index + 1}
        </div>

        <Stage width={thumbW} height={thumbH} listening={false}>
          <Layer>
            {bgLayer && bgLayer.kind === "gradient" ? (
              <Rect
                width={thumbW}
                height={thumbH}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: thumbW, y: thumbH }}
                fillLinearGradientColorStops={[
                  0,
                  bgLayer.color1,
                  1,
                  bgLayer.color2,
                ]}
              />
            ) : bgLayer ? (
              <Rect width={thumbW} height={thumbH} fill={bgLayer.color1} />
            ) : (
              <Rect width={thumbW} height={thumbH} fill="#27272a" />
            )}

            {titleLayer && titleLayer.visible && (
              <Text
                text={titleLayer.text}
                x={8}
                y={titleLayer.position === "top" ? 24 : thumbH - 40}
                width={thumbW - 16}
                fontSize={10}
                fontFamily={titleLayer.fontFamily}
                fontStyle={titleLayer.fontWeight >= 700 ? "bold" : "normal"}
                fill={titleLayer.color}
                align={titleLayer.align}
              />
            )}

            {/* Mini device frame */}
            <Rect
              x={thumbW * 0.2}
              y={thumbH * 0.25}
              width={thumbW * 0.6}
              height={thumbH * 0.6}
              cornerRadius={6}
              fill="#1a1a1a"
              stroke="#333"
              strokeWidth={0.5}
            />
            <Rect
              x={thumbW * 0.22}
              y={thumbH * 0.27}
              width={thumbW * 0.56}
              height={thumbH * 0.56}
              cornerRadius={4}
              fill="#000"
            />
          </Layer>
        </Stage>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded bg-black/50 text-white/70 hover:text-white"
        >
          <MoreVertical size={12} />
        </button>
      </div>

      {showMenu && (
        <div
          className="absolute top-8 right-0 z-50 bg-surface border border-border rounded-md shadow-xl py-1 min-w-[120px]"
          onMouseLeave={() => setShowMenu(false)}
        >
          <button
            onClick={() => {
              duplicateSlide(slideId);
              setShowMenu(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-muted hover:text-foreground hover:bg-white/5"
          >
            <Copy size={12} /> Duplicate
          </button>
          {index > 0 && (
            <button
              onClick={() => {
                moveSlide(index, index - 1);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-muted hover:text-foreground hover:bg-white/5"
            >
              <ArrowUp size={12} /> Move Up
            </button>
          )}
          {project && index < project.slides.length - 1 && (
            <button
              onClick={() => {
                moveSlide(index, index + 1);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-muted hover:text-foreground hover:bg-white/5"
            >
              <ArrowDown size={12} /> Move Down
            </button>
          )}
          {project && project.slides.length > 1 && (
            <button
              onClick={() => {
                removeSlide(slideId);
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400 hover:bg-white/5"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function SlideStrip() {
  const project = useEditorStore((s) => s.project);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const addSlide = useEditorStore((s) => s.addSlide);

  if (!project) return null;

  return (
    <div className="w-[200px] bg-surface border-r border-border flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
          Slides
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {project.slides.map((slide, i) => (
          <SlideThumbnail
            key={slide.id}
            slideId={slide.id}
            index={i}
            isActive={slide.id === activeSlideId}
          />
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <button
          onClick={addSlide}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md border border-dashed border-border text-muted hover:text-foreground hover:border-accent transition-colors text-xs"
        >
          <Plus size={14} />
          Add Slide
        </button>
      </div>
    </div>
  );
}
