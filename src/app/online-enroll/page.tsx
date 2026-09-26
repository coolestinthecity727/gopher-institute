"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OnlineEnrollPage() {
  const router = useRouter();
  const params = useSearchParams();

  const courseId = params.get("course");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function enrollOnline() {
    if (!courseId) {
      setError("No course was selected.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        router.push(`/login?next=/online-enroll?course=${courseId}`);
        return;
      }

      setError(data.error || "Unable to enrol online.");
      setLoading(false);
      return;
    }

    router.push(`/student/dashboard/lessons/${courseId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="card-surface rounded-2xl p-8 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-rust-500">
          Online Learning
        </span>

        <h1 className="mt-2 font-display text-3xl font-extrabold text-navy-900">
          Enrol Online
        </h1>

        <p className="mt-4 text-sm leading-6 text-navy-600">
          Access your online lessons, complete quizzes and track your progress
          from your student dashboard.
        </p>

        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={enrollOnline}
          disabled={loading}
          className="mt-8 rounded-md bg-rust-500 px-8 py-3 font-display font-bold text-white hover:bg-rust-400 disabled:opacity-60 focus-ring"
        >
          {loading ? "Enrolling..." : "Continue to Online Learning"}
        </button>

        <p className="mt-4 text-xs text-navy-500">
          You will be asked to log in if you are not already signed in.
        </p>
      </div>
    </div>
  );
}
