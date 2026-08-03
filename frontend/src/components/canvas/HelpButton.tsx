"use client";

import { HelpCircle } from "lucide-react";
import { useState } from "react";

export function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-30">
      {open && (
        <div className="panel-float mb-2 w-56 rounded-xl p-4 text-xs leading-relaxed text-muted">
          <p className="mb-2 font-medium text-foreground">Shortcuts</p>
          <div className="space-y-1">
            <p>
              <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono">P</kbd> Draw
            </p>
            <p>
              <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono">H</kbd> Pan
            </p>
            <p>
              <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono">T</kbd> Text
            </p>
            <p>
              <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono">Ctrl+Z</kbd> Undo
            </p>
            <p>
              <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono">Ctrl+Scroll</kbd>{" "}
              Zoom
            </p>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="panel-float flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
        aria-label="Help"
      >
        <HelpCircle size={18} />
      </button>
    </div>
  );
}
