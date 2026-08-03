"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pen, Users, ArrowRight, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createSession, validateSession } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"home" | "join">("home");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("sketchspace-username");
    if (stored) setUsername(stored);
  }, []);

  function saveUsername(name: string) {
    localStorage.setItem("sketchspace-username", name);
  }

  async function handleCreate() {
    if (!username.trim()) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { code } = await createSession();
      saveUsername(username.trim());
      router.push(`/session/${code}?username=${encodeURIComponent(username.trim())}`);
    } catch {
      setError("Could not create session. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!joinCode.trim()) {
      setError("Please enter a session code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const valid = await validateSession(joinCode.trim().toUpperCase());
      if (!valid) {
        setError("Session not found. Check the code and try again.");
        return;
      }
      saveUsername(username.trim());
      router.push(
        `/session/${joinCode.trim().toUpperCase()}?username=${encodeURIComponent(username.trim())}`
      );
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--accent) 15%, transparent) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 50%)
          `,
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-md">
            <Pen size={18} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Sketchspace
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-8">
        <div className="animate-fade-in w-full max-w-md text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted shadow-sm">
            <Users size={14} />
            <span>Collaborate in real time</span>
          </div>

          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Sketch together,
            <br />
            <span className="text-accent">anywhere.</span>
          </h1>
          <p className="mb-10 text-base leading-relaxed text-muted">
            A premium whiteboard for teams. Draw, write, and brainstorm —
            like Excalidraw meets Google Docs.
          </p>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
            <label className="mb-1.5 block text-left text-sm font-medium text-foreground">
              Your name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="How should others see you?"
              maxLength={20}
              className="mb-5 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            {mode === "home" ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      Create new session
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setMode("join");
                    setError("");
                  }}
                  className="w-full rounded-xl border border-border px-4 py-3.5 font-medium text-foreground transition-colors hover:bg-background"
                >
                  Join with a code
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="flex flex-col gap-3">
                <div>
                  <label className="mb-1.5 block text-left text-sm font-medium text-foreground">
                    Session code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) =>
                      setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                    }
                    placeholder="e.g. ABC123"
                    maxLength={6}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-lg tracking-[0.3em] text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      Join session
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("home");
                    setError("");
                    setJoinCode("");
                  }}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  ← Back
                </button>
              </form>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
          </div>

          <p className="mt-8 text-xs text-muted">
            Vector-quality drawing · Live cursors · Pastel palette
          </p>
        </div>
      </main>
    </div>
  );
}
