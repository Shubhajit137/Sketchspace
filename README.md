# Sketchspace

A multiplayer sketching app inspired by Excalidraw — draw, write, and collaborate in real time with session codes and live cursors.

## Tech Stack

| Layer | Technology | Deployment |
|-------|-----------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 | Vercel |
| **Backend** | Node.js, Express 5, Socket.io, TypeScript | Render |
| **Drawing** | SVG + perfect-freehand (vector, crisp at any zoom) | — |
| **Realtime** | Socket.io (cursors, presence, drawing sync) | — |

## Project Structure

```
Sketchspace/
├── frontend/     # Next.js app (Vercel)
└── backend/      # Express + Socket.io server (Render)
```

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Runs on `http://localhost:3001`

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Runs on `http://localhost:3000`

## Design

- **Accent color:** `#234a51`
- **Dark mode:** Soft charcoal (`#1c2226`), not pure black
- **Drawing colors:** 6 pastel presets + custom color wheel
- **Collaboration:** Session codes, live cursors with usernames

## Development Phases

1. ✅ Project scaffolding + backend session API
2. ✅ Landing page (create/join session, theme toggle)
3. 🔲 Canvas with vector drawing tools
4. 🔲 Multiplayer drawing sync + remote cursors
