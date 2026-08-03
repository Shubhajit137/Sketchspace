"use client";

import type { Tool } from "@/lib/canvas/types";
import {
  Hand,
  MousePointer2,
  Square,
  Diamond,
  Circle,
  ArrowUpRight,
  Minus,
  Pencil,
  Type,
  Eraser,
  Lock,
  MoreHorizontal,
} from "lucide-react";

interface TopToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  locked: boolean;
  onToggleLock: () => void;
}

const TOOLS: { id: Tool; icon: React.ReactNode; label: string; shortcut?: string }[] = [
  { id: "hand", icon: <Hand size={18} />, label: "Hand", shortcut: "H" },
  { id: "select", icon: <MousePointer2 size={18} />, label: "Select", shortcut: "V" },
  { id: "rectangle", icon: <Square size={18} />, label: "Rectangle", shortcut: "R" },
  { id: "diamond", icon: <Diamond size={18} />, label: "Diamond", shortcut: "D" },
  { id: "ellipse", icon: <Circle size={18} />, label: "Ellipse", shortcut: "O" },
  { id: "arrow", icon: <ArrowUpRight size={18} />, label: "Arrow", shortcut: "A" },
  { id: "line", icon: <Minus size={18} />, label: "Line", shortcut: "L" },
  { id: "pen", icon: <Pencil size={18} />, label: "Draw", shortcut: "P" },
  { id: "text", icon: <Type size={18} />, label: "Text", shortcut: "T" },
  { id: "eraser", icon: <Eraser size={18} />, label: "Eraser", shortcut: "E" },
];

export function TopToolbar({
  activeTool,
  onToolChange,
  locked,
  onToggleLock,
}: TopToolbarProps) {
  return (
    <div className="panel-float absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-xl px-1.5 py-1.5">
      <button
        onClick={onToggleLock}
        className={`tool-btn ${locked ? "active" : ""}`}
        title="Lock tool"
        aria-label="Lock tool"
      >
        <Lock size={16} />
      </button>

      <div className="mx-1 h-5 w-px bg-border" />

      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`tool-btn group relative ${activeTool === tool.id ? "active" : ""}`}
          title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ""}`}
          aria-label={tool.label}
        >
          {tool.icon}
        </button>
      ))}

      <div className="mx-1 h-5 w-px bg-border" />

      <button className="tool-btn" title="More tools" aria-label="More tools">
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}
