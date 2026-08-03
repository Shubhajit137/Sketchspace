"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import type { CanvasElement, CanvasState, Point, Tool } from "@/lib/canvas/types";
import { DEFAULT_CANVAS_STATE } from "@/lib/canvas/types";
import {
  arrowPath,
  createFreehandPath,
  diamondPath,
  screenToCanvas,
  strokeDashArray,
} from "@/lib/canvas/geometry";

interface DrawingCanvasProps {
  state: CanvasState;
  elements: CanvasElement[];
  onElementsChange: (elements: CanvasElement[]) => void;
  onDrawingChange?: (drawing: boolean) => void;
}

function renderElement(el: CanvasElement) {
  const dash = strokeDashArray(el.strokeStyle, el.strokeWidth);
  const opacity = el.opacity / 100;
  const common = {
    stroke: el.strokeColor,
    strokeWidth: el.strokeWidth,
    strokeDasharray: dash === "none" ? undefined : dash,
    opacity,
    fill: el.fillColor === "transparent" ? "none" : el.fillColor,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (el.type) {
    case "freehand":
      return el.path ? <path key={el.id} d={el.path} {...common} /> : null;
    case "rectangle":
      return (
        <rect
          key={el.id}
          x={el.x}
          y={el.y}
          width={el.width ?? 0}
          height={el.height ?? 0}
          {...common}
        />
      );
    case "ellipse":
      return (
        <ellipse
          key={el.id}
          cx={(el.x ?? 0) + (el.width ?? 0) / 2}
          cy={(el.y ?? 0) + (el.height ?? 0) / 2}
          rx={Math.abs(el.width ?? 0) / 2}
          ry={Math.abs(el.height ?? 0) / 2}
          {...common}
        />
      );
    case "diamond":
      return el.width && el.height ? (
        <path
          key={el.id}
          d={diamondPath(el.x, el.y, el.width, el.height)}
          {...common}
        />
      ) : null;
    case "line":
    case "arrow":
      return el.width !== undefined && el.height !== undefined ? (
        <path
          key={el.id}
          d={
            el.type === "arrow"
              ? arrowPath(el.x, el.y, el.x + el.width, el.y + el.height, el.strokeWidth)
              : `M ${el.x} ${el.y} L ${el.x + el.width} ${el.y + el.height}`
          }
          fill="none"
          stroke={el.strokeColor}
          strokeWidth={el.strokeWidth}
          strokeDasharray={dash === "none" ? undefined : dash}
          opacity={opacity}
          strokeLinecap="round"
        />
      ) : null;
    case "text":
      return (
        <text
          key={el.id}
          x={el.x}
          y={el.y}
          fill={el.strokeColor}
          fontSize={el.fontSize ?? 20}
          opacity={opacity}
          fontFamily="var(--font-geist-sans), system-ui, sans-serif"
          dominantBaseline="hanging"
        >
          {el.text}
        </text>
      );
    default:
      return null;
  }
}

function getCursor(tool: Tool): string {
  switch (tool) {
    case "hand":
      return "grab";
    case "select":
      return "default";
    case "text":
      return "text";
    case "eraser":
      return "cell";
    default:
      return "crosshair";
  }
}

export function DrawingCanvas({
  state,
  elements,
  onElementsChange,
  onDrawingChange,
}: DrawingCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const currentPoints = useRef<number[][]>([]);
  const shapeStart = useRef<Point | null>(null);
  const previewElement = useRef<CanvasElement | null>(null);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [localPan, setLocalPan] = useState({ x: state.panX, y: state.panY });
  const [textInput, setTextInput] = useState<{ x: number; y: number; screenX: number; screenY: number } | null>(null);
  const [textValue, setTextValue] = useState("");

  useEffect(() => {
    setLocalPan({ x: state.panX, y: state.panY });
  }, [state.panX, state.panY]);

  const getPoint = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      return screenToCanvas(clientX, clientY, rect, localPan.x, localPan.y, state.zoom);
    },
    [localPan, state.zoom]
  );

  const commitPreview = useCallback(() => {
    if (previewElement.current) {
      const el = previewElement.current;
      if (
        el.type === "freehand" ||
        (el.width !== undefined && Math.abs(el.width) > 2) ||
        (el.height !== undefined && Math.abs(el.height) > 2) ||
        el.type === "line" ||
        el.type === "arrow"
      ) {
        onElementsChange([...elements, el]);
      }
      previewElement.current = null;
    }
  }, [elements, onElementsChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const point = getPoint(e.clientX, e.clientY);
    if (!point) return;

    if (state.tool === "hand") {
      setIsPanning(true);
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: localPan.x,
        panY: localPan.y,
      };
      (e.target as Element).setPointerCapture(e.pointerId);
      return;
    }

    if (state.tool === "text") {
      const rect = svgRef.current!.getBoundingClientRect();
      setTextInput({
        x: point.x,
        y: point.y,
        screenX: e.clientX - rect.left,
        screenY: e.clientY - rect.top,
      });
      setTextValue("");
      return;
    }

    setIsDrawing(true);
    onDrawingChange?.(true);
    shapeStart.current = point;
    (e.target as Element).setPointerCapture(e.pointerId);

    if (state.tool === "pen") {
      currentPoints.current = [[point.x, point.y, 0.5]];
      previewElement.current = {
        id: nanoid(),
        type: "freehand",
        x: point.x,
        y: point.y,
        points: currentPoints.current,
        path: "",
        strokeColor: state.strokeColor,
        fillColor: state.strokeColor,
        strokeWidth: state.strokeWidth,
        strokeStyle: state.strokeStyle,
        opacity: state.opacity,
      };
    } else if (state.tool === "eraser") {
      const hitIndex = findElementAtPoint(elements, point, 20);
      if (hitIndex >= 0) {
        onElementsChange(elements.filter((_, i) => i !== hitIndex));
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning && panStart.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setLocalPan({
        x: panStart.current.panX + dx,
        y: panStart.current.panY + dy,
      });
      return;
    }

    if (!isDrawing || !shapeStart.current) return;
    const point = getPoint(e.clientX, e.clientY);
    if (!point) return;

    const start = shapeStart.current;

    if (state.tool === "pen") {
      currentPoints.current.push([point.x, point.y, 0.5]);
      const path = createFreehandPath(currentPoints.current, state.strokeWidth);
      previewElement.current = {
        ...previewElement.current!,
        points: [...currentPoints.current],
        path,
      };
      forceUpdate();
    } else if (["rectangle", "ellipse", "diamond", "line", "arrow"].includes(state.tool)) {
      previewElement.current = {
        id: previewElement.current?.id ?? nanoid(),
        type: state.tool as CanvasElement["type"],
        x: Math.min(start.x, point.x),
        y: Math.min(start.y, point.y),
        width: point.x - start.x,
        height: point.y - start.y,
        strokeColor: state.strokeColor,
        fillColor: state.fillColor,
        strokeWidth: state.strokeWidth,
        strokeStyle: state.strokeStyle,
        opacity: state.opacity,
      };
      forceUpdate();
    } else if (state.tool === "eraser") {
      const hitIndex = findElementAtPoint(elements, point, 20);
      if (hitIndex >= 0) {
        onElementsChange(elements.filter((_, i) => i !== hitIndex));
      }
    }
  };

  const [, setTick] = useState(0);
  const forceUpdate = () => setTick((t) => t + 1);

  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
      panStart.current = null;
      return;
    }
    if (!isDrawing) return;
    setIsDrawing(false);
    onDrawingChange?.(false);
    commitPreview();
    shapeStart.current = null;
    currentPoints.current = [];
  };

  const commitText = () => {
    if (!textInput || !textValue.trim()) {
      setTextInput(null);
      return;
    }
    onElementsChange([
      ...elements,
      {
        id: nanoid(),
        type: "text",
        x: textInput.x,
        y: textInput.y,
        text: textValue.trim(),
        fontSize: 20,
        strokeColor: state.strokeColor,
        fillColor: "transparent",
        strokeWidth: state.strokeWidth,
        strokeStyle: state.strokeStyle,
        opacity: state.opacity,
      },
    ]);
    setTextInput(null);
    setTextValue("");
  };

  const allElements = previewElement.current
    ? [...elements, previewElement.current]
    : elements;

  return (
    <div className="relative h-full w-full overflow-hidden bg-canvas-bg">
      <svg
        ref={svgRef}
        className="h-full w-full touch-none"
        style={{ cursor: isPanning ? "grabbing" : getCursor(state.tool) }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <rect width="100%" height="100%" fill="var(--canvas-bg)" />
        <g transform={`translate(${localPan.x}, ${localPan.y}) scale(${state.zoom})`}>
          {allElements.map(renderElement)}
        </g>
      </svg>

      {textInput && (
        <input
          autoFocus
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitText();
            if (e.key === "Escape") setTextInput(null);
          }}
          onBlur={commitText}
          className="absolute z-10 min-w-[120px] border-none bg-transparent outline-none"
          style={{
            left: textInput.screenX,
            top: textInput.screenY,
            color: state.strokeColor,
            fontSize: 20,
            transform: `scale(${state.zoom})`,
            transformOrigin: "top left",
          }}
          placeholder="Type something..."
        />
      )}
    </div>
  );
}

function findElementAtPoint(elements: CanvasElement[], point: Point, tolerance: number): number {
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.type === "freehand" && el.points) {
      for (const [px, py] of el.points) {
        if (Math.hypot(px - point.x, py - point.y) < tolerance) return i;
      }
    } else if (el.width !== undefined && el.height !== undefined) {
      const x1 = Math.min(el.x, el.x + el.width) - tolerance;
      const y1 = Math.min(el.y, el.y + el.height) - tolerance;
      const x2 = Math.max(el.x, el.x + el.width) + tolerance;
      const y2 = Math.max(el.y, el.y + el.height) + tolerance;
      if (point.x >= x1 && point.x <= x2 && point.y >= y1 && point.y <= y2) return i;
    } else if (el.type === "text") {
      if (Math.hypot(el.x - point.x, el.y - point.y) < tolerance * 2) return i;
    }
  }
  return -1;
}

export { DEFAULT_CANVAS_STATE };
