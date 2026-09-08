import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import LessonPlayer from "./LessonPlayer";

export const dynamic = "force-dynamic";

export default async function StudentCourseLessonsPage({ params }: { params: { courseId: string } }) {
  const session = getSessionFromCookies();
  const student = await prisma.student.findUnique({ where: { userId: session!.userId } });
  if (!student || student.courseId !== params.courseId) notFound();

  const lessons = await prisma.lesson.findMany({
    where: { courseId: params.courseId, published: true },
    orderBy: { sortOrder: "asc" },
  });

  const progress = await prisma.lessonProgress.findMany({ where: { studentId: student.id } });
  const completedIds = new Set(progress.map((p) => p.lessonId));

  const course = await prisma.course.findUnique({ where: { id: params.courseId } });

  const lessonsForClient = lessons.map((l) => ({
    id: l.id,
    title: l.title,
    description: l.description,
    videoUrl: l.videoUrl,
    documentUrl: l.documentUrl,
    hasQuiz: !!l.quizJson,
    quiz: l.quizJson ? JSON.parse(l.quizJson) : null,
    completed: completedIds.has(l.id),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <span className="text-xs font-bold uppercase tracking-wider text-rust-500">Course Lessons</span>
      <h1 className="mt-1 font-display text-3xl font-extrabold text-navy-900">{course?.name}</h1>
      <LessonPlayer lessons={lessonsForClient} />
    </div>
  );
}