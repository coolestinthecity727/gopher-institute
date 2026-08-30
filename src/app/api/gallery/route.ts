import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";

export async function GET() {
  const images = await prisma.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ images });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { imageUrl, caption, category } = await req.json();
  if (!imageUrl || !caption) {
    return NextResponse.json({ error: "An image and caption are required." }, { status: 400 });
  }
  const image = await prisma.galleryImage.create({
    data: { imageUrl, caption, category: category || "Campus Life" },
  });
  return NextResponse.json({ image }, { status: 201 });
}
