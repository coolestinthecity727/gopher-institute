import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  const session = getSessionFromCookies();
  const staff = !!session && isStaff(session.role);

  const lessons = await prisma.lesson.findMany({
    where: {
      ...(courseId ? { courseId } : {}),
      ...(staff ? {} : { published: true }),
    },
    include: { course: true },
    orderBy: [{ courseId: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ lessons });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { courseId, title, description, videoUrl, documentUrl, sortOrder, published } = await req.json();
  if (!courseId || !title || !description) {
    return NextResponse.json({ error: "Programme, title and description are required." }, { status: 400 });
  }
  const lesson = await prisma.lesson.create({
    data: {
      courseId,
      title,
      description,
      videoUrl: videoUrl || null,
      documentUrl: documentUrl || null,
      sortOrder: Number(sortOrder) || 0,
      published: published ?? true,
    },
  });
  return NextResponse.json({ lesson }, { status: 201 });
}