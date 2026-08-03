"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Sparkles, Users, Zap, Globe, Lock } from "lucide-react";
import { createSession, validateSession } from "@/lib/api";

/* ─── Laser cursor ─────────────────────────────────────────────── */
const LASER_COLOR = "#e0a613ff";
const TRAIL_LEN = 90;

function LaserCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trail = useRef<{ x: number; y: number }[]>([]);
  const raf = useRef<number | null>(null);
  const mouse = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    });

    const draw = () => {
      const t = trail.current;
      t.push({ ...mouse.current });
      if (t.length > TRAIL_LEN) t.shift();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 1; i < t.length; i++) {
        const p = i / t.length;
        const a = p * p;
        ctx.save();
        ctx.shadowColor = LASER_COLOR;
        ctx.shadowBlur = 20 * p;
        ctx.strokeStyle = `rgba(224,166,19,${a * 0.4})`;
        ctx.lineWidth = 4 * p + 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(t[i - 1].x, t[i - 1].y);
        ctx.lineTo(t[i].x, t[i].y);
        ctx.stroke();

        ctx.shadowBlur = 6 * p;
        ctx.strokeStyle = `rgba(242,201,76,${a * 0.85})`;
        ctx.lineWidth = 2 * p;
        ctx.beginPath();
        ctx.moveTo(t[i - 1].x, t[i - 1].y);
        ctx.lineTo(t[i].x, t[i].y);
        ctx.stroke();
        ctx.restore();
      }

      if (t.length > 0) {
        const tip = t[t.length - 1];
        ctx.save();
        ctx.shadowColor = "#e0a613ff";
        ctx.shadowBlur = 28;
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

/* ─── Canvas particle system ───────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["#7c3aed", "#06b6d4", "#ec4899", "#10b981", "#f59e0b"];
    const particles: {
      x: number; y: number; vx: number; vy: number;
      r: number; color: string; life: number; maxLife: number;
    }[] = [];

    const spawn = () => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(Math.random() * 1.2 + 0.4),
        r: Math.random() * 2.5 + 0.5,
        color,
        life: 0,
        maxLife: Math.random() * 200 + 140,
      });
    };

    let frame = 0;
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (frame % 6 === 0) spawn();
      frame++;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life > p.maxLife) { particles.splice(i, 1); continue; }

        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.7;
        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}

/* ─── Animated right-panel sketch art ─────────────────────────── */
function SketchArt() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Glow orbs inside right panel */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 260, height: 260,
          top: "10%", right: "-10%",
          background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          animation: "orb-drift-1 14s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 200, height: 200,
          bottom: "10%", left: "-5%",
          background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(35px)",
          animation: "orb-drift-2 18s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 150, height: 150,
          top: "50%", left: "40%",
          background: "radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(30px)",
          animation: "orb-drift-3 12s ease-in-out infinite",
        }}
      />

      {/* Main animated SVG art */}
      <div className="art-bob relative z-10">
        <svg width="280" height="280" viewBox="0 0 280 280" fill="none">
          <defs>
            <filter id="art-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="stroke-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="stroke-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="stroke-grad-3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Canvas board */}
          <rect x="40" y="30" width="200" height="180" rx="12"
            fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          <rect x="40" y="30" width="200" height="18" rx="8"
            fill="rgba(255,255,255,0.07)" />
          <circle cx="57" cy="39" r="3.5" fill="#ef4444" opacity="0.8" />
          <circle cx="70" cy="39" r="3.5" fill="#f59e0b" opacity="0.8" />
          <circle cx="83" cy="39" r="3.5" fill="#10b981" opacity="0.8" />

          {/* Animated sketch strokes on the canvas */}
          <path
            d="M 70 100 C 90 70, 130 130, 160 90 C 185 60, 200 110, 220 100"
            fill="none" stroke="url(#stroke-grad-1)" strokeWidth="2.5" strokeLinecap="round"
            filter="url(#art-glow)"
            className="sketch-line"
            style={{ "--sk-len": "380px", "--sk-dur": "2s", "--sk-delay": "0.3s" } as React.CSSProperties}
          />
          <path
            d="M 60 145 Q 100 115, 140 140 Q 180 165, 220 135"
            fill="none" stroke="url(#stroke-grad-2)" strokeWidth="2" strokeLinecap="round"
            filter="url(#art-glow)"
            className="sketch-line"
            style={{ "--sk-len": "300px", "--sk-dur": "1.8s", "--sk-delay": "1.2s" } as React.CSSProperties}
          />
          <path
            d="M 80 175 C 110 160, 150 185, 190 165"
            fill="none" stroke="url(#stroke-grad-3)" strokeWidth="1.8" strokeLinecap="round"
            filter="url(#art-glow)"
            className="sketch-line"
            style={{ "--sk-len": "220px", "--sk-dur": "1.5s", "--sk-delay": "2s" } as React.CSSProperties}
          />

          {/* Dot markers */}
          <circle cx="70" cy="100" r="4" fill="#7c3aed" opacity="0.9" filter="url(#art-glow)"
            className="dot-pop" style={{ animationDelay: "2.5s" } as React.CSSProperties} />
          <circle cx="160" cy="90" r="4" fill="#06b6d4" opacity="0.9" filter="url(#art-glow)"
            className="dot-pop" style={{ animationDelay: "2.8s" } as React.CSSProperties} />
          <circle cx="220" cy="100" r="4" fill="#ec4899" opacity="0.9" filter="url(#art-glow)"
            className="dot-pop" style={{ animationDelay: "3.1s" } as React.CSSProperties} />

          {/* Toolbar at bottom of canvas */}
          <rect x="80" y="225" width="120" height="32" rx="8"
            fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          {[100, 116, 132, 148, 164, 180].map((cx, i) => (
            <circle key={i} cx={cx} cy="241" r="5" fill={
              ["#7c3aed", "#06b6d4", "#ec4899", "#10b981", "#f59e0b", "#e8ecef"][i]
            } opacity="0.85" />
          ))}

          {/* Floating cursor 1 */}
          <g style={{ animation: "cursor-float 3.5s ease-in-out infinite", animationDelay: "0.5s" }}>
            <path d="M150 82 L157 100 L160 94 L166 91 Z"
              fill="#a78bfa" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
            <rect x="154" y="101" width="30" height="12" rx="6" fill="#7c3aed" />
            <text x="169" y="111" textAnchor="middle" fill="white" fontSize="7" fontFamily="Inter, sans-serif" fontWeight="600">Sofia</text>
          </g>

          {/* Floating cursor 2 */}
          <g style={{ animation: "cursor-float 4s ease-in-out infinite", animationDelay: "1.5s" }}>
            <path d="M210 128 L217 146 L220 140 L226 137 Z"
              fill="#34d399" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
            <rect x="214" y="147" width="32" height="12" rx="6" fill="#10b981" />
            <text x="230" y="157" textAnchor="middle" fill="white" fontSize="7" fontFamily="Inter, sans-serif" fontWeight="600">Marcus</text>
          </g>
        </svg>
      </div>

      {/* Feature badges floating around */}
      <div
        className="absolute left-3 top-1/4 rounded-xl px-3 py-2 text-xs font-semibold text-white"
        style={{
          background: "rgba(124,58,237,0.15)",
          border: "1px solid rgba(124,58,237,0.3)",
          backdropFilter: "blur(8px)",
          animation: "cursor-float 5s ease-in-out infinite",
          animationDelay: "0s",
        }}
      >
        ✦ Real-time sync
      </div>
      <div
        className="absolute bottom-1/4 right-3 rounded-xl px-3 py-2 text-xs font-semibold text-white"
        style={{
          background: "rgba(6,182,212,0.15)",
          border: "1px solid rgba(6,182,212,0.3)",
          backdropFilter: "blur(8px)",
          animation: "cursor-float 4.5s ease-in-out infinite",
          animationDelay: "1.2s",
        }}
      >
        ⚡ Instant canvas
      </div>
      <div
        className="absolute right-4 top-1/3 rounded-xl px-3 py-2 text-xs font-semibold text-white"
        style={{
          background: "rgba(236,72,153,0.15)",
          border: "1px solid rgba(236,72,153,0.3)",
          backdropFilter: "blur(8px)",
          animation: "cursor-float 6s ease-in-out infinite",
          animationDelay: "2.4s",
        }}
      >
        🎨 Vector quality
      </div>
    </div>
  );
}

