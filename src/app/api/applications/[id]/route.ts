import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies, isStaff } from "@/lib/auth";
import { generateStudentNumber } from "@/lib/ids";
import { sendEmail, applicationStatusEmail } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { status, reviewNotes } = body as { status?: string; reviewNotes?: string };

  const application = await prisma.application.findUnique({ where: { id: params.id } });
  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const updated = await prisma.application.update({
    where: { id: params.id },
    data: {
      ...(status ? { status: status as any } : {}),
      ...(reviewNotes !== undefined ? { reviewNotes } : {}),
      reviewedAt: new Date(),
    },
  });

  if (status && status !== application.status) {
    await sendEmail({
      to: application.email,
      subject: `Application Update — ${application.applicationNo}`,
      html: applicationStatusEmail({
        fullName: application.fullName,
        applicationNo: application.applicationNo,
        status,
      }),
    });
  }

  // Automatically create a Student record once an application is marked ENROLLED.
  if (status === "ENROLLED") {
    const existingStudent = await prisma.student.findUnique({ where: { applicationId: application.id } });
    if (!existingStudent) {
      await prisma.student.create({
        data: {
          studentNumber: generateStudentNumber(),
          applicationId: application.id,
          fullName: application.fullName,
          email: application.email,
          phone: application.phone,
          courseId: application.courseId,
          status: "CURRENT",
        },
      });
    }
  }

  return NextResponse.json({ application: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromCookies();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.application.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
