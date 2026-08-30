import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { reference, nationalId } = await req.json();
  if (!reference) {
    return NextResponse.json({ error: "Enter a student number or application number." }, { status: 400 });
  }
  const ref = String(reference).trim();

  // Try as a student number first (current or past students).
  const student = await prisma.student.findUnique({
    where: { studentNumber: ref },
    include: { course: true },
  });

  if (student) {
    return NextResponse.json({
      found: true,
      type: "student",
      record: {
        studentNumber: student.studentNumber,
        fullName: student.fullName,
        course: student.course.name,
        status: student.status,
        enrollmentDate: student.enrollmentDate,
        graduationDate: student.graduationDate,
      },
    });
  }

  // Fall back to application number, for applicants awaiting a decision.
  const application = await prisma.application.findUnique({
    where: { applicationNo: ref },
    include: { course: true },
  });

  if (application) {
    if (nationalId && application.nationalId !== String(nationalId).trim()) {
      return NextResponse.json({ found: false, message: "No matching record found for these details." });
    }
    return NextResponse.json({
      found: true,
      type: "application",
      record: {
        applicationNo: application.applicationNo,
        fullName: application.fullName,
        course: application.course.name,
        status: application.status,
        submittedAt: application.submittedAt,
      },
    });
  }

  return NextResponse.json({ found: false, message: "No matching record found for these details." });
}
