import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { createSession, getSession, sessionExists } from "./sessions";
import type { Participant } from "./types";

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

const CURSOR_COLORS = [
  "#E8A598",
  "#98C1E8",
  "#98E8B4",
  "#E8D498",
  "#C498E8",
  "#E898C1",
];

function pickColor(sessionCode: string): string {
  const session = getSession(sessionCode);
  const usedColors = new Set(
    session ? Array.from(session.participants.values()).map((p) => p.color) : []
  );
  const available = CURSOR_COLORS.filter((c) => !usedColors.has(c));
  return available[Math.floor(Math.random() * available.length)] ?? CURSOR_COLORS[0];
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/sessions", (_req, res) => {
  const session = createSession();
  res.json({ code: session.code });
});

app.get("/api/sessions/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  if (!sessionExists(code)) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  const session = getSession(code)!;
  res.json({
    code: session.code,
    participantCount: session.participants.size,
    createdAt: session.createdAt,
  });
});

io.on("connection", (socket) => {
  let currentSession: string | null = null;
  let participantId: string | null = null;

  socket.on("join-session", ({ code, username }: { code: string; username: string }) => {
    const sessionCode = code.toUpperCase();
    const session = getSession(sessionCode);

    if (!session) {
      socket.emit("join-error", { message: "Session not found" });
      return;
    }

    if (!username?.trim()) {
      socket.emit("join-error", { message: "Username is required" });
      return;
    }

    currentSession = sessionCode;
    participantId = socket.id;

    const participant: Participant = {
      id: socket.id,
      username: username.trim().slice(0, 20),
      color: pickColor(sessionCode),
      joinedAt: Date.now(),
    };

    session.participants.set(socket.id, participant);
    socket.join(sessionCode);

    const participants = Array.from(session.participants.values()).map((p) => ({
      id: p.id,
      username: p.username,
      color: p.color,
    }));

    socket.emit("joined", { participant, participants });
    socket.to(sessionCode).emit("participant-joined", { participant });

    socket.to(sessionCode).emit("participants-update", { participants });
  });

  socket.on("cursor-move", ({ x, y }: { x: number; y: number }) => {
    if (!currentSession || !participantId) return;
    const session = getSession(currentSession);
    const participant = session?.participants.get(participantId);
    if (!participant) return;

    socket.to(currentSession).emit("cursor-update", {
      id: participantId,
      username: participant.username,
      color: participant.color,
      x,
      y,
    });
  });

  socket.on("disconnect", () => {
    if (!currentSession || !participantId) return;
    const session = getSession(currentSession);
    if (session) {
      session.participants.delete(participantId);
      const participants = Array.from(session.participants.values()).map((p) => ({
        id: p.id,
        username: p.username,
        color: p.color,
      }));
      io.to(currentSession).emit("participant-left", { id: participantId });
      io.to(currentSession).emit("participants-update", { participants });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Sketchspace server running on port ${PORT}`);
});
