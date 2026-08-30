import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

// Applicants aren't logged in yet when they submit the application form, so this endpoint
// is intentionally public — unlike /api/upload (staff-only, used for site content images).
// It's kept narrow on purpose: only PDF/JPG/PNG, small size cap, random filenames, and it
// only ever writes into public/uploads/documents (never overwrites, never executes anything).
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Please upload a PDF, JPG, PNG or WEBP file." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large. Maximum size is 5MB." }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "documents");
  await mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : `.${file.type.split("/")[1]}`);
  const filename = `${nanoid(16)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/documents/${filename}` }, { status: 201 });
}
