# Sketchspace

A real-time collaborative whiteboard inspired by Excalidraw. Sketch, annotate, and brainstorm together — join a session with a shareable code and watch ideas take shape live on a shared canvas.

![Status](https://img.shields.io/badge/status-active-brightgreen) ![Frontend](https://img.shields.io/badge/frontend-Next.js%2016-blue) ![Backend](https://img.shields.io/badge/backend-Express%20%2B%20Socket.io-orange)

---

## ✨ Features

### Drawing & Editing
- **10 tools** — hand, select, rectangle, diamond, ellipse, arrow, line, freehand pen, text, and eraser
- **Vector rendering** — SVG-based output stays crisp at any zoom level
- **Freehand strokes** — smooth, pressure-aware paths via `perfect-freehand`
- **Text tool** — click anywhere to type, double-click existing text to edit in place
- **Selection & manipulation** — move, resize with 8 handles, and fine-tune any element
- **Undo / Redo** — full history stack with keyboard shortcuts

### Styling
- **Stroke color** — 6 pastel presets plus a custom color wheel
- **Fill color** — transparent or solid fills for shapes
- **Stroke width** — thin, medium, or bold
- **Stroke style** — solid, dashed, or dotted
- **Opacity** — per-element transparency control
- **Font size** — S / M / L / XL presets for text

### View & Navigation
- **Zoom & pan** — pinch/scroll zoom toward the cursor, spacebar + drag to pan
- **Keyboard shortcuts** — quick tool switching (H, V, R, D, O, A, L, P, T, E)
- **Dark / light theme** — soft charcoal dark mode, not pure black

### Collaboration *(in progress)*
- **Session codes** — create or join a room with a shareable code
- **Live presence** — participant list with per-user cursor colors
- **Remote cursors** — see teammates' cursors and usernames in real time

---

## 🛠 Tech Stack

| Layer | Technology | Deployment |
|-------|-----------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 | Vercel |
| **Backend** | Node.js, Express 5, Socket.io, TypeScript | Render |
| **Drawing** | SVG + perfect-freehand (vector, crisp at any zoom) | — |
| **Realtime** | Socket.io (cursors, presence, drawing sync) | — |

---

## 📁 Project Structure

```
Sketchspace/
├── frontend/                  # Next.js app (Vercel)
│   └── src/
│       ├── app/               # Pages: landing, session/[code]
│       ├── components/
│       │   ├── canvas/        # DrawingCanvas, TopToolbar, PropertiesPanel,
│       │   │                  # ZoomControls, SessionBar, HelpButton
│       │   ├── ThemeProvider.tsx
│       │   └── ThemeToggle.tsx
│       └── lib/
│           ├── api.ts         # REST client for session API
│           ├── colors.ts      # Drawing color presets
│           └── canvas/        # types.ts, geometry.ts (rendering math)
│
└── backend/                   # Express + Socket.io server (Render)
    └── src/
        ├── index.ts           # HTTP + Socket.io entry point
        ├── sessions.ts        # In-memory session store
        └── types.ts           # Shared participant/session types
```

---

## 🎨 Design System

- **Accent color:** `#234a51`
- **Dark mode:** Soft charcoal (`#1c2226`), not pure black
- **Drawing colors:** 6 pastel presets + custom color wheel
- **Collaboration:** Session codes, live cursors with usernames

---

## 🗺 Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project scaffolding + backend session API | ✅ Complete |
| 2 | Landing page (create/join session, theme toggle) | ✅ Complete |
| 3 | Canvas with vector drawing tools | ✅ Complete |
| 4 | Multiplayer drawing sync + remote cursors | 🔲 In progress |

### Phase 4 — Multiplayer Roadmap
- [x] Session codes & join flow
- [x] Live presence & participant list
- [x] Remote cursor broadcasting
- [ ] Drawing element sync (broadcast create/update/delete)
- [ ] Conflict handling & element ownership
- [ ] Persistence (optional: save/load boards)

---

Environment variables are managed via `.env` (backend) and `.env.local` (frontend), with `.env.example` / `.env.local.example` templates committed for reference.
