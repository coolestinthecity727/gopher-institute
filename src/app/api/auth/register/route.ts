import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { studentNumber, email, password } = await req.json();
  if (!studentNumber || !email || !password) {
    return NextResponse.json({ error: "Student number, email and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const student = await prisma.student.findUnique({ where: { studentNumber: String(studentNumber).trim() } });
  if (!student) {
    return NextResponse.json({ error: "No student record matches that student number." }, { status: 404 });
  }
  if (student.email.toLowerCase() !== String(email).toLowerCase().trim()) {
    return NextResponse.json({ error: "Email does not match our records for this student number." }, { status: 400 });
  }
  if (student.userId) {
    return NextResponse.json({ error: "An account already exists for this student. Please log in instead." }, { status: 409 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: student.email.toLowerCase() } });
  if (existingUser) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: student.email.toLowerCase(),
      passwordHash,
      role: "STUDENT",
      fullName: student.fullName,
      phone: student.phone,
    },
  });

  await prisma.student.update({ where: { id: student.id }, data: { userId: user.id } });

  const token = signSession({ userId: user.id, role: "STUDENT", email: user.email, fullName: user.fullName });
  const res = NextResponse.json({ ok: true }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
