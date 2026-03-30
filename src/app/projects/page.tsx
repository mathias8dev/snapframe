"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Smartphone,
  Trash2,
  Copy,
  FolderOpen,
  Clock,
} from "lucide-react";
import { v4 as uuid } from "uuid";
import useEditorStore, {
  getStoredProjects,
  deleteStoredProject,
  createNewProject,
  persistProjectSync,
} from "@/lib/store";
import { Project } from "@/lib/types";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(getStoredProjects());
  }, []);

  const handleNewProject = () => {
    const project = createNewProject("Untitled Project", "iosgeneric");
    persistProjectSync(project);
    useEditorStore.getState().loadProject(project);
    router.push(`/editor/${project.id}`);
  };

  const handleDuplicate = (project: Project) => {
    const clone: Project = JSON.parse(JSON.stringify(project));
    clone.id = uuid();
    clone.name = `${project.name} (copy)`;
    clone.createdAt = Date.now();
    clone.updatedAt = Date.now();
    // Give new IDs to all slides and layers
    clone.slides = clone.slides.map((s) => ({
      ...s,
      id: uuid(),
      layers: s.layers.map((l) => ({ ...l, id: uuid() })),
    }));
    persistProjectSync(clone);
    setProjects(getStoredProjects());
  };

  const handleDelete = (id: string) => {
    deleteStoredProject(id);
    setProjects(getStoredProjects());
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            onClick={() => router.push("/templates")}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Templates
          </button>
          <button
            onClick={handleNewProject}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm rounded-md transition-colors"
          >
            <Plus size={14} />
            New Project
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">Your Projects</h1>
        <p className="text-sm text-muted mb-8">
          All your screenshot projects, saved locally in your browser.
        </p>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen size={48} className="text-muted mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No projects yet</h2>
            <p className="text-sm text-muted mb-6">
              Create your first project or start from a template.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleNewProject}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm rounded-md transition-colors"
              >
                <Plus size={14} />
                New Project
              </button>
              <button
                onClick={() => router.push("/templates")}
                className="px-4 py-2 bg-surface border border-border text-foreground hover:border-accent/50 text-sm rounded-md transition-colors"
              >
                Browse Templates
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* New project card */}
            <button
              onClick={handleNewProject}
              className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/50 text-muted hover:text-foreground transition-colors min-h-[160px]"
            >
              <Plus size={24} />
              <span className="text-sm">New Project</span>
            </button>

            {/* Existing projects */}
            {projects
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((project) => (
                <div
                  key={project.id}
                  className="group relative flex flex-col rounded-xl bg-surface border border-border hover:border-accent/30 transition-colors overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/editor/${project.id}`)}
                >
                  {/* Preview area */}
                  <div
                    className="h-24 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${
                        (project.slides[0]?.layers.find(
                          (l) => l.type === "background"
                        ) as { color1?: string; color2?: string } | undefined)?.color1 ?? "#7c3aed"
                      }, ${
                        (project.slides[0]?.layers.find(
                          (l) => l.type === "background"
                        ) as { color1?: string; color2?: string } | undefined)?.color2 ?? "#2563eb"
                      })`,
                    }}
                  >
                    <div className="w-8 h-14 rounded-md bg-black/30 border border-white/10" />
                  </div>

                  {/* Info */}
                  <div className="p-3 flex-1">
                    <h3 className="text-sm font-semibold truncate">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted">
                      <Clock size={10} />
                      {formatDate(project.updatedAt)}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {project.slides.length} slide
                      {project.slides.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(project);
                      }}
                      className="p-1.5 rounded-md bg-black/50 text-white/70 hover:text-foreground transition-colors"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                      className="p-1.5 rounded-md bg-black/50 text-white/70 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
