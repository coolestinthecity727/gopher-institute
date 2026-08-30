import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { certificateNo, verificationCode } = await req.json();

  if (!certificateNo) {
    return NextResponse.json({ error: "Enter a certificate number." }, { status: 400 });
  }

  const certificate = await prisma.certificate.findUnique({
    where: { certificateNo: certificateNo.trim() },
    include: { student: { include: { course: true } } },
  });

  if (!certificate || (verificationCode && certificate.verificationCode !== verificationCode.trim())) {
    return NextResponse.json({ valid: false, message: "No matching certificate was found for these details." });
  }

  if (certificate.isRevoked) {
    return NextResponse.json({
      valid: false,
      message: "This certificate has been revoked and is no longer valid.",
    });
  }

  return NextResponse.json({
    valid: true,
    certificate: {
      certificateNo: certificate.certificateNo,
      studentName: certificate.student.fullName,
      courseName: certificate.courseName,
      grade: certificate.grade,
      issueDate: certificate.issueDate,
      studentNumber: certificate.student.studentNumber,
    },
  });
}