/* ─── Background orbs + grid ───────────────────────────────────── */
function BackgroundScene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-100" />

      {/* Large ambient orbs */}
      <div
        className="orb-1 absolute"
        style={{
          width: 700, height: 700,
          top: "-20%", left: "-15%",
          background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)",
          borderRadius: "50%",
          filter: "blur(60px)",
        }}
      />
      <div
        className="orb-2 absolute"
        style={{
          width: 600, height: 600,
          bottom: "-15%", right: "-10%",
          background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 65%)",
          borderRadius: "50%",
          filter: "blur(55px)",
        }}
      />
      <div
        className="orb-3 absolute"
        style={{
          width: 400, height: 400,
          top: "30%", right: "25%",
          background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 65%)",
          borderRadius: "50%",
          filter: "blur(50px)",
        }}
      />
      <div
        className="orb-1 absolute"
        style={{
          width: 300, height: 300,
          top: "60%", left: "20%",
          background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 65%)",
          borderRadius: "50%",
          filter: "blur(45px)",
          animationDelay: "-7s",
        }}
      />

      {/* Floating SVG swirls */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="glow-v" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M -60 200 C 80 80, 220 40, 340 160 C 420 240, 360 360, 240 400 C 140 430, 60 360, 120 280"
          fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" opacity="0.25"
          filter="url(#glow-v)" className="swirl-draw"
          style={{ "--swirl-len": "950px", "--swirl-dur": "8s", "--swirl-delay": "0s" } as React.CSSProperties} />
        <path d="M 100% 80 C 80% 120, 75% 200, 88% 270 C 96% 320, 108% 370, 92% 430"
          fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.2"
          filter="url(#glow-v)" className="swirl-draw"
          style={{ "--swirl-len": "650px", "--swirl-dur": "6s", "--swirl-delay": "-2s" } as React.CSSProperties} />
        <path d="M -20 88% C 90 76%, 180 82%, 270 70% C 380 56%, 420 74%, 340 88% C 270 98%, 150 94%, 80 88%"
          fill="none" stroke="#ec4899" strokeWidth="1.2" strokeLinecap="round" opacity="0.18"
          filter="url(#glow-v)" className="swirl-draw"
          style={{ "--swirl-len": "850px", "--swirl-dur": "10s", "--swirl-delay": "-4s" } as React.CSSProperties} />
        <path d="M 30% 5% C 38% 14%, 46% 9%, 54% 18% C 60% 26%, 52% 34%, 44% 26% C 36% 18%, 38% 11%, 44% 9%"
          fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"
          filter="url(#glow-v)" className="swirl-draw"
          style={{ "--swirl-len": "380px", "--swirl-dur": "5s", "--swirl-delay": "-1s" } as React.CSSProperties} />
        <path d="M 78% 78% C 84% 68%, 90% 74%, 96% 64% C 102% 54%, 98% 84%, 88% 90%"
          fill="none" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" opacity="0.2"
          filter="url(#glow-v)" className="swirl-draw"
          style={{ "--swirl-len": "300px", "--swirl-dur": "5.5s", "--swirl-delay": "-3s" } as React.CSSProperties} />
      </svg>

      {/* CSS floating particles */}
      {[
        { size: 3, top: "15%", left: "8%", color: "#7c3aed", dur: "6s", delay: "0s", drift: "30px" },
        { size: 2, top: "40%", left: "3%", color: "#06b6d4", dur: "8s", delay: "1s", drift: "-20px" },
        { size: 4, top: "70%", left: "12%", color: "#ec4899", dur: "5s", delay: "2s", drift: "25px" },
        { size: 2, top: "25%", left: "88%", color: "#10b981", dur: "7s", delay: "0.5s", drift: "-30px" },
        { size: 3, top: "60%", left: "92%", color: "#f59e0b", dur: "6.5s", delay: "1.5s", drift: "20px" },
        { size: 2, top: "85%", left: "55%", color: "#a78bfa", dur: "9s", delay: "3s", drift: "-15px" },
        { size: 3, top: "10%", left: "65%", color: "#06b6d4", dur: "5.5s", delay: "0.8s", drift: "18px" },
        { size: 2, top: "50%", left: "80%", color: "#ec4899", dur: "7.5s", delay: "2.5s", drift: "-22px" },
      ].map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: p.size, height: p.size,
            top: p.top, left: p.left,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            "--px-dur": p.dur,
            "--px-delay": p.delay,
            "--px-drift": p.drift,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ─── Fake cursors ─────────────────────────────────────────────── */
const FAKE_CURSORS = [
  { name: "Sofia", color: "#a78bfa", x: "8%", y: "28%", delay: "0s" },
  { name: "Marcus", color: "#34d399", x: "82%", y: "18%", delay: "0.8s" },
  { name: "Yuki", color: "#38bdf8", x: "88%", y: "72%", delay: "1.6s" },
  { name: "Lena", color: "#f472b6", x: "6%", y: "75%", delay: "0.4s" },
];

function FakeCursor({ name, color, x, y, delay }: { name: string; color: string; x: string; y: string; delay: string }) {
  return (
    <div className="pointer-events-none absolute flex flex-col items-start gap-1" style={{ left: x, top: y }}>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none"
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
        <path d="M2 2L9 18L12 12L18 9L2 2Z" fill={color} stroke="white" strokeWidth="1" strokeLinejoin="round" />
      </svg>
      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
        style={{ background: color, boxShadow: `0 0 12px ${color}88`, letterSpacing: "0.02em" }}>
        {name}
      </span>
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"home" | "join">("home");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sketchspace-username");
    if (stored) setUsername(stored);
  }, []);

  const saveUsername = (name: string) =>
    localStorage.setItem("sketchspace-username", name);

  async function handleCreate() {
    if (!username.trim()) { setError("Please enter your name first"); return; }
    setLoading(true); setError("");
    try {
      const { code } = await createSession();
      saveUsername(username.trim());
      router.push(`/session/${code}?username=${encodeURIComponent(username.trim())}`);
    } catch {
      setError("Could not create session — is the server running?");
    } finally { setLoading(false); }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) { setError("Please enter your name first"); return; }
    if (!joinCode.trim()) { setError("Please enter a session code"); return; }
    setLoading(true); setError("");
    try {
      const valid = await validateSession(joinCode.trim().toUpperCase());
      if (!valid) { setError("Session not found — check the code and try again"); return; }
      saveUsername(username.trim());
      router.push(`/session/${joinCode.trim().toUpperCase()}?username=${encodeURIComponent(username.trim())}`);
    } catch {
      setError("Could not connect to server");
    } finally { setLoading(false); }
  }

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-home-bg">

      {/* ── Background layers ── */}
      <BackgroundScene />
      <ParticleCanvas />
      <LaserCursor />

      {/* ── Fake cursors ── */}
      {mounted && FAKE_CURSORS.map((c) => (
        <div key={c.name} className="cursor-float z-10"
          style={{ "--float-delay": c.delay } as React.CSSProperties}>
          <FakeCursor {...c} />
        </div>
      ))}

      {/* ── Nav bar ── */}
      <header className="relative z-20 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="gradient-border flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
            style={{ background: "linear-gradient(135deg, #1a0533 0%, #0d1f40 100%)" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 16 Q6 8 10 10 Q14 12 17 4"
                stroke="url(#nav-grad)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <defs>
                <linearGradient id="nav-grad" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight" style={{
            background: "linear-gradient(90deg, #e8ecef 0%, #a78bfa 60%, #38bdf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Sketchspace
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Live badge */}
          <div className="badge-live flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "#34d399",
            }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live
          </div>

          {/* Feature pills */}
          <div className="hidden items-center gap-2 md:flex">
            {[
              { icon: <Globe size={11} />, label: "Web-based" },
              { icon: <Zap size={11} />, label: "Real-time" },
              { icon: <Lock size={11} />, label: "No signup" },
            ].map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#7a8f99",
                }}>
                {icon} {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="relative z-20 flex flex-1 items-center justify-center px-4 pb-12 pt-2">

        {/* Outer gradient border card wrapper */}
        <div className="gradient-border w-full max-w-4xl card-enter">
          {/* Two-panel card */}
          <div
            className="relative flex min-h-[520px] overflow-hidden rounded-2xl"
            style={{
              background: "rgba(8, 10, 18, 0.88)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >

            {/* ── Left: form panel ── */}
            <div className="flex w-full flex-col justify-center px-10 py-10 md:w-[46%]">

              {/* Branding */}
              <div className="mb-8">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    color: "#a78bfa",
                  }}>
                  <Sparkles size={10} /> Collaborative canvas
                </div>
                <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight text-white">
                  {mode === "home" ? (
                    <>Start your<br />
                      <span style={{
                        background: "linear-gradient(90deg, #a78bfa 0%, #38bdf8 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      }}>canvas</span>
                    </>
                  ) : "Join a session"}
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: "#4e6070" }}>
                  {mode === "home"
                    ? "Create or join a shared canvas. Draw together in real time — no account needed."
                    : "Enter your name and the 6-character session code to jump in."}
                </p>
              </div>

              {/* Name field */}
              <div className="mb-4">
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#3a5060" }}>
                  Display name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="How should others see you?"
                  maxLength={20}
                  className="home-input w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    caretColor: "#a78bfa",
                  }}
                />
              </div>

              {/* Home mode */}
              {mode === "home" ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="btn-cta flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #234a51 0%, #234a51 100%)",
                    }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : (
                      <><Sparkles size={15} /> Create new canvas <ArrowRight size={15} /></>
                    )}
                  </button>

                  <button
                    onClick={() => { setMode("join"); setError(""); }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all hover:border-violet-500/40"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#7a8f99",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#a78bfa";
                      e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#7a8f99";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    }}
                  >
                    <Users size={15} /> Join with a code
                  </button>

                  {/* Divider */}
                  <div className="mt-1 flex items-center gap-3">
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <span className="text-[11px]" style={{ color: "#2a3a45" }}>features</span>
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                  </div>

                  {/* Feature list */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: "✦", label: "Vector drawing", color: "#a78bfa" },
                      { icon: "⚡", label: "Live cursors", color: "#38bdf8" },
                      { icon: "🎨", label: "Pastel palette", color: "#f472b6" },
                      { icon: "🔗", label: "Share by code", color: "#34d399" },
                    ].map(({ icon, label, color }) => (
                      <div key={label} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "#4e6070" }}>
                        <span style={{ color }}>{icon}</span> {label}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Join mode */
                <form onSubmit={handleJoin} className="flex flex-col gap-3">
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#3a5060" }}>
                      Session code
                    </label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                      placeholder="ABC123"
                      maxLength={6}
                      className="home-input w-full rounded-xl px-4 py-3.5 text-center font-mono text-xl font-bold tracking-[0.4em] text-white outline-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        caretColor: "#a78bfa",
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-cta flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)" }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : (
                      <> Join session <ArrowRight size={15} /></>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("home"); setError(""); setJoinCode(""); }}
                    className="text-center text-sm transition-colors"
                    style={{ color: "#3a5060" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#a78bfa"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#3a5060"; }}
                  >
                    ← Back
                  </button>
                </form>
              )}

              {error && (
                <p className="mt-3 rounded-xl border px-3 py-2.5 text-center text-sm"
                  style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.07)", color: "#f87171" }}>
                  {error}
                </p>
              )}

              {/* Footer hint */}
              <p className="mt-6 text-center text-[11px]" style={{ color: "#2a3a45" }}>
                No account · No download · Just draw
              </p>
            </div>

            {/* ── Divider ── */}
            <div className="hidden w-px self-stretch md:block"
              style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.07), transparent)" }} />

            {/* ── Right: visual panel ── */}
            <div className="relative hidden flex-1 md:flex"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.04) 50%, rgba(236,72,153,0.05) 100%)",
              }}>
              <SketchArt />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
