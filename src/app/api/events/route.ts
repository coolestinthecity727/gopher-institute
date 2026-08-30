import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { title, category, summary, content, imageUrl, eventDate, location, published } = body;

  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(summary !== undefined ? { summary } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(eventDate !== undefined ? { eventDate: eventDate ? new Date(eventDate) : null } : {}),
      ...(location !== undefined ? { location } : {}),
      ...(published !== undefined ? { published } : {}),
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
