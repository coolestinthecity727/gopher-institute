import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { title, category, summary, content, imageUrl, eventDate, location, published } = body;

  if (!title || !summary || !content || !category) {
    return NextResponse.json({ error: "Title, category, summary and content are required." }, { status: 400 });
  }

  let slug = slugify(title);
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      category,
      summary,
      content,
      imageUrl: imageUrl || null,
      eventDate: eventDate ? new Date(eventDate) : null,
      location: location || null,
      published: published ?? true,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}