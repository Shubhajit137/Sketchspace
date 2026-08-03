"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
exports.sessionExists = sessionExists;
exports.deleteSession = deleteSession;
exports.getSessionCount = getSessionCount;
const nanoid_1 = require("nanoid");
const generateCode = (0, nanoid_1.customAlphabet)("23456789ABCDEFGHJKMNPQRSTUVWXYZ", 6);
const sessions = new Map();
function createSession() {
    let code = generateCode();
    while (sessions.has(code)) {
        code = generateCode();
    }
    const session = {
        code,
        createdAt: Date.now(),
        participants: new Map(),
    };
    sessions.set(code, session);
    return session;
}
function getSession(code) {
    return sessions.get(code.toUpperCase());
}
function sessionExists(code) {
    return sessions.has(code.toUpperCase());
}
function deleteSession(code) {
    return sessions.delete(code.toUpperCase());
}
function getSessionCount() {
    return sessions.size;
}
