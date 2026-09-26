import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BADGE_INFO: Record<string, { label: string; icon: string; description: string }> = { "first-step": { label: "First Step", icon: "Ã°Å¸Å½Â¯", description: "Completed your first lesson" }, "quiz-master": { label: "Quiz Master", icon: "Ã°Å¸Â§Â ", description: "Passed 5 quizzes" }, "programme-graduate": { label: "Programme Graduate", icon: "Ã°Å¸Å½â€œ", description: "Completed an entire course" }, };

export default async function StudentDashboardPage() {
  const session = getSessionFromCookies();

  const student = await prisma.student.findUnique({
    where: { userId: session!.userId },
    include: {
      course: {
        include: {
          lessons: {
            where: { published: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      certificates: true,
    },
  });

  const onlineEnrollment = student ? await prisma.courseEnrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: student.courseId,
      },
    },
  }) : null;

  const extraEnrollments = student
    ? await prisma.courseEnrollment.findMany({
        where: {
          studentId: student.id,
          courseId: { not: student.courseId },
        },
      })
    : [];

  const extraCourseIds = extraEnrollments.map((e) => e.courseId);

  const extraCourses = extraCourseIds.length
    ? await prisma.course.findMany({
        where: { id: { in: extraCourseIds } },
      })
    : [];

  const earnedBadges = student
    ? await prisma.studentBadge.findMany({
        where: { studentId: student.id },
      })
    : [];

  const earnedKeys = new Set(
    earnedBadges.map((badge) => badge.badgeKey)
  );

  const onlineCertificateRequests = student ? await prisma.certificateRequest.findMany({ where: { studentId: student.id }, orderBy: { requestedAt: "desc" } }) : [];

if (!student) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-extrabold text-navy-900">
          No student record linked
        </h1>

        <p className="mt-2 text-navy-600">
          Please contact the registrar&apos;s office to link your account.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rust-500">
            Student Dashboard
          </span>

          <h1 className="mt-1 font-display text-3xl font-extrabold text-navy-900">
            Welcome, {student.fullName.split(" ")[0]}
          </h1>
        </div>

        <span
          className={`route-tag px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white ${
            student.status === "CURRENT"
              ? "bg-rust-500"
              : "bg-navy-600"
          }`}
        >
          {student.status === "CURRENT"
            ? "Currently Enrolled"
            : student.status}
        </span>
      </div>

      {/* Enrollment Details */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card-surface rounded-xl p-6 lg:col-span-2">
          <h2 className="font-display font-bold text-navy-900">
            Enrollment Details
          </h2>

          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-navy-500">Student Number</dt>
              <dd className="font-semibold text-navy-900">
                {student.studentNumber}
              </dd>
            </div>

            <div>
              <dt className="text-navy-500">Programme</dt>
              <dd className="font-semibold text-navy-900">
                {student.course.name}
              </dd>
            </div>

            <div>
              <dt className="text-navy-500">Enrolled</dt>
              <dd className="font-semibold text-navy-900">
                {new Date(
                  student.enrollmentDate
                ).toLocaleDateString()}
              </dd>
            </div>

            <div>
              <dt className="text-navy-500">Email</dt>
              <dd className="font-semibold text-navy-900">
                {student.email}
              </dd>
            </div>

            {student.graduationDate && (
              <div>
                <dt className="text-navy-500">Graduated</dt>
                <dd className="font-semibold text-navy-900">
                  {new Date(
                    student.graduationDate
                  ).toLocaleDateString()}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Programme Information */}
        <div className="card-surface rounded-xl p-6">
          <h2 className="font-display font-bold text-navy-900">
            Programme Duration
          </h2>

          <p className="mt-2 text-sm text-navy-600">
            {student.course.duration}
          </p>

          <h2 className="mt-4 font-display font-bold text-navy-900">
            Tuition
          </h2>

          <p className="mt-2 text-sm text-navy-600">
            ${student.course.fee.toFixed(0)}
          </p>
        </div>
      </div>

      {/* My Badges */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-navy-900">
            My Badges
          </h2>

          <a
            href="/leaderboard"
            className="text-sm font-semibold text-rust-500 hover:text-rust-600"
          >
            View Leaderboard
          </a>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Object.entries(BADGE_INFO).map(([key, info]) => {
            const earned = earnedKeys.has(key);

            return (
              <div
                key={key}
                className={`card-surface rounded-xl p-4 text-center ${
                  earned ? "" : "opacity-40 grayscale"
                }`}
                title={info.description}
              >
                <div className="text-3xl">
                  {info.icon}
                </div>

                <h3 className="mt-2 font-display font-bold text-navy-900">
                  {info.label}
                </h3>

                <p className="mt-1 text-xs text-navy-600">
                  {info.description}
                </p>

                <div className="mt-3 text-xs font-semibold">
                  {earned ? (
                    <span className="text-rust-500">
                      Earned ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
                    </span>
                  ) : (
                    <span className="text-navy-500">
                      Not yet earned
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Courses */}
      {extraCourses.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-navy-900">
            My Other Courses
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {extraCourses.map((course) => (
              <div
                key={course.id}
                className="card-surface rounded-xl p-5"
              >
                <h3 className="font-display font-bold text-navy-900">
                  {course.name}
                </h3>

                <p className="mt-2 text-sm text-navy-600">
                  {course.duration}
                </p>

                <a
                  href={`/student/dashboard/lessons/${course.id}`}
                  className="mt-4 inline-block text-sm font-semibold text-rust-500 hover:text-rust-600"
                >
                  Continue Learning ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online Tuition */}
      {student.learningMode === "ONLINE" && onlineEnrollment && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-navy-900">
            Online Tuition
          </h2>

          <div className="card-surface mt-4 rounded-xl p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                  Online Tuition
                </p>
                <p className="mt-1 text-xl font-bold text-navy-900">
                  ${student.course.onlineFee.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                  Amount Paid
                </p>
                <p className="mt-1 text-xl font-bold text-navy-900">
                  ${onlineEnrollment.amountPaid.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                  Outstanding
                </p>
                <p className="mt-1 text-xl font-bold text-navy-900">
                  ${Math.max(student.course.onlineFee - onlineEnrollment.amountPaid, 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-navy-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-navy-600">
                  Payment Status
                </p>
                <p className="mt-1 text-sm font-bold text-navy-900">
                  {onlineEnrollment.paymentStatus}
                </p>
              </div>

              {onlineEnrollment.paymentStatus !== "PAID" && (
                <a
                  href="/student/dashboard/tuition"
                  className="inline-flex items-center justify-center rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
                >
                  Pay Online Tuition
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Online Certificates */}
      {student.learningMode === "ONLINE" && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-navy-900">
            Online Certificates
          </h2>

          <div className="card-surface mt-4 rounded-xl p-6">
            {onlineCertificateRequests.length === 0 ? (
              <p className="text-sm text-navy-600">
                Complete 100% of your online course to request your certificate.
              </p>
            ) : (
              <div>
                <p className="text-sm text-navy-600">
                  Your online certificate request has been submitted.
                </p>
                <p className="mt-2 text-sm font-semibold text-navy-900">
                  Status: {onlineCertificateRequests[0].status}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certificates */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-bold text-navy-900">
          My Certificates
        </h2>

        {student.certificates.length === 0 ? (
          <div className="card-surface mt-4 rounded-xl p-6">
            <p className="text-sm text-navy-600">
              Your certificates will appear here once you complete the
              required programme requirements.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {student.certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="card-surface rounded-xl p-5"
              >
                <h3 className="font-display font-bold text-navy-900">
                  Certificate
                </h3>

                <p className="mt-2 text-sm text-navy-600">
                  Certificate issued by Gopher Institute Foundation.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

