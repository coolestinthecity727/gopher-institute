import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const COOKIE_NAME = "gif_session";

export type SessionPayload = {
  userId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "REGISTRAR" | "STUDENT";
  email: string;
  fullName: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

/** Read the current session from the Next.js server cookie store (Server Components / Route Handlers). */
export function getSessionFromCookies(): SessionPayload | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Read the current session from a NextRequest (used inside middleware). */
export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export const SESSION_COOKIE = COOKIE_NAME;

export function isStaff(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "REGISTRAR";
}
