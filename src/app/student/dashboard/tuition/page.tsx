import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";
import OnlinePaymentForm from "./OnlinePaymentForm";

export default async function TuitionPage() {
  const session = getSessionFromCookies();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.userId },
    include: {
      course: true,
    },
  });

  if (!student) {
    redirect("/student/dashboard");
  }

  if (student.learningMode !== "ONLINE") {
    redirect("/student/dashboard");
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
    redirect("/student/dashboard");
  }

  const tuition = student.course.onlineFee;
  const amountPaid = enrollment.amountPaid;
  const outstanding = Math.max(tuition - amountPaid, 0);

  return (
    <main className="min-h-screen bg-navy-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <a
            href="/student/dashboard"
            className="text-sm font-semibold text-navy-700 hover:underline"
          >
            ← Back to Dashboard
          </a>
        </div>

        <div className="card-surface rounded-2xl p-6">
          <h1 className="font-display text-2xl font-bold text-navy-900">
            Online Tuition
          </h1>

          <p className="mt-2 text-sm text-navy-600">
            Manage your tuition for your Gopher Institute online programme.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-navy-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                Programme
              </p>
              <p className="mt-2 font-bold text-navy-900">
                {student.course.name}
              </p>
            </div>

            <div className="rounded-xl border border-navy-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                Total Tuition
              </p>
              <p className="mt-2 text-xl font-bold text-navy-900">
                ${tuition.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl border border-navy-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                Outstanding
              </p>
              <p className="mt-2 text-xl font-bold text-navy-900">
                ${outstanding.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-navy-50 p-5">
            <p className="text-sm text-navy-600">Payment Status</p>
            <p className="mt-1 text-lg font-bold text-navy-900">
              {enrollment.paymentStatus}
            </p>

            <p className="mt-3 text-sm text-navy-600">
              Amount paid: ${amountPaid.toFixed(2)}
            </p>
          </div>

          <div className="mt-6 border-t border-navy-100 pt-6">
            <h2 className="font-display text-lg font-bold text-navy-900">
              Tuition Payment
            </h2>

            <p className="mt-2 text-sm leading-6 text-navy-600">
              Payment instructions and payment verification will appear here.
              Your official online certificate will only become available after
              your tuition payment has been verified.
            </p>

            {outstanding > 0 ? (
              <div>
                <OnlinePaymentForm outstanding={outstanding} />

                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">
                    Tuition Outstanding
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    ${outstanding.toFixed(2)} remains outstanding.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-semibold text-green-900">
                  Tuition Paid
                </p>
                <p className="mt-1 text-sm text-green-800">
                  Your tuition balance has been fully paid.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
