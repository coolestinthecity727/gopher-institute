import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  const modules = await prisma.module.findMany({
    where: courseId ? { courseId } : {},
    include: { lessons: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ modules });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { courseId, title, description, sortOrder } = await req.json();
  if (!courseId || !title) {
    return NextResponse.json({ error: "Programme and title are required." }, { status: 400 });
  }
  const module_ = await prisma.module.create({
    data: { courseId, title, description: description || "", sortOrder: Number(sortOrder) || 0 },
  });
  return NextResponse.json({ module: module_ }, { status: 201 });
}