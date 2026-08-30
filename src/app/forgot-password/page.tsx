"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-rust-500">Account Access</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-navy-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-navy-600">Enter your account email and we'll send you a reset link.</p>
      </div>

      <div className="card-surface rounded-2xl p-8">
        {sent ? (
          <div className="text-center">
            <p className="font-display font-bold text-navy-900">Check your email</p>
            <p className="mt-2 text-sm text-navy-600">
              If an account exists for that email, a password reset link is on its way. The link expires in 1 hour.
            </p>
            <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-rust-500 hover:text-rust-600">
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy-800 mb-1">Email</label>
              <input name="email" type="email" required className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring" />
            </div>
            <button disabled={loading} className="w-full rounded-md bg-rust-500 px-6 py-3 font-display font-bold text-white hover:bg-rust-400 disabled:opacity-60 focus-ring">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <p className="text-center">
              <Link href="/login" className="text-xs font-semibold text-navy-500 hover:text-rust-500">← Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
