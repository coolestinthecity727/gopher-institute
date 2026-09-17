import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public leaderboard ranking students by total lessons completed.
// Uses first name + last initial only, to protect student privacy.
export async function GET() {
  const students = await prisma.student.findMany({
    select: { id: true, fullName: true },
  });

  const counts = await prisma.lessonProgress.groupBy({
    by: ["studentId"],
    _count: { studentId: true },
  });

  const countMap = new Map(counts.map((c) => [c.studentId, c._count.studentId]));

  const ranked = students
    .map((s) => {
      const parts = s.fullName.trim().split(" ");
      const displayName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
      return { displayName, lessonsCompleted: countMap.get(s.id) || 0 };
    })
    .filter((s) => s.lessonsCompleted > 0)
    .sort((a, b) => b.lessonsCompleted - a.lessonsCompleted)
    .slice(0, 20);

  return NextResponse.json({ leaderboard: ranked });
}