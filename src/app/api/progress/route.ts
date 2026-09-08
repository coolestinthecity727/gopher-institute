import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

// Marks a lesson complete for the logged-in student, either directly (no quiz)
// or after recording a quiz result (only counts as complete if passed).
export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) return NextResponse.json({ error: "No student record found." }, { status: 404 });

  const { lessonId, quizAnswers } = await req.json();
  if (!lessonId) return NextResponse.json({ error: "Lesson is required." }, { status: 400 });

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

  // If this lesson has a quiz, grade it and only mark complete on a passing score.
  if (lesson.quizJson) {
    const questions = JSON.parse(lesson.quizJson) as { correctIndex: number }[];
    const answers: number[] = Array.isArray(quizAnswers) ? quizAnswers : [];
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) score++;
    });
    const total = questions.length;
    const passed = total > 0 && score / total >= 0.7; // 70% pass mark

    await prisma.quizResult.upsert({
      where: { studentId_lessonId: { studentId: student.id, lessonId } },
      update: { score, total, passed, attemptedAt: new Date() },
      create: { studentId: student.id, lessonId, score, total, passed },
    });

    if (passed) {
      await prisma.lessonProgress.upsert({
        where: { studentId_lessonId: { studentId: student.id, lessonId } },
        update: {},
        create: { studentId: student.id, lessonId },
      });
    }

    return NextResponse.json({ score, total, passed });
  }

  // No quiz — just mark it complete directly.
  await prisma.lessonProgress.upsert({
    where: { studentId_lessonId: { studentId: student.id, lessonId } },
    update: {},
    create: { studentId: student.id, lessonId },
  });

  return NextResponse.json({ ok: true });
}