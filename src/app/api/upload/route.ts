import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { getSessionFromCookies, isStaff } from "@/lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// NOTE: this stores files on local disk under /public/uploads, which works well on any
// host with a persistent filesystem (Railway, Render, a VPS, Docker). On ephemeral/serverless
// hosting (e.g. Vercel's default deployment), disk writes don't persist between requests —
// swap this handler for a hosted storage provider such as Vercel Blob, S3, or Cloudinary
// instead. The response shape (`{ url }`) is designed to stay the same either way.
export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Please upload a JPG, PNG, WEBP, GIF or SVG image." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large. Maximum size is 5MB." }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`;
  const filename = `${nanoid(12)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
