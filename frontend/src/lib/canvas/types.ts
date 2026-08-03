export type Tool =
  | "hand"
  | "select"
  | "rectangle"
  | "diamond"
  | "ellipse"
  | "arrow"
  | "line"
  | "pen"
  | "text"
  | "eraser";

export type StrokeStyle = "solid" | "dashed" | "dotted";

export interface CanvasElement {
  id: string;
  type: "freehand" | "rectangle" | "diamond" | "ellipse" | "line" | "arrow" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: number[][];
  path?: string;
  text?: string;
  fontSize?: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
}

export interface CanvasState {
  tool: Tool;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  zoom: number;
  panX: number;
  panY: number;
}

export interface Point {
  x: number;
  y: number;
}

export const STROKE_WIDTHS = [
  { label: "Thin", value: 1 },
  { label: "Medium", value: 2 },
  { label: "Bold", value: 4 },
] as const;

export const DEFAULT_CANVAS_STATE: CanvasState = {
  tool: "pen",
  strokeColor: "#E8A598",
  fillColor: "transparent",
  strokeWidth: 2,
  strokeStyle: "solid",
  opacity: 100,
  zoom: 1,
  panX: 0,
  panY: 0,
};
