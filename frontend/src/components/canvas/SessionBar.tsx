"use client";

import Link from "next/link";
import { Pen, Copy, Check, Share2, Menu, PanelRight, Users } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

interface SessionBarProps {
  code: string;
  username: string;
  participantCount?: number;
}

export function SessionBar({ code, username, participantCount = 1 }: SessionBarProps) {
  const [copied, setCopied] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareSession() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "Sketchspace Session", url, text: `Join my sketch: ${code}` });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      {/* Top left menu */}
      <div className="absolute left-4 top-4 z-30">
        <Link
          href="/"
          className="panel-float flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:text-foreground"
          aria-label="Menu"
        >
          <Menu size={18} />
        </Link>
      </div>

      {/* Top right actions */}
      <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
        <div className="panel-float hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex">
          <Users size={14} className="text-muted" />
          <span className="text-xs text-muted">{participantCount}</span>
          <span className="text-xs text-foreground">{username}</span>
        </div>

        <button
          onClick={shareSession}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-accent-hover"
        >
          <Share2 size={16} />
          <span className="hidden sm:inline">Share</span>
        </button>

        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={`panel-float flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            showSidebar ? "text-accent" : "text-muted hover:text-foreground"
          }`}
          aria-label="Toggle sidebar"
        >
          <PanelRight size={18} />
        </button>

        <ThemeToggle variant="panel" />
      </div>

      {/* Sidebar panel */}
      {showSidebar && (
        <div className="panel-float absolute right-4 top-16 z-30 w-64 rounded-xl p-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
              <Pen size={14} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-foreground">Sketchspace</span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs text-muted">Session code</p>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                <span className="font-mono text-sm font-medium tracking-wider">{code}</span>
                <button
                  onClick={copyCode}
                  className="text-muted transition-colors hover:text-accent"
                  aria-label="Copy code"
                >
                  {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs text-muted">You</p>
              <p className="text-sm text-foreground">{username}</p>
            </div>

            <p className="text-xs leading-relaxed text-muted">
              Share the session code or link so others can join and sketch together in real time.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
