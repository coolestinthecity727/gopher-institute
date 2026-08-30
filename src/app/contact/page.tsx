"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    if (res.ok) setSent(true);
    else setError("Something went wrong. Please try again.");
    setLoading(false);
  }

  return (
    <div>
      <section className="bg-navy-900 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-rust-400">Get in Touch</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Contact Us</h1>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
        {sent ? (
          <div className="card-surface rounded-2xl p-8 text-center">
            <p className="font-display font-bold text-xl text-navy-900">Message sent</p>
            <p className="mt-2 text-navy-600">Thank you — our team will respond to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-8 space-y-4">
            {error && <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-1">Name *</label>
                <input name="name" required className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-1">Email *</label>
                <input name="email" type="email" required className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-800 mb-1">Subject *</label>
              <input name="subject" required className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-800 mb-1">Message *</label>
              <textarea name="message" required rows={5} className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-rust-500 px-6 py-3 font-display font-bold text-white hover:bg-rust-400 disabled:opacity-60 focus-ring"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
