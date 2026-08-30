import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post || !post.published) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/events" className="text-sm font-semibold text-rust-500 hover:text-rust-600">← Back to News &amp; Events</Link>
      <span className="route-tag mt-6 inline-block bg-navy-100 text-navy-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
        {post.category}
      </span>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-navy-900">{post.title}</h1>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className="mt-6 w-full max-h-96 object-cover rounded-xl border border-navy-900/10" />
      )}
      {post.eventDate && (
        <p className="mt-2 text-sm font-semibold text-rust-500">
          {new Date(post.eventDate).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
          {post.location ? ` · ${post.location}` : ""}
        </p>
      )}
      <div className="mt-8 prose prose-navy max-w-none text-navy-700 leading-relaxed whitespace-pre-line">
        {post.content}
      </div>
    </article>
  );
}
