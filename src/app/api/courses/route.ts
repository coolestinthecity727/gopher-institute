import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";

export async function GET() {
  const courses = await prisma.course.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, category, duration, fee, intake, description } = await req.json();
  if (!name || !category || !duration || !description) {
    return NextResponse.json({ error: "Name, category, duration and description are required." }, { status: 400 });
  }
  const course = await prisma.course.create({
    data: { name, category, duration, fee: Number(fee) || 0, intake: intake || null, description },
  });
  return NextResponse.json({ course }, { status: 201 });
}