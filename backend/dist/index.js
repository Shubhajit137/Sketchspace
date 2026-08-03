"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const sessions_1 = require("./sessions");
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"],
    },
});
app.use((0, cors_1.default)({ origin: FRONTEND_URL }));
app.use(express_1.default.json());
const CURSOR_COLORS = [
    "#E8A598",
    "#98C1E8",
    "#98E8B4",
    "#E8D498",
    "#C498E8",
    "#E898C1",
];
function pickColor(sessionCode) {
    const session = (0, sessions_1.getSession)(sessionCode);
    const usedColors = new Set(session ? Array.from(session.participants.values()).map((p) => p.color) : []);
    const available = CURSOR_COLORS.filter((c) => !usedColors.has(c));
    return available[Math.floor(Math.random() * available.length)] ?? CURSOR_COLORS[0];
}
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.post("/api/sessions", (_req, res) => {
    const session = (0, sessions_1.createSession)();
    res.json({ code: session.code });
});
app.get("/api/sessions/:code", (req, res) => {
    const code = req.params.code.toUpperCase();
    if (!(0, sessions_1.sessionExists)(code)) {
        res.status(404).json({ error: "Session not found" });
        return;
    }
    const session = (0, sessions_1.getSession)(code);
    res.json({
        code: session.code,
        participantCount: session.participants.size,
        createdAt: session.createdAt,
    });
});
io.on("connection", (socket) => {
    let currentSession = null;
    let participantId = null;
    socket.on("join-session", ({ code, username }) => {
        const sessionCode = code.toUpperCase();
        const session = (0, sessions_1.getSession)(sessionCode);
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
        const participant = {
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
    socket.on("cursor-move", ({ x, y }) => {
        if (!currentSession || !participantId)
            return;
        const session = (0, sessions_1.getSession)(currentSession);
        const participant = session?.participants.get(participantId);
        if (!participant)
            return;
        socket.to(currentSession).emit("cursor-update", {
            id: participantId,
            username: participant.username,
            color: participant.color,
            x,
            y,
        });
    });
    socket.on("disconnect", () => {
        if (!currentSession || !participantId)
            return;
        const session = (0, sessions_1.getSession)(currentSession);
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
