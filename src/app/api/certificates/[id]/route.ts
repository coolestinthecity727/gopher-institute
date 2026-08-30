import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { isRevoked, grade } = await req.json();
  const certificate = await prisma.certificate.update({
    where: { id: params.id },
    data: {
      ...(isRevoked !== undefined ? { isRevoked } : {}),
      ...(grade !== undefined ? { grade } : {}),
    },
  });
  return NextResponse.json({ certificate });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.certificate.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
