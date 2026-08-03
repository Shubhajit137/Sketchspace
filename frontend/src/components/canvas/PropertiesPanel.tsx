"use client";

import { ColorSwatches } from "./ColorSwatches";
import type { CanvasState, StrokeStyle } from "@/lib/canvas/types";
import { STROKE_WIDTHS } from "@/lib/canvas/types";
import { Minus, GripHorizontal } from "lucide-react";

interface PropertiesPanelProps {
  state: CanvasState;
  onUpdate: (patch: Partial<CanvasState>) => void;
}

function StrokeStyleIcon({ style }: { style: StrokeStyle }) {
  const dash =
    style === "solid" ? undefined : style === "dashed" ? "6 3" : "2 3";
  return (
    <svg width="24" height="8" viewBox="0 0 24 8">
      <line
        x1="2"
        y1="4"
        x2="22"
        y2="4"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={dash}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PropertiesPanel({ state, onUpdate }: PropertiesPanelProps) {
  const showFill = ["rectangle", "diamond", "ellipse"].includes(state.tool);

  return (
    <div className="panel-float absolute left-4 top-[4.5rem] z-20 w-52 rounded-xl p-4">
      <ColorSwatches
        label="Stroke"
        value={state.strokeColor}
        onChange={(strokeColor) => onUpdate({ strokeColor })}
      />

      {showFill && (
        <div className="mt-4">
          <ColorSwatches
            label="Background"
            value={state.fillColor}
            onChange={(fillColor) => onUpdate({ fillColor })}
            showTransparent
          />
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-muted">Stroke width</p>
        <div className="flex gap-1">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w.value}
              onClick={() => onUpdate({ strokeWidth: w.value })}
              className={`flex flex-1 items-center justify-center rounded-lg py-2 transition-colors ${
                state.strokeWidth === w.value
                  ? "bg-accent-muted text-accent"
                  : "text-muted hover:bg-foreground/5"
              }`}
              title={w.label}
            >
              <Minus size={14} strokeWidth={w.value} />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-muted">Stroke style</p>
        <div className="flex gap-1">
          {(["solid", "dashed", "dotted"] as StrokeStyle[]).map((s) => (
            <button
              key={s}
              onClick={() => onUpdate({ strokeStyle: s })}
              className={`flex flex-1 items-center justify-center rounded-lg py-2 capitalize transition-colors ${
                state.strokeStyle === s
                  ? "bg-accent-muted text-accent"
                  : "text-muted hover:bg-foreground/5"
              }`}
            >
              <StrokeStyleIcon style={s} />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-muted">Opacity</p>
          <span className="text-xs tabular-nums text-muted">{state.opacity}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          value={state.opacity}
          onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent"
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 border-t border-border pt-3 text-muted">
        <GripHorizontal size={14} />
        <span className="text-[10px]">Drag to move</span>
      </div>
    </div>
  );
}
