import type { Session } from "./types";
export declare function createSession(): Session;
export declare function getSession(code: string): Session | undefined;
export declare function sessionExists(code: string): boolean;
export declare function deleteSession(code: string): boolean;
export declare function getSessionCount(): number;
