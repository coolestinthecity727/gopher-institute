import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { status, graduationDate, fullName, email, phone, courseId } = body;

  const student = await prisma.student.update({
    where: { id: params.id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(graduationDate !== undefined ? { graduationDate: graduationDate ? new Date(graduationDate) : null } : {}),
      ...(fullName !== undefined ? { fullName } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(courseId !== undefined ? { courseId } : {}),
    },
  });
  return NextResponse.json({ student });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.student.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
