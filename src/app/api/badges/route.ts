import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

const BADGE_INFO: Record<string, { label: string; icon: string; description: string }> = {
  "first-step": { label: "First Step", icon: "🎯", description: "Completed your first lesson" },
  "quiz-master": { label: "Quiz Master", icon: "🧠", description: "Passed 5 quizzes" },
  "programme-graduate": { label: "Programme Graduate", icon: "🎓", description: "Completed an entire course" },
};

export async function GET() {
  const session = getSessionFromCookies();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) return NextResponse.json({ error: "No student record found." }, { status: 404 });

  const earned = await prisma.studentBadge.findMany({ where: { studentId: student.id } });
  const earnedKeys = new Set(earned.map((b) => b.badgeKey));

  const badges = Object.entries(BADGE_INFO).map(([key, info]) => ({
    key,
    ...info,
    earned: earnedKeys.has(key),
  }));

  return NextResponse.json({ badges });
}