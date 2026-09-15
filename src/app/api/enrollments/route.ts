import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

// Lets a logged-in student self-enroll in any course to access its free online lessons,
// separate from their main paid/physical programme enrollment.
export async function GET() {
  const session = getSessionFromCookies();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) return NextResponse.json({ error: "No student record found." }, { status: 404 });

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { studentId: student.id },
    orderBy: { enrolledAt: "desc" },
  });
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await prisma.course.findMany({ where: { id: { in: courseIds } } });

  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) return NextResponse.json({ error: "No student record found." }, { status: 404 });

  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "Course is required." }, { status: 400 });

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

  const enrollment = await prisma.courseEnrollment.upsert({
    where: { studentId_courseId: { studentId: student.id, courseId } },
    update: {},
    create: { studentId: student.id, courseId },
  });

  return NextResponse.json({ enrollment }, { status: 201 });
}