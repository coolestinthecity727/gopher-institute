import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
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

  return (
    <div>
      <section className="bg-navy-900 text-white py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-rust-400">Community</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Learning Leaderboard</h1>
          <p className="mt-3 max-w-2xl text-navy-200">
            Top learners ranked by lessons completed across all online courses.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        {ranked.length === 0 ? (
          <p className="text-navy-500">No one has completed a lesson yet — be the first!</p>
        ) : (
          <div className="card-surface rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-navy-50 text-navy-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Rank</th>
                  <th className="text-left px-4 py-3">Student</th>
                  <th className="text-left px-4 py-3">Lessons Completed</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((s, i) => (
                  <tr key={i} className="border-t border-navy-900/5">
                    <td className="px-4 py-3 font-display font-extrabold text-navy-900">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy-800">{s.displayName}</td>
                    <td className="px-4 py-3 text-navy-600">{s.lessonsCompleted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}