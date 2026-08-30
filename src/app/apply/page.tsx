import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ApplyForm from "./ApplyForm";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, category: true },
  });

  return (
    <div>
      <section className="bg-navy-900 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-rust-400">Online Application</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Apply to Gopher Institute Foundation</h1>
          <p className="mt-3 max-w-2xl text-navy-200">
            Complete the form below to apply for any of our accredited programmes. You'll receive a reference
            number to track your application status.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Suspense>
          <ApplyForm courses={courses} />
        </Suspense>
      </section>
    </div>
  );
}
