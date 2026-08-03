import getStroke from "perfect-freehand";
import type { StrokeStyle } from "./types";

export function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
}

export function createFreehandPath(
  points: number[][],
  strokeWidth: number
): string {
  if (points.length < 2) return "";
  const stroke = getStroke(points, {
    size: strokeWidth * 4,
    thinning: 0.6,
    smoothing: 0.5,
    streamline: 0.4,
  });
  return getSvgPathFromStroke(stroke);
}

export function strokeDashArray(style: StrokeStyle, width: number): string {
  switch (style) {
    case "dashed":
      return `${width * 4} ${width * 2}`;
    case "dotted":
      return `${width} ${width * 1.5}`;
    default:
      return "none";
  }
}

export function diamondPath(x: number, y: number, w: number, h: number): string {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return `M ${cx} ${y} L ${x + w} ${cy} L ${cx} ${y + h} L ${x} ${cy} Z`;
}

export function arrowPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth: number
): string {
  const headLen = Math.max(12, strokeWidth * 6);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const x3 = x2 - headLen * Math.cos(angle - Math.PI / 6);
  const y3 = y2 - headLen * Math.sin(angle - Math.PI / 6);
  const x4 = x2 - headLen * Math.cos(angle + Math.PI / 6);
  const y4 = y2 - headLen * Math.sin(angle + Math.PI / 6);
  return `M ${x1} ${y1} L ${x2} ${y2} M ${x2} ${y2} L ${x3} ${y3} M ${x2} ${y2} L ${x4} ${y4}`;
}

export function screenToCanvas(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  panX: number,
  panY: number,
  zoom: number
): { x: number; y: number } {
  return {
    x: (clientX - rect.left - panX) / zoom,
    y: (clientY - rect.top - panY) / zoom,
  };
}
