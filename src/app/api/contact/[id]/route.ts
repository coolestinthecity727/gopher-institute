import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { isRead } = await req.json();
  const message = await prisma.contactMessage.update({ where: { id: params.id }, data: { isRead: !!isRead } });
  return NextResponse.json({ message });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.contactMessage.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
