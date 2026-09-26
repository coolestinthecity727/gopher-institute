import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();

  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.userId },
    include: { course: true },
  });

  if (!student) {
    return NextResponse.json(
      { error: "No student record found." },
      { status: 404 }
    );
  }

  if (student.learningMode !== "ONLINE") {
    return NextResponse.json(
      { error: "This payment option is only available to online students." },
      { status: 403 }
    );
  }

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: student.courseId,
      },
    },
  });

  if (!enrollment) {
    return NextResponse.json(
      { error: "No online course enrollment found." },
      { status: 404 }
    );
  }

  const body = await req.json();

  const amount = Number(body.amount);
  const paymentMethod = String(body.paymentMethod || "").trim();
  const paymentReference = String(body.paymentReference || "").trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Enter a valid payment amount." },
      { status: 400 }
    );
  }

  if (!paymentMethod) {
    return NextResponse.json(
      { error: "Payment method is required." },
      { status: 400 }
    );
  }

  if (!paymentReference) {
    return NextResponse.json(
      { error: "Payment reference is required." },
      { status: 400 }
    );
  }

  const outstanding = Math.max(
    student.course.onlineFee - enrollment.amountPaid,
    0
  );

  if (outstanding <= 0) {
    return NextResponse.json(
      { error: "Your online tuition is already fully paid." },
      { status: 400 }
    );
  }

  if (amount > outstanding) {
    return NextResponse.json(
      {
        error: `Payment cannot exceed the outstanding balance of $${outstanding.toFixed(
          2
        )}.`,
      },
      { status: 400 }
    );
  }

  const payment = await prisma.onlinePayment.create({
    data: {
      studentId: student.id,
      courseId: student.courseId,
      amount,
      paymentMethod,
      paymentReference,
      status: "PENDING",
    },
  });

  return NextResponse.json(
    {
      payment: {
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentReference: payment.paymentReference,
        status: payment.status,
        submittedAt: payment.submittedAt,
      },
    },
    { status: 201 }
  );
}
