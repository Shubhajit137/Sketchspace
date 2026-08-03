const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function createSession(): Promise<{ code: string }> {
  const res = await fetch(`${API_URL}/api/sessions`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export async function validateSession(code: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/sessions/${code}`);
  return res.ok;
}

export function getSocketUrl(): string {
  return API_URL;
}
