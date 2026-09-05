import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";
import { generateCertificateNo, generateVerificationCode } from "@/lib/ids";
import { sendEmail, certificateIssuedEmail } from "@/lib/email";

export async function GET() {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const certificates = await prisma.certificate.findMany({
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ certificates });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { studentId, grade } = await req.json();
  if (!studentId) return NextResponse.json({ error: "Select a student." }, { status: 400 });

  const student = await prisma.student.findUnique({ where: { id: studentId }, include: { course: true } });
  if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });

  const certificate = await prisma.certificate.create({
    data: {
      certificateNo: generateCertificateNo(),
      verificationCode: generateVerificationCode(),
      studentId: student.id,
      courseName: student.course.name,
      grade: grade || null,
    },
  });

  if (student.status !== "ALUMNI") {
    await prisma.student.update({
      where: { id: student.id },
      data: { status: "ALUMNI", graduationDate: student.graduationDate || new Date() },
    });
  }

  await sendEmail({
    to: student.email,
    subject: `Certificate Issued — ${certificate.certificateNo}`,
    html: certificateIssuedEmail({
      fullName: student.fullName,
      certificateNo: certificate.certificateNo,
      courseName: certificate.courseName,
      verificationCode: certificate.verificationCode,
    }),
  });

  return NextResponse.json({ certificate }, { status: 201 });
}