import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Paynow } from "paynow";

export async function POST(req: NextRequest) {
  const rawCallback = await req.text();

  const integrationId = Number(process.env.PAYNOW_INTEGRATION_ID);
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;

  if (!integrationId || !integrationKey) {
    return NextResponse.json(
      { error: "Paynow integration is not configured." },
      { status: 500 }
    );
  }

  const paynow = new Paynow(integrationId, integrationKey);

  let verifiedCallback;

  try {
    verifiedCallback = paynow.parseStatusUpdate(rawCallback);
  } catch {
    return NextResponse.json(
      { error: "Invalid Paynow callback." },
      { status: 400 }
    );
  }

  const reference = String(verifiedCallback.reference || "").trim();


  if (!reference) {
    return NextResponse.json(
      { error: "Payment reference is missing." },
      { status: 400 }
    );
  }

  const payment = await prisma.onlinePayment.findFirst({
    where: {
      paymentReference: reference,
    },
  });

  if (!payment) {
    return NextResponse.json(
      { error: "Payment record not found." },
      { status: 404 }
    );
  }

  if (!payment.pollUrl) {
    return NextResponse.json(
      { error: "Paynow polling URL is missing." },
      { status: 400 }
    );
  }

  const callbackAmount = Number(verifiedCallback.amount);

  if (!Number.isFinite(callbackAmount) || Math.abs(callbackAmount - payment.amount) > 0.01) {
    return NextResponse.json(
      { error: "Paynow payment amount does not match." },
      { status: 400 }
    );
  }

  let polledPayment;

  try {
    polledPayment = await paynow.pollTransaction(String(payment.pollUrl));
  } catch {
    return NextResponse.json(
      { error: "Unable to verify Paynow payment status." },
      { status: 502 }
    );
  }

  const polledStatus = String(polledPayment.status || "").trim().toLowerCase();

  if (polledStatus === "paid") {
    await prisma.$transaction(async (tx) => {
      const currentPayment = await tx.onlinePayment.findUnique({
        where: { id: payment.id },
      });

      if (!currentPayment || currentPayment.status === "VERIFIED") {
        return;
      }

      const enrollment = await tx.courseEnrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: payment.studentId,
            courseId: payment.courseId,
          },
        },
      });

      if (!enrollment) {
        return;
      }

      const course = await tx.course.findUnique({
        where: { id: payment.courseId },
      });

      if (!course) {
        return;
      }

      const newAmountPaid = enrollment.amountPaid + payment.amount;
      const fullyPaid = newAmountPaid >= course.onlineFee;

      await tx.onlinePayment.update({
        where: { id: payment.id },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
        },
      });

      await tx.courseEnrollment.update({
        where: { id: enrollment.id },
        data: {
          amountPaid: newAmountPaid,
          paymentStatus: fullyPaid ? "PAID" : "PARTIAL",
          paidAt: fullyPaid ? new Date() : enrollment.paidAt,
        },
      });
    });
  }

  return NextResponse.json({ ok: true });
}












