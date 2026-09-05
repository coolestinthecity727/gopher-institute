import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";

export async function GET() {
  const partners = await prisma.partner.findMany({ orderBy: [{ isMinistry: "desc" }, { createdAt: "asc" }] });
  return NextResponse.json({ partners });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { name, description, logoUrl, website, isMinistry } = body;
  if (!name || !description) {
    return NextResponse.json({ error: "Name and description are required." }, { status: 400 });
  }
  const partner = await prisma.partner.create({
    data: { name, description, logoUrl: logoUrl || null, website: website || null, isMinistry: !!isMinistry },
  });
  return NextResponse.json({ partner }, { status: 201 });
}