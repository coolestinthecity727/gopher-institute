import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();

  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.userId },
  });

  if (!student) {
    return NextResponse.json(
      { error: "No student record found." },
      { status: 404 }
    );
  }

  if (student.learningMode !== "ONLINE") {
    return NextResponse.json(
      { error: "Certificate requests are only available for online students." },
      { status: 403 }
    );
  }

  const { courseId } = await req.json();

  if (!courseId) {
    return NextResponse.json(
      { error: "Course is required." },
      { status: 400 }
    );
  }

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId,
      },
    },
  });

  if (!enrollment) {
    return NextResponse.json(
      { error: "You are not enrolled in this online course." },
      { status: 403 }
    );
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        select: { id: true },
      },
    },
  });

  if (!course) {
    return NextResponse.json(
      { error: "Course not found." },
      { status: 404 }
    );
  }

  const totalLessons = course.lessons.length;

  const completedLessons = await prisma.lessonProgress.count({
    where: {
      studentId: student.id,
      lessonId: {
        in: course.lessons.map((lesson) => lesson.id),
      },
    },
  });

  if (totalLessons === 0 || completedLessons < totalLessons) {
    return NextResponse.json(
      {
        error: "You must complete 100% of the online course before requesting a certificate.",
      },
      { status: 400 }
    );
  }

  const request = await prisma.certificateRequest.upsert({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId,
      },
    },
    update: {},
    create: {
      studentId: student.id,
      courseId,
    },
  });

  return NextResponse.json({
    ok: true,
    request,
  });
}
