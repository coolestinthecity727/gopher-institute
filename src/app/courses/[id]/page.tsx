import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";
import EnrollButton from "./EnrollButton";

export const dynamic = "force-dynamic";

export default async function CourseSyllabusPage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course || !course.isActive) notFound();

  const session = getSessionFromCookies();
  const isLoggedInStudent = !!session && session.role === "STUDENT";

  const modules = await prisma.module.findMany({
    where: { courseId: params.id },
    include: { lessons: { where: { published: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  const ungroupedLessons = await prisma.lesson.findMany({
    where: { courseId: params.id, published: true, moduleId: null },
    orderBy: { sortOrder: "asc" },
  });

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0) + ungroupedLessons.length;
  const totalMinutes =
    modules.reduce((sum, m) => sum + m.lessons.reduce((s, l) => s + (l.durationMinutes || 0), 0), 0) +
    ungroupedLessons.reduce((s, l) => s + (l.durationMinutes || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const durationLabel = totalMinutes > 0 ? `${hours > 0 ? `${hours}h ` : ""}${minutes}min` : null;

  return (
    <div>
      <section className="bg-navy-900 text-white py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-rust-400">{course.category}</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold">{course.name}</h1>
          <p className="mt-3 max-w-2xl text-navy-200">{course.description}</p>
          <dl className="mt-6 flex flex-wrap gap-8 text-sm">
            <div>
              <dt className="text-navy-400 uppercase text-xs tracking-wide">Duration</dt>
              <dd className="font-semibold">{course.duration}</dd>
            </div>
            <div>
              <dt className="text-navy-400 uppercase text-xs tracking-wide">Tuition</dt>
              <dd className="font-semibold">${course.fee.toFixed(0)}</dd>
            </div>
            <div>
              <dt className="text-navy-400 uppercase text-xs tracking-wide">Online Lessons</dt>
              <dd className="font-semibold">{totalLessons} lesson{totalLessons === 1 ? "" : "s"}</dd>
            </div>
            {durationLabel && (
              <div>
                <dt className="text-navy-400 uppercase text-xs tracking-wide">Total Video Time</dt>
                <dd className="font-semibold">{durationLabel}</dd>
              </div>
            )}
          </dl>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={`/apply?course=${course.id}`}
              className="inline-block rounded-md bg-rust-500 px-6 py-3 font-display font-bold text-white hover:bg-rust-400 transition-colors"
            >
              Apply for this Programme
            </Link>
            {totalLessons > 0 && <EnrollButton courseId={course.id} isLoggedInStudent={isLoggedInStudent} />}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-extrabold text-navy-900">Course Syllabus</h2>
        <p className="mt-2 text-sm text-navy-500">
          A full breakdown of what you'll learn, module by module.
        </p>

        {totalLessons === 0 ? (
          <p className="mt-8 text-navy-500">Detailed lesson content for this programme is being prepared — check back soon.</p>
        ) : (
          <div className="mt-8 space-y-8">
            {modules.map((m, mIndex) => (
              m.lessons.length > 0 && (
                <div key={m.id} className="card-surface rounded-xl p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-lg font-extrabold text-rust-500">{mIndex + 1}</span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-navy-900">{m.title}</h3>
                      {m.description && <p className="mt-1 text-sm text-navy-500">{m.description}</p>}
                    </div>
                  </div>
                  <ul className="mt-4 divide-y divide-navy-900/5">
                    {m.lessons.map((l, lIndex) => (
                      <li key={l.id} className="py-3 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-navy-800">{mIndex + 1}.{lIndex + 1} {l.title}</p>
                          <p className="mt-0.5 text-xs text-navy-500">{l.description}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-xs text-navy-400">
                          {l.durationMinutes && <span>{l.durationMinutes} min</span>}
                          {l.videoUrl && <span title="Includes video">🎬</span>}
                          {l.documentUrl && <span title="Includes notes">📄</span>}
                          {l.quizJson && <span title="Includes quiz">📝</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}

            {ungroupedLessons.length > 0 && (
              <div className="card-surface rounded-xl p-6">
                <h3 className="font-display text-lg font-bold text-navy-900">Additional Lessons</h3>
                <ul className="mt-4 divide-y divide-navy-900/5">
                  {ungroupedLessons.map((l, lIndex) => (
                    <li key={l.id} className="py-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-navy-800">{lIndex + 1}. {l.title}</p>
                        <p className="mt-0.5 text-xs text-navy-500">{l.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-xs text-navy-400">
                        {l.durationMinutes && <span>{l.durationMinutes} min</span>}
                        {l.videoUrl && <span title="Includes video">🎬</span>}
                        {l.documentUrl && <span title="Includes notes">📄</span>}
                        {l.quizJson && <span title="Includes quiz">📝</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 rounded-2xl bg-navy-800 text-white p-8 text-center">
          <h3 className="font-display text-xl font-extrabold">Ready to get started?</h3>
          <p className="mt-2 text-navy-200">Apply now to enrol in {course.name}.</p>
          <Link
            href={`/apply?course=${course.id}`}
            className="mt-4 inline-block rounded-md bg-rust-500 px-6 py-3 font-display font-bold hover:bg-rust-400 transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </section>
    </div>
  );
}