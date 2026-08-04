"use client";

import { ColorSwatches } from "./ColorSwatches";
import type { CanvasElement, CanvasState, StrokeStyle } from "@/lib/canvas/types";
import { FONT_SIZES, STROKE_WIDTHS } from "@/lib/canvas/types";
import { Minus, GripHorizontal, Type } from "lucide-react";

interface PropertiesPanelProps {
  state: CanvasState;
  onUpdate: (patch: Partial<CanvasState>) => void;
  selectedElement?: CanvasElement | null;
  onUpdateElement?: (id: string, patch: Partial<CanvasElement>) => void;
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

export function PropertiesPanel({
  state,
  onUpdate,
  selectedElement,
  onUpdateElement,
}: PropertiesPanelProps) {
  const editingElement = !!selectedElement;
  const el = selectedElement;

  const strokeColor = editingElement ? el!.strokeColor : state.strokeColor;
  const fillColor = editingElement ? el!.fillColor : state.fillColor;
  const strokeWidth = editingElement ? el!.strokeWidth : state.strokeWidth;
  const strokeStyle = editingElement ? el!.strokeStyle : state.strokeStyle;
  const opacity = editingElement ? el!.opacity : state.opacity;
  const fontSize = editingElement ? el!.fontSize ?? 20 : state.fontSize;

  const setStrokeColor = (c: string) =>
    editingElement
      ? onUpdateElement?.(el!.id, { strokeColor: c })
      : onUpdate({ strokeColor: c });
  const setFillColor = (c: string) =>
    editingElement
      ? onUpdateElement?.(el!.id, { fillColor: c })
      : onUpdate({ fillColor: c });
  const setStrokeWidth = (w: number) =>
    editingElement
      ? onUpdateElement?.(el!.id, { strokeWidth: w })
      : onUpdate({ strokeWidth: w });
  const setStrokeStyle = (s: StrokeStyle) =>
    editingElement
      ? onUpdateElement?.(el!.id, { strokeStyle: s })
      : onUpdate({ strokeStyle: s });
  const setOpacity = (o: number) =>
    editingElement
      ? onUpdateElement?.(el!.id, { opacity: o })
      : onUpdate({ opacity: o });
  const setFontSize = (s: number) =>
    editingElement
      ? onUpdateElement?.(el!.id, { fontSize: s })
      : onUpdate({ fontSize: s });

  const isTextTarget =
    editingElement ? el!.type === "text" : state.tool === "text";

  const showFill =
    editingElement
      ? ["rectangle", "diamond", "ellipse"].includes(el!.type)
      : ["rectangle", "diamond", "ellipse"].includes(state.tool);

  return (
    <div className="panel-float absolute left-4 top-[4.5rem] z-20 w-52 rounded-xl p-4">
      {editingElement && (
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-accent">
          Editing selected element
        </p>
      )}

      <ColorSwatches
        label="Stroke"
        value={strokeColor}
        onChange={setStrokeColor}
      />

      {showFill && (
        <div className="mt-4">
          <ColorSwatches
            label="Background"
            value={fillColor}
            onChange={setFillColor}
            showTransparent
          />
        </div>
      )}

      {isTextTarget && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted">
            <Type size={12} />
            Font size
          </p>
          <div className="flex gap-1">
            {FONT_SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setFontSize(s.value)}
                className={`flex flex-1 items-center justify-center rounded-lg py-1.5 transition-colors ${
                  fontSize === s.value
                    ? "bg-accent-muted text-accent"
                    : "text-muted hover:bg-foreground/5"
                }`}
                title={`Font ${s.label}`}
              >
                <span style={{ fontSize: s.value * 0.7 }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-muted">Stroke width</p>
        <div className="flex gap-1">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w.value}
              onClick={() => setStrokeWidth(w.value)}
              className={`flex flex-1 items-center justify-center rounded-lg py-2 transition-colors ${
                strokeWidth === w.value
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
              onClick={() => setStrokeStyle(s)}
              className={`flex flex-1 items-center justify-center rounded-lg py-2 capitalize transition-colors ${
                strokeStyle === s
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
          <span className="text-xs tabular-nums text-muted">{opacity}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent"
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 border-t border-border pt-3 text-muted">
        <GripHorizontal size={14} />
        <span className="text-[10px]">
          {editingElement ? "Drag to move · handles to resize" : "Drag to move"}
        </span>
      </div>
    </div>
  );
}