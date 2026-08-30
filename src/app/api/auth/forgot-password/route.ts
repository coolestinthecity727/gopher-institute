import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { sendEmail, passwordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });

  // Always return the same success response whether or not the account exists,
  // so this endpoint can't be used to discover which emails are registered.
  if (user) {
    const token = nanoid(40);
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password — Gopher Institute Foundation",
      html: passwordResetEmail({ fullName: user.fullName, resetUrl }),
    });
  }

  return NextResponse.json({ ok: true });
}
