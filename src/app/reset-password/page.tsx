"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 text-center">
        <h1 className="font-display text-2xl font-extrabold text-navy-900">Invalid Link</h1>
        <p className="mt-2 text-navy-600">This reset link is missing its token.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm font-semibold text-rust-500 hover:text-rust-600">
          Request a new reset link →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-rust-500">Account Access</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-navy-900">Set a New Password</h1>
      </div>

      <div className="card-surface rounded-2xl p-8">
        {done ? (
          <div className="text-center">
            <p className="font-display font-bold text-navy-900">Password updated</p>
            <p className="mt-2 text-sm text-navy-600">Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div>
              <label className="block text-sm font-semibold text-navy-800 mb-1">New Password</label>
              <input name="password" type="password" required minLength={8} className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-800 mb-1">Confirm New Password</label>
              <input name="confirm" type="password" required minLength={8} className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring" />
            </div>
            <button disabled={loading} className="w-full rounded-md bg-rust-500 px-6 py-3 font-display font-bold text-white hover:bg-rust-400 disabled:opacity-60 focus-ring">
              {loading ? "Saving..." : "Set New Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
