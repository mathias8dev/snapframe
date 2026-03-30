"use client";

import { useRouter } from "next/navigation";
import {
  Smartphone,
  ArrowRight,
  Layers,
  Download,
  Palette,
  Zap,
  Monitor,
  Star,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/lib/useTheme";

export default function Home() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Smartphone size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold">SnapFrame</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/projects")}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Projects
          </button>
          <button
            onClick={() => router.push("/templates")}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Templates
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-muted hover:text-foreground transition-colors"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => router.push("/projects")}
            className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm rounded-md transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-6">
          <Zap size={12} />
          Free App Store Screenshot Generator
        </div>

        <h1 className="text-5xl md:text-6xl font-bold max-w-3xl leading-tight mb-4">
          Create Stunning
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-500">
            App Store Screenshots
          </span>
        </h1>

        <p className="text-lg text-muted max-w-xl mb-8">
          Design beautiful, high-converting screenshots for the App Store and Google Play
          in minutes. No design skills required.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/projects")}
            className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
          >
            Start Creating <ArrowRight size={16} />
          </button>
          <button
            onClick={() => router.push("/templates")}
            className="flex items-center gap-2 px-6 py-3 bg-surface border border-border hover:border-accent/50 text-foreground rounded-lg text-sm font-medium transition-colors"
          >
            Browse Templates
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">
          Everything you need to ship screenshots
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Monitor,
              title: "Device Frames",
              desc: "Realistic iPhone, iPad, and Android frames with Dynamic Island, notch, and more.",
            },
            {
              icon: Layers,
              title: "Layer-Based Editor",
              desc: "Full control with draggable layers — backgrounds, titles, device frames, and images.",
            },
            {
              icon: Palette,
              title: "Beautiful Templates",
              desc: "12 professionally designed templates to get you started in seconds.",
            },
            {
              icon: Download,
              title: "Export Ready",
              desc: "Export at 1x, 2x, or 3x resolution in PNG, JPEG, or WebP. Batch export with ZIP.",
            },
            {
              icon: Star,
              title: "Undo/Redo History",
              desc: "Never lose your work. Full undo/redo support with 50 steps of history.",
            },
            {
              icon: Zap,
              title: "Fast & Local",
              desc: "Everything runs in your browser. No uploads, no accounts, no limits.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-xl bg-surface border border-border hover:border-accent/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <Icon size={20} className="text-accent" />
              </div>
              <h3 className="text-sm font-semibold mb-1">{title}</h3>
              <p className="text-xs text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border text-center">
        <p className="text-xs text-muted">
          SnapFrame — Open source screenshot generator. Built with Next.js, Konva.js & Tailwind CSS.
        </p>
      </footer>
    </div>
  );
}
