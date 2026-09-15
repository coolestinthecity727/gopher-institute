"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EnrollButton({ courseId, isLoggedInStudent }: { courseId: string; isLoggedInStudent: boolean }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function enroll() {
    if (!isLoggedInStudent) {
      router.push(`/login?next=/courses/${courseId}`);
      return;
    }
    setLoading(true);
    await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    setLoading(false);
    setDone(true);
    router.push(`/student/dashboard/lessons/${courseId}`);
  }

  return (
    <button
      onClick={enroll}
      disabled={loading || done}
      className="mt-4 inline-block rounded-md border-2 border-white px-6 py-3 font-display font-bold text-white hover:bg-white hover:text-navy-900 transition-colors disabled:opacity-60"
    >
      {loading ? "Enrolling..." : done ? "Enrolled ✓" : "Enroll Free & Start Learning"}
    </button>
  );
}