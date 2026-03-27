"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Smartphone, ArrowRight } from "lucide-react";
import {
  getTemplates,
  createProjectFromTemplate,
  TEMPLATE_CATEGORIES,
} from "@/lib/templates";
import useEditorStore, { persistProjectSync } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
  const router = useRouter();
  const templates = getTemplates();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered =
    activeCategory === "All"
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  const handleUseTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    const project = createProjectFromTemplate(template);
    persistProjectSync(project);
    useEditorStore.getState().loadProject(project);
    router.push(`/editor/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Smartphone size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold">SnapFrame</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/projects")}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Projects
          </button>
          <button
            onClick={() => router.push("/editor/new")}
            className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm rounded-md transition-colors"
          >
            Blank Project
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">Templates</h1>
        <p className="text-sm text-muted mb-6">
          Choose a template to get started quickly. Customize everything in the editor.
        </p>

        {/* Category filter */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors",
                activeCategory === cat
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="group relative rounded-xl bg-surface border border-border hover:border-accent/30 overflow-hidden transition-all"
            >
              {/* Preview */}
              <div
                className="h-48 flex flex-col items-center justify-center p-4 relative"
                style={{
                  background: `linear-gradient(${template.preview.angle}deg, ${template.preview.bg1}, ${template.preview.bg2})`,
                }}
              >
                {/* Title preview */}
                <p
                  className="text-sm font-bold mb-3 text-center z-10"
                  style={{
                    color: template.preview.textColor,
                    fontFamily: template.fontFamily,
                  }}
                >
                  {template.title}
                </p>

                {/* Mini device */}
                <div className="relative z-10">
                  <div className="w-12 h-20 rounded-md bg-black/40 border border-white/10 flex items-center justify-center">
                    <div className="w-10 h-17 rounded-sm bg-black/30" />
                  </div>
                </div>

                {/* Category badge */}
                <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 text-white/70">
                  {template.category}
                </span>
              </div>

              {/* Info */}
              <div className="p-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{template.name}</h3>
                  <p className="text-xs text-muted">{template.fontFamily}</p>
                </div>
                <button
                  onClick={() => handleUseTemplate(template.id)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-accent hover:bg-accent-hover text-white text-xs rounded-md transition-colors"
                >
                  Use <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
