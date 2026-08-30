"use client";

import { useState } from "react";

export default function VerifyCertificatePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSearched(false);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/certificates/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        certificateNo: form.get("certificateNo"),
        verificationCode: form.get("verificationCode"),
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
          <span className="text-xs font-bold uppercase tracking-wider text-rust-400">Certificate Authentication</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Verify a Certificate</h1>
          <p className="mt-3 max-w-2xl text-navy-200">
            Employers and institutions can confirm that a Gopher Institute Foundation certificate is genuine using
            the certificate number printed on the document.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">Certificate Number *</label>
            <input
              name="certificateNo"
              required
              placeholder="e.g. GIF-CERT-2024-0001"
              className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">Verification Code (optional)</label>
            <input
              name="verificationCode"
              placeholder="10-character code printed on the certificate"
              className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-rust-500 px-6 py-3 font-display font-bold text-white hover:bg-rust-400 disabled:opacity-60 focus-ring"
          >
            {loading ? "Checking..." : "Verify Certificate"}
          </button>
        </form>

        {searched && result && (
          <div className="mt-6">
            {result.valid ? (
              <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6">
                <p className="font-display font-bold text-emerald-700">✓ Certificate is authentic</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-navy-500">Student</dt><dd className="font-semibold text-navy-900">{result.certificate.studentName}</dd></div>
                  <div><dt className="text-navy-500">Student No.</dt><dd className="font-semibold text-navy-900">{result.certificate.studentNumber}</dd></div>
                  <div><dt className="text-navy-500">Programme</dt><dd className="font-semibold text-navy-900">{result.certificate.courseName}</dd></div>
                  <div><dt className="text-navy-500">Grade</dt><dd className="font-semibold text-navy-900">{result.certificate.grade || "—"}</dd></div>
                  <div><dt className="text-navy-500">Certificate No.</dt><dd className="font-semibold text-navy-900">{result.certificate.certificateNo}</dd></div>
                  <div><dt className="text-navy-500">Issue Date</dt><dd className="font-semibold text-navy-900">{new Date(result.certificate.issueDate).toLocaleDateString()}</dd></div>
                </dl>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-6">
                <p className="font-display font-bold text-red-700">✕ Not verified</p>
                <p className="mt-1 text-sm text-red-600">{result.message}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
