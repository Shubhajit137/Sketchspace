export interface Session {
  code: string;
  createdAt: number;
  participants: Map<string, Participant>;
}

export interface Participant {
  id: string;
  username: string;
  color: string;
  joinedAt: number;
}

export interface CursorPosition {
  x: number;
  y: number;
}
