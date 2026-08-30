"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-rust-500">Account Access</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-navy-900">Login</h1>
        <p className="mt-2 text-sm text-navy-600">Students, registrars and administrators sign in here.</p>
      </div>
      <LoginPanels />
    </div>
  );
}

function LoginPanels() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const router = useRouter();
  const params = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed.");
      return;
    }
    const next = params.get("next");
    if (next) router.push(next);
    else if (data.role === "STUDENT") router.push("/student/dashboard");
    else router.push("/admin");
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed.");
      return;
    }
    router.push("/student/dashboard");
    router.refresh();
  }

  return (
    <div className="card-surface rounded-2xl p-8">
      <div className="flex rounded-md bg-navy-50 p-1 mb-6 text-sm font-semibold">
        <button
          onClick={() => setTab("login")}
          className={`flex-1 rounded py-2 transition-colors ${tab === "login" ? "bg-white shadow text-navy-900" : "text-navy-500"}`}
        >
          Log In
        </button>
        <button
          onClick={() => setTab("register")}
          className={`flex-1 rounded py-2 transition-colors ${tab === "register" ? "bg-white shadow text-navy-900" : "text-navy-500"}`}
        >
          Create Student Account
        </button>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">Email</label>
            <input name="email" type="email" required className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">Password</label>
            <input name="password" type="password" required className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring" />
          </div>
          <button disabled={loading} className="w-full rounded-md bg-rust-500 px-6 py-3 font-display font-bold text-white hover:bg-rust-400 disabled:opacity-60 focus-ring">
            {loading ? "Signing in..." : "Log In"}
          </button>
          <p className="text-center">
            <a href="/forgot-password" className="text-xs font-semibold text-navy-500 hover:text-rust-500">Forgot your password?</a>
          </p>
          <p className="text-xs text-navy-500 text-center">Admin/staff use the same login form as students.</p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <p className="text-xs text-navy-500">
            Available once your application has been accepted and enrolled — use the student number issued to
            you via the Check Registration portal.
          </p>
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">Student Number</label>
            <input name="studentNumber" required placeholder="e.g. GIF-2024-0001" className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">Email on Record</label>
            <input name="email" type="email" required className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">Choose a Password</label>
            <input name="password" type="password" required minLength={8} className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring" />
          </div>
          <button disabled={loading} className="w-full rounded-md bg-rust-500 px-6 py-3 font-display font-bold text-white hover:bg-rust-400 disabled:opacity-60 focus-ring">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}
    </div>
  );
}
