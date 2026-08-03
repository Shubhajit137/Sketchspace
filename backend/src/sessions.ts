import { customAlphabet } from "nanoid";
import type { Session } from "./types";

const generateCode = customAlphabet("23456789ABCDEFGHJKMNPQRSTUVWXYZ", 6);

const sessions = new Map<string, Session>();

export function createSession(): Session {
  let code = generateCode();
  while (sessions.has(code)) {
    code = generateCode();
  }

  const session: Session = {
    code,
    createdAt: Date.now(),
    participants: new Map(),
  };

  sessions.set(code, session);
  return session;
}

export function getSession(code: string): Session | undefined {
  return sessions.get(code.toUpperCase());
}

export function sessionExists(code: string): boolean {
  return sessions.has(code.toUpperCase());
}

export function deleteSession(code: string): boolean {
  return sessions.delete(code.toUpperCase());
}

export function getSessionCount(): number {
  return sessions.size;
}
