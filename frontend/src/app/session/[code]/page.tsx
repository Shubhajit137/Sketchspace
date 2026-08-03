"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Pen, Copy, Check, Users } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

function SessionContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = (params.code as string)?.toUpperCase();
  const username = searchParams.get("username") ?? "Guest";
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-80">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
              <Pen size={14} strokeWidth={2.5} />
            </div>
            <span className="hidden text-sm font-semibold sm:inline">Sketchspace</span>
          </Link>

          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5">
            <span className="text-xs text-muted">Code</span>
            <span className="font-mono text-sm font-medium tracking-wider text-foreground">
              {code}
            </span>
            <button
              onClick={copyCode}
              className="ml-1 text-muted transition-colors hover:text-foreground"
              aria-label="Copy session code"
            >
              {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <Users size={14} />
            <span>{username}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center bg-canvas-bg">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 animate-float items-center justify-center rounded-2xl border border-border bg-surface shadow-md">
            <Pen size={28} className="text-accent" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Canvas coming next</h2>
          <p className="max-w-sm text-sm text-muted">
            Session <span className="font-mono font-medium text-foreground">{code}</span> is
            ready. Vector drawing tools and live collaboration will be added in the next phase.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background text-muted">
          Loading session…
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
