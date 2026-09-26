import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const reference = String(formData.get("reference") || "").trim();
  const status = String(formData.get("status") || "").trim();

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

  if (status.toLowerCase() === "paid") {
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
