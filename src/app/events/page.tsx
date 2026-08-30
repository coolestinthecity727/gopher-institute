import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <section className="bg-navy-900 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-rust-400">Community</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold">News &amp; Events</h1>
          <p className="mt-3 max-w-2xl text-navy-200">
            Announcements, graduation ceremonies, open days and updates from Gopher Institute Foundation.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/events/${p.slug}`} className="card-surface rounded-xl overflow-hidden hover:border-rust-400 transition-colors">
              {p.imageUrl && <img src={p.imageUrl} alt="" className="h-40 w-full object-cover" />}
              <div className="p-6">
              <span className="route-tag inline-block bg-navy-100 text-navy-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
                {p.category}
              </span>
              {p.eventDate && (
                <p className="mt-3 text-xs font-semibold text-rust-500">
                  {new Date(p.eventDate).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
                  {p.location ? ` · ${p.location}` : ""}
                </p>
              )}
              <h2 className="mt-2 font-display font-bold text-navy-900 text-lg">{p.title}</h2>
              <p className="mt-2 text-sm text-navy-600 line-clamp-3">{p.summary}</p>
              </div>
            </Link>
          ))}
          {posts.length === 0 && <p className="text-navy-500">No posts published yet.</p>}
        </div>
      </section>
    </div>
  );
}
