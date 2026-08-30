import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (body.fee !== undefined) body.fee = Number(body.fee) || 0;
  const course = await prisma.course.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ course });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Soft-disable rather than hard-delete, since applications/students may reference this course.
  await prisma.course.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
