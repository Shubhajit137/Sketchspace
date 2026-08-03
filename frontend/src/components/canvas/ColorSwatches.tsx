"use client";

import { PRESET_COLORS } from "@/lib/colors";
import { Palette } from "lucide-react";

interface ColorSwatchesProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  showTransparent?: boolean;
}

export function ColorSwatches({
  label,
  value,
  onChange,
  showTransparent = false,
}: ColorSwatchesProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted">{label}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {showTransparent && (
          <button
            onClick={() => onChange("transparent")}
            className={`h-7 w-7 rounded-md border-2 transition-transform hover:scale-105 ${
              value === "transparent"
                ? "border-accent ring-2 ring-accent/30"
                : "border-border"
            }`}
            style={{
              background:
                "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px",
            }}
            title="Transparent"
            aria-label="Transparent"
          />
        )}
        {PRESET_COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => onChange(c.value)}
            className={`h-7 w-7 rounded-md border-2 transition-transform hover:scale-105 ${
              value === c.value
                ? "border-accent ring-2 ring-accent/30"
                : "border-transparent"
            }`}
            style={{ backgroundColor: c.value }}
            title={c.name}
            aria-label={c.name}
          />
        ))}
        <label
          className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border bg-surface transition-transform hover:scale-105"
          title="Custom color"
        >
          <Palette size={14} className="pointer-events-none text-muted" />
          <input
            type="color"
            value={value === "transparent" ? "#E8A598" : value}
            onChange={(e) => onChange(e.target.value)}
            className="color-wheel-input absolute inset-0 opacity-0"
            aria-label="Custom color"
          />
        </label>
      </div>
    </div>
  );
}
