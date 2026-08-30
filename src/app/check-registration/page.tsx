"use client";

import { useState } from "react";

const STATUS_LABEL: Record<string, string> = {
  CURRENT: "Currently Enrolled",
  ALUMNI: "Graduated (Alumni)",
  SUSPENDED: "Suspended",
  WITHDRAWN: "Withdrawn",
  PENDING: "Application Pending Review",
  UNDER_REVIEW: "Application Under Review",
  ACCEPTED: "Application Accepted",
  REJECTED: "Application Not Successful",
  ENROLLED: "Enrolled",
};

export default function CheckRegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSearched(false);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/students/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference: form.get("reference"),
        nationalId: form.get("nationalId"),
      }),
    });
    const data = await res.json();
    setResult(data);
    setSearched(true);
    setLoading(false);
  }

  return (
    <div>
      <section className="bg-navy-900 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-rust-400">Registration Check</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Check Registration Status</h1>
          <p className="mt-3 max-w-2xl text-navy-200">
            Current students, alumni and applicants can confirm their registration status using their student
            number or application number.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">Student Number or Application Number *</label>
            <input
              name="reference"
              required
              placeholder="e.g. GIF-2024-0001 or GIF-APP-2026-00123"
              className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">National ID (for application lookups)</label>
            <input
              name="nationalId"
              placeholder="Only required when checking an application number"
              className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-rust-500 px-6 py-3 font-display font-bold text-white hover:bg-rust-400 disabled:opacity-60 focus-ring"
          >
            {loading ? "Checking..." : "Check Status"}
          </button>
        </form>

        {searched && result && (
          <div className="mt-6">
            {result.found ? (
              <div className="rounded-2xl border-2 border-navy-700 bg-white p-6 card-surface">
                <p className="route-tag inline-block bg-rust-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
                  {STATUS_LABEL[result.record.status] || result.record.status}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-navy-500">Name</dt><dd className="font-semibold text-navy-900">{result.record.fullName}</dd></div>
                  <div>
                    <dt className="text-navy-500">Reference</dt>
                    <dd className="font-semibold text-navy-900">{result.record.studentNumber || result.record.applicationNo}</dd>
                  </div>
                  <div><dt className="text-navy-500">Programme</dt><dd className="font-semibold text-navy-900">{result.record.course}</dd></div>
                  {result.record.enrollmentDate && (
                    <div><dt className="text-navy-500">Enrolled</dt><dd className="font-semibold text-navy-900">{new Date(result.record.enrollmentDate).toLocaleDateString()}</dd></div>
                  )}
                  {result.record.graduationDate && (
                    <div><dt className="text-navy-500">Graduated</dt><dd className="font-semibold text-navy-900">{new Date(result.record.graduationDate).toLocaleDateString()}</dd></div>
                  )}
                  {result.record.submittedAt && (
                    <div><dt className="text-navy-500">Submitted</dt><dd className="font-semibold text-navy-900">{new Date(result.record.submittedAt).toLocaleDateString()}</dd></div>
                  )}
                </dl>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-6">
                <p className="font-display font-bold text-red-700">No record found</p>
                <p className="mt-1 text-sm text-red-600">{result.message}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
