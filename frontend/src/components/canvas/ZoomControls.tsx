"use client";

import { Undo2, Redo2, Minus, Plus } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: ZoomControlsProps) {
  const pct = Math.round(zoom * 100);

  return (
    <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
      <div className="panel-float flex items-center rounded-xl">
        <button
          onClick={onZoomOut}
          className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-foreground"
          aria-label="Zoom out"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={onResetZoom}
          className="min-w-[3rem] px-1 text-xs font-medium tabular-nums text-muted transition-colors hover:text-foreground"
        >
          {pct}%
        </button>
        <button
          onClick={onZoomIn}
          className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-foreground"
          aria-label="Zoom in"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="panel-float flex items-center rounded-xl">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-foreground disabled:opacity-30"
          aria-label="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-foreground disabled:opacity-30"
          aria-label="Redo"
        >
          <Redo2 size={16} />
        </button>
      </div>
    </div>
  );
}
