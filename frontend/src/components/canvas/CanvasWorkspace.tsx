"use client";

import { useCallback, useEffect, useState } from "react";
import type { CanvasElement, CanvasState, Tool } from "@/lib/canvas/types";
import { DEFAULT_CANVAS_STATE } from "@/lib/canvas/types";
import { DrawingCanvas } from "./DrawingCanvas";
import { TopToolbar } from "./TopToolbar";
import { PropertiesPanel } from "./PropertiesPanel";
import { ZoomControls } from "./ZoomControls";
import { SessionBar } from "./SessionBar";
import { HelpButton } from "./HelpButton";

interface CanvasWorkspaceProps {
  code: string;
  username: string;
}

export function CanvasWorkspace({ code, username }: CanvasWorkspaceProps) {
  const [state, setState] = useState<CanvasState>(DEFAULT_CANVAS_STATE);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockedTool, setLockedTool] = useState<Tool>("pen");

  const updateState = useCallback((patch: Partial<CanvasState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const pushHistory = useCallback(
    (newElements: CanvasElement[]) => {
      const next = history.slice(0, historyIndex + 1);
      next.push(newElements);
      setHistory(next);
      setHistoryIndex(next.length - 1);
      setElements(newElements);
    },
    [history, historyIndex]
  );

  const handleElementsChange = useCallback(
    (newElements: CanvasElement[]) => {
      pushHistory(newElements);
    },
    [pushHistory]
  );

  const handleToolChange = (tool: Tool) => {
    updateState({ tool });
    if (locked) setLockedTool(tool);
  };

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        updateState({ zoom: Math.min(Math.max(state.zoom * delta, 0.1), 4) });
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [state.zoom, updateState]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const shortcuts: Record<string, Tool> = {
        h: "hand",
        v: "select",
        r: "rectangle",
        d: "diamond",
        o: "ellipse",
        a: "arrow",
        l: "line",
        p: "pen",
        t: "text",
        e: "eraser",
      };

      const tool = shortcuts[e.key.toLowerCase()];
      if (tool) {
        e.preventDefault();
        updateState({ tool });
        if (locked) setLockedTool(tool);
      }

      if (e.key === "0" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        updateState({ zoom: 1, panX: 0, panY: 0 });
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (historyIndex > 0) {
          setHistoryIndex(historyIndex - 1);
          setElements(history[historyIndex - 1]);
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          setHistoryIndex(historyIndex + 1);
          setElements(history[historyIndex + 1]);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [history, historyIndex, locked, lockedTool, updateState]);

  const zoomIn = () => updateState({ zoom: Math.min(state.zoom * 1.2, 4) });
  const zoomOut = () => updateState({ zoom: Math.max(state.zoom / 1.2, 0.1) });
  const resetZoom = () => updateState({ zoom: 1 });

  const showProperties = state.tool !== "hand" && state.tool !== "select" && state.tool !== "eraser";

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-canvas-bg">
      <DrawingCanvas
        state={state}
        elements={elements}
        onElementsChange={handleElementsChange}
      />

      <SessionBar code={code} username={username} />

      <TopToolbar
        activeTool={state.tool}
        onToolChange={handleToolChange}
        locked={locked}
        onToggleLock={() => {
          if (!locked) setLockedTool(state.tool);
          setLocked(!locked);
        }}
      />

      {showProperties && (
        <PropertiesPanel state={state} onUpdate={updateState} />
      )}

      <ZoomControls
        zoom={state.zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={() => {
          if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setElements(history[historyIndex - 1]);
          }
        }}
        onRedo={() => {
          if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setElements(history[historyIndex + 1]);
          }
        }}
      />

      <HelpButton />
    </div>
  );
}
