import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";
import { Paynow } from "paynow";

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

  let body: { amount?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid payment request." },
      { status: 400 }
    );
  }

  const amount = Number(body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Enter a valid payment amount." },
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

  const integrationId = process.env.PAYNOW_INTEGRATION_ID;
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;

  if (!integrationId || !integrationKey) {
    return NextResponse.json(
      { error: "Paynow integration is not configured." },
      { status: 500 }
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const reference = `GIF-${student.studentNumber}-${Date.now()}`;

  const paynow = new Paynow(Number(integrationId), integrationKey);

  paynow.resultUrl = `${appUrl}/api/payments/paynow/result`;
  paynow.returnUrl = `${appUrl}/student/dashboard/tuition`;

  const payment = paynow.createPayment(reference, "");
  payment.add(
    `Gopher Institute - ${student.course.name}`,
    Number(amount.toFixed(2))
  );

  let response;

  try {
    response = await paynow.send(payment);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to Paynow." },
      { status: 502 }
    );
  }

  if (!response.success || !response.redirectUrl || !response.pollUrl) {
    return NextResponse.json(
      {
        error: response.error || "Unable to create Paynow payment.",
      },
      { status: 502 }
    );
  }

  const onlinePayment = await prisma.onlinePayment.create({
    data: {
      studentId: student.id,
      courseId: student.courseId,
      amount,
      paymentMethod: "Paynow",
      paymentReference: reference,
      pollUrl: response.pollUrl,
      status: "PENDING",
    },
  });

  return NextResponse.json({
    paymentId: onlinePayment.id,
    redirectUrl: response.redirectUrl,
    pollUrl: response.pollUrl,
    reference,
  });
}
