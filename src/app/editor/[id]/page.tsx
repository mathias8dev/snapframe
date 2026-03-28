"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Smartphone,
  Download,
  Save,
  ChevronLeft,
} from "lucide-react";
import useEditorStore, {
  getStoredProjects,
  persistProject,
  persistProjectSync,
} from "@/lib/store";
import Toolbar from "@/components/editor/Toolbar";
import SlideStrip from "@/components/editor/SlideStrip";
import LayerPanel from "@/components/editor/LayerPanel";
import LayerControls from "@/components/editor/LayerControls";
import AddLayerMenu from "@/components/editor/AddLayerMenu";
import ExportModal from "@/components/editor/ExportModal";

const Canvas = dynamic(() => import("@/components/editor/Canvas"), {
  ssr: false,
});

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const project = useEditorStore((s) => s.project);
  const loadProject = useEditorStore((s) => s.loadProject);
  const createProject = useEditorStore((s) => s.createProject);
  const [showExport, setShowExport] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load or create project
  useEffect(() => {
    if (loaded) return;

    // If the store already has this project loaded (e.g. from template page), skip
    if (project?.id === id) {
      setLoaded(true);
      return;
    }

    if (id === "new") {
      const p = createProject("Untitled Project", "iosgeneric");
      router.replace(`/editor/${p.id}`);
      setLoaded(true);
      return;
    }

    const projects = getStoredProjects();
    const existing = projects.find((p) => p.id === id);
    if (existing) {
      loadProject(existing);
    } else {
      const p = createProject("Untitled Project", "iosgeneric");
      router.replace(`/editor/${p.id}`);
    }
    setLoaded(true);
  }, [id, loaded, project, loadProject, createProject, router]);

  // Persist on change
  useEffect(() => {
    if (project) {
      persistProject(project);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top navigation */}
      <nav className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/projects")}
            className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <Smartphone size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold">SnapFrame</span>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => router.push("/projects")}
              className="text-muted hover:text-foreground transition-colors"
            >
              Projects
            </button>
            <button
              onClick={() => router.push("/templates")}
              className="text-muted hover:text-foreground transition-colors"
            >
              Templates
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={project.name}
            onChange={(e) =>
              useEditorStore.getState().updateProjectName(e.target.value)
            }
            className="bg-transparent border border-transparent hover:border-border focus:border-accent rounded-md px-2 py-1 text-sm text-foreground outline-none transition-colors max-w-[200px]"
          />
          <button
            onClick={() => {
              if (project) {
                persistProjectSync(project);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:border-accent/50 text-foreground text-sm rounded-md transition-colors"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm rounded-md transition-colors"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </nav>

      {/* Toolbar */}
      <Toolbar />

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide strip */}
        <SlideStrip />

        {/* Canvas */}
        <Canvas />

        {/* Right panel */}
        <div className="w-[300px] bg-surface border-l border-border flex flex-col overflow-y-auto">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <AddLayerMenu />
          </div>

          <div className="p-3 border-b border-border">
            <LayerPanel />
          </div>

          <div className="flex-1 p-3 overflow-y-auto">
            <LayerControls />
          </div>
        </div>
      </div>

      {/* Export modal */}
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
    </div>
  );
}
