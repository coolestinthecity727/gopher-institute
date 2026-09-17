import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

async function awardBadges(studentId: string) {
  // Count completed lessons
  const totalCompleted = await prisma.lessonProgress.count({
    where: { studentId },
  });

  // First Step — complete at least one lesson
  if (totalCompleted >= 1) {
    await prisma.studentBadge.upsert({
      where: {
        studentId_badgeKey: {
          studentId,
          badgeKey: "first-step",
        },
      },
      update: {},
      create: {
        studentId,
        badgeKey: "first-step",
      },
    });
  }

  // Count passed quizzes
  const quizzesPassed = await prisma.quizResult.count({
    where: {
      studentId,
      passed: true,
    },
  });

  // Quiz Master — pass 5 quizzes
  if (quizzesPassed >= 5) {
    await prisma.studentBadge.upsert({
      where: {
        studentId_badgeKey: {
          studentId,
          badgeKey: "quiz-master",
        },
      },
      update: {},
      create: {
        studentId,
        badgeKey: "quiz-master",
      },
    });
  }

  // Programme Graduate — complete an entire programme
  const completedLessons = await prisma.lessonProgress.findMany({
    where: { studentId },
    select: { lessonId: true },
  });

  const completedLessonIds = completedLessons.map(
    (lesson) => lesson.lessonId
  );

  if (completedLessonIds.length > 0) {
    const lessons = await prisma.lesson.findMany({
      where: {
        id: {
          in: completedLessonIds,
        },
      },
      select: {
        courseId: true,
      },
    });

    const coursesTouched = [
      ...new Set(lessons.map((lesson) => lesson.courseId)),
    ];

    for (const courseId of coursesTouched) {
      const totalInCourse = await prisma.lesson.count({
        where: {
          courseId,
          published: true,
        },
      });

      const completedInCourse = lessons.filter(
        (lesson) => lesson.courseId === courseId
      ).length;

      if (
        totalInCourse > 0 &&
        completedInCourse >= totalInCourse
      ) {
        await prisma.studentBadge.upsert({
          where: {
            studentId_badgeKey: {
              studentId,
              badgeKey: "programme-graduate",
            },
          },
          update: {},
          create: {
            studentId,
            badgeKey: "programme-graduate",
          },
        });

        break;
      }
    }
  }
}

// Award First Step when a student starts their first lesson.
async function awardFirstStepBadge(studentId: string) {
  await prisma.studentBadge.upsert({
    where: {
      studentId_badgeKey: {
        studentId,
        badgeKey: "first-step",
      },
    },
    update: {},
    create: {
      studentId,
      badgeKey: "first-step",
    },
  });
}

// Marks a lesson complete and awards 10 XP once per lesson.
// Also supports starting a lesson for badge recognition.
export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();

  if (!session || session.role !== "STUDENT") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const student = await prisma.student.findUnique({
    where: {
      userId: session.userId,
    },
  });

  if (!student) {
    return NextResponse.json(
      { error: "No student record found." },
      { status: 404 }
    );
  }

  const { lessonId, quizAnswers, action } = await req.json();

  if (!lessonId) {
    return NextResponse.json(
      { error: "Lesson is required." },
      { status: 400 }
    );
  }

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
  });

  if (!lesson) {
    return NextResponse.json(
      { error: "Lesson not found." },
      { status: 404 }
    );
  }

  // --------------------------------------------------
  // START LESSON
  // --------------------------------------------------
  // Starting a lesson recognizes learner engagement.
  // It does NOT complete the lesson and does NOT award XP.
  if (action === "start") {
    await awardFirstStepBadge(student.id);

    return NextResponse.json({
      ok: true,
      badgeAwarded: "first-step",
    });
  }

  // Check whether this lesson was already completed.
  const existingProgress = await prisma.lessonProgress.findUnique({
    where: {
      studentId_lessonId: {
        studentId: student.id,
        lessonId,
      },
    },
  });

  // --------------------------------------------------
  // LESSON HAS A QUIZ
  // --------------------------------------------------
  if (lesson.quizJson) {
    const questions = JSON.parse(lesson.quizJson) as {
      correctIndex: number;
    }[];

    const answers: number[] = Array.isArray(quizAnswers)
      ? quizAnswers
      : [];

    let score = 0;

    questions.forEach((question, index) => {
      if (answers[index] === question.correctIndex) {
        score++;
      }
    });

    const total = questions.length;
    const passed = total > 0 && score / total >= 0.7;

    await prisma.quizResult.upsert({
      where: {
        studentId_lessonId: {
          studentId: student.id,
          lessonId,
        },
      },
      update: {
        score,
        total,
        passed,
        attemptedAt: new Date(),
      },
      create: {
        studentId: student.id,
        lessonId,
        score,
        total,
        passed,
      },
    });

    if (passed) {
      await prisma.lessonProgress.upsert({
        where: {
          studentId_lessonId: {
            studentId: student.id,
            lessonId,
          },
        },
        update: {},
        create: {
          studentId: student.id,
          lessonId,
        },
      });

      // Award 10 XP only the first time this lesson is completed.
      if (!existingProgress) {
        await prisma.student.update({
          where: {
            id: student.id,
          },
          data: {
            xp: {
              increment: 10,
            },
          },
        });
      }

      // Award achievement badges after successful completion.
      await awardBadges(student.id);
    }

    return NextResponse.json({
      score,
      total,
      passed,
      xpAwarded: passed && !existingProgress ? 10 : 0,
    });
  }

  // --------------------------------------------------
  // LESSON WITHOUT A QUIZ
  // --------------------------------------------------

  await prisma.lessonProgress.upsert({
    where: {
      studentId_lessonId: {
        studentId: student.id,
        lessonId,
      },
    },
    update: {},
    create: {
      studentId: student.id,
      lessonId,
    },
  });

  // Award 10 XP only the first time this lesson is completed.
  if (!existingProgress) {
    await prisma.student.update({
      where: {
        id: student.id,
      },
      data: {
        xp: {
          increment: 10,
        },
      },
    });
  }

  // Award achievement badges after completing the lesson.
  await awardBadges(student.id);

  return NextResponse.json({
    ok: true,
    xpAwarded: !existingProgress ? 10 : 0,
  });
}