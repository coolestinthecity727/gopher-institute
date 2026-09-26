"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OnlineEnrollPage() {
  const router = useRouter();
  const params = useSearchParams();

  const courseId = params.get("course");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!courseId) {
      setError("No course was selected.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/online-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        password,
        courseId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Unable to create your online account.");
      setLoading(false);
      return;
    }

    router.push(`/student/dashboard/lessons/${courseId}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-rust-500">
          Online Learning
        </span>

        <h1 className="mt-2 font-display text-3xl font-extrabold text-navy-900">
          Create Your Online Student Account
        </h1>

        <p className="mt-3 text-sm leading-6 text-navy-600">
          Register once and start learning online immediately. Your account
          will be connected to the course you selected.
        </p>
      </div>

      <div className="card-surface rounded-2xl p-8">
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">
              Email Address
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring"
              placeholder="+263..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={8}
              className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">
              Confirm Password
            </label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              required
              minLength={8}
              className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring"
              placeholder="Enter your password again"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-rust-500 px-6 py-3 font-display font-bold text-white hover:bg-rust-400 disabled:opacity-60 focus-ring"
          >
            {loading ? "Creating Account..." : "Create Account & Start Learning"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-navy-500">
          Already have a Gopher account?{" "}
          <a
            href={`/login?next=/online-enroll?course=${courseId || ""}`}
            className="font-semibold text-rust-500 hover:text-rust-400"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
