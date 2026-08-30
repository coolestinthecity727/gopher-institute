import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = signSession({
    userId: user.id,
    role: user.role as any,
    email: user.email,
    fullName: user.fullName,
  });

  const res = NextResponse.json({ role: user.role });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
