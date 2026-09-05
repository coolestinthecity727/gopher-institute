import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";
import { generateStudentNumber } from "@/lib/ids";

export async function GET(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const students = await prisma.student.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(q
        ? { OR: [{ fullName: { contains: q } }, { studentNumber: { contains: q } }, { email: { contains: q } }] }
        : {}),
    },
    include: { course: true, certificates: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ students });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { fullName, email, phone, courseId, status } = await req.json();
  if (!fullName || !email || !courseId) {
    return NextResponse.json({ error: "Full name, email and programme are required." }, { status: 400 });
  }
  const student = await prisma.student.create({
    data: {
      studentNumber: generateStudentNumber(),
      fullName,
      email,
      phone: phone || "",
      courseId,
      status: status || "CURRENT",
    },
  });
  return NextResponse.json({ student }, { status: 201 });
}