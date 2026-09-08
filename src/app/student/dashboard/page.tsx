import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = getSessionFromCookies();
  const student = await prisma.student.findUnique({
  where: { userId: session!.userId },
  include: {
    course: { include: { lessons: { where: { published: true }, orderBy: { sortOrder: "asc" } } } },
    certificates: true,
  },
});

  if (!student) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
        <h1 className="font-display text-2xl font-extrabold text-navy-900">No student record linked</h1>
        <p className="mt-2 text-navy-600">Please contact the registrar's office to link your account.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rust-500">Student Dashboard</span>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-navy-900">Welcome, {student.fullName.split(" ")[0]}</h1>
        </div>
        <span className={`route-tag px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white ${student.status === "CURRENT" ? "bg-rust-500" : "bg-navy-600"}`}>
          {student.status === "CURRENT" ? "Currently Enrolled" : student.status}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card-surface rounded-xl p-6 lg:col-span-2">
          <h2 className="font-display font-bold text-navy-900">Enrollment Details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-navy-500">Student Number</dt><dd className="font-semibold text-navy-900">{student.studentNumber}</dd></div>
            <div><dt className="text-navy-500">Programme</dt><dd className="font-semibold text-navy-900">{student.course.name}</dd></div>
            <div><dt className="text-navy-500">Enrolled</dt><dd className="font-semibold text-navy-900">{new Date(student.enrollmentDate).toLocaleDateString()}</dd></div>
            <div><dt className="text-navy-500">Email</dt><dd className="font-semibold text-navy-900">{student.email}</dd></div>
            {student.graduationDate && (
              <div><dt className="text-navy-500">Graduated</dt><dd className="font-semibold text-navy-900">{new Date(student.graduationDate).toLocaleDateString()}</dd></div>
            )}
          </dl>
        </div>

        <div className="card-surface rounded-xl p-6">
          <h2 className="font-display font-bold text-navy-900">Programme Duration</h2>
          <p className="mt-2 text-sm text-navy-600">{student.course.duration}</p>
          <h2 className="mt-4 font-display font-bold text-navy-900">Tuition</h2>
          <p className="mt-2 text-sm text-navy-600">${student.course.fee.toFixed(0)}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display font-bold text-navy-900 text-lg">My Certificates</h2>
        {student.certificates.length === 0 ? (
          <p className="mt-3 text-sm text-navy-500">No certificates issued yet — they'll appear here once your programme is complete.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {student.certificates.map((c) => (
              <div key={c.id} className="card-surface rounded-xl p-6">
                <p className="font-display font-bold text-navy-900">{c.courseName}</p>
                <dl className="mt-3 space-y-1 text-sm text-navy-600">
                  <div>Certificate No: <span className="font-semibold text-navy-900">{c.certificateNo}</span></div>
                  <div>Verification Code: <span className="font-semibold text-navy-900">{c.verificationCode}</span></div>
                  <div>Grade: <span className="font-semibold text-navy-900">{c.grade || "—"}</span></div>
                  <div>Issued: <span className="font-semibold text-navy-900">{new Date(c.issueDate).toLocaleDateString()}</span></div>
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
