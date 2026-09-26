import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const grouped = courses.reduce<Record<string, typeof courses>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});

  const onlineCourses = courses.filter((course) => course.isOnline);

  return (
    <div>
      <section className="bg-navy-900 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-rust-400">
            Programmes
          </span>

          <h1 className="mt-2 font-display text-4xl font-extrabold">
            Technical &amp; Vocational Programmes
          </h1>

          <p className="mt-3 max-w-2xl text-navy-200">
            {courses.length} accredited programmes across health, engineering
            trades, technology, business, hospitality and the creative arts.
            Every intake runs January and July, unless noted.
          </p>
        </div>
      </section>

      {onlineCourses.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-navy-50 border border-navy-900/10 p-6 sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rust-500">
                  Online Learning
                </span>

                <h2 className="mt-2 font-display text-2xl font-extrabold text-navy-900">
                  Study Online with Gopher Institute
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-600">
                  Learn from anywhere through structured lessons, quizzes,
                  progress tracking and online certificate completion.
                </p>
              </div>

              <Link
                href="/student/login"
                className="inline-block rounded-md bg-rust-500 px-5 py-3 text-center text-sm font-display font-bold text-white hover:bg-rust-400 transition-colors focus-ring"
              >
                Student Login
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {onlineCourses.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl bg-white border border-navy-900/10 p-5"
                >
                  <span className="inline-block rounded-full bg-rust-100 px-3 py-1 text-xs font-bold text-rust-700">
                    Online Available
                  </span>

                  <h3 className="mt-3 font-display font-bold text-navy-900">
                    {c.name}
                  </h3>

                  <p className="mt-2 text-sm text-navy-600 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/courses/${c.id}`}
                      className="flex-1 rounded-md border border-navy-900/15 px-3 py-2 text-center text-sm font-display font-bold text-navy-700 hover:bg-navy-50 transition-colors"
                    >
                      View Syllabus
                    </Link>

                    <Link
                      href={`/apply?course=${c.id}`}
                      className="flex-1 rounded-md bg-rust-500 px-3 py-2 text-center text-sm font-display font-bold text-white hover:bg-rust-400 transition-colors"
                    >
                      Enrol Online
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 space-y-14">
        {Object.entries(grouped).map(([category, list]) => (
          <div key={category}>
            <h2 className="font-display text-xl font-extrabold text-navy-900 border-b border-navy-900/10 pb-3">
              {category}
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <div
                  key={c.id}
                  className="card-surface rounded-xl p-6 flex flex-col"
                >
                  <h3 className="font-display font-bold text-navy-900">
                    {c.name}
                  </h3>

                  <p className="mt-2 text-sm text-navy-600 leading-relaxed flex-1">
                    {c.description}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-navy-500">
                    <div>
                      <dt className="uppercase font-semibold tracking-wide">
                        Duration
                      </dt>
                      <dd>{c.duration}</dd>
                    </div>

                    <div>
                      <dt className="uppercase font-semibold tracking-wide">
                        Intake
                      </dt>
                      <dd>{c.intake || "Contact us"}</dd>
                    </div>

                    <div className="col-span-2">
                      <dt className="uppercase font-semibold tracking-wide">
                        Tuition
                      </dt>
                      <dd className="font-display font-bold text-navy-900">
                        ${c.fee.toFixed(0)} / programme
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/courses/${c.id}`}
                      className="flex-1 inline-block rounded-md border border-navy-900/15 px-4 py-2.5 text-center text-sm font-display font-bold text-navy-700 hover:bg-navy-50 transition-colors focus-ring"
                    >
                      View Syllabus
                    </Link>

                    <Link
                      href={`/apply?course=${c.id}`}
                      className="flex-1 inline-block rounded-md bg-rust-500 px-4 py-2.5 text-center text-sm font-display font-bold text-white hover:bg-rust-400 transition-colors focus-ring"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
