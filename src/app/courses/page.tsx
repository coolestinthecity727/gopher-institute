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

  return (
    <div>
      <section className="bg-navy-900 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-rust-400">Programmes</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Technical &amp; Vocational Programmes</h1>
          <p className="mt-3 max-w-2xl text-navy-200">
            {courses.length} accredited programmes across health, engineering trades, technology, business,
            hospitality and the creative arts. Every intake runs January and July, unless noted.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 space-y-14">
        {Object.entries(grouped).map(([category, list]) => (
          <div key={category}>
            <h2 className="font-display text-xl font-extrabold text-navy-900 border-b border-navy-900/10 pb-3">
              {category}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <div key={c.id} className="card-surface rounded-xl p-6 flex flex-col">
                  <h3 className="font-display font-bold text-navy-900">{c.name}</h3>
                  <p className="mt-2 text-sm text-navy-600 leading-relaxed flex-1">{c.description}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-navy-500">
                    <div>
                      <dt className="uppercase font-semibold tracking-wide">Duration</dt>
                      <dd>{c.duration}</dd>
                    </div>
                    <div>
                      <dt className="uppercase font-semibold tracking-wide">Intake</dt>
                      <dd>{c.intake || "Contact us"}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="uppercase font-semibold tracking-wide">Tuition</dt>
                      <dd className="font-display font-bold text-navy-900">${c.fee.toFixed(0)} / programme</dd>
                    </div>
                  </dl>
                  <Link
                    href={`/apply?course=${c.id}`}
                    className="mt-5 inline-block rounded-md bg-rust-500 px-4 py-2.5 text-center text-sm font-display font-bold text-white hover:bg-rust-400 transition-colors focus-ring"
                  >
                    Apply for this Programme
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
