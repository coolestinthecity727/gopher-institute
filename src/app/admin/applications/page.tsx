"use client";

import { Fragment, useEffect, useState } from "react";

type Application = {
  id: string;
  applicationNo: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  submittedAt: string;
  course: { name: string };
  reviewNotes?: string | null;
  idDocumentUrl?: string | null;
  transcriptUrl?: string | null;
};

const STATUSES = ["PENDING", "UNDER_REVIEW", "ACCEPTED", "REJECTED", "ENROLLED"];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  ENROLLED: "bg-navy-700 text-white",
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (q) params.set("q", q);
    const res = await fetch(`/api/applications?${params.toString()}`);
    const data = await res.json();
    setApplications(data.applications || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function saveNotes(id: string, reviewNotes: string) {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewNotes }),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-navy-900">Applications</h2>
        <div className="flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search name, email, ref no..."
            className="rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={load} className="rounded-md bg-navy-800 text-white px-4 py-2 text-sm font-semibold hover:bg-navy-700">Search</button>
        </div>
      </div>

      <div className="card-surface rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-navy-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Applicant</th>
              <th className="text-left px-4 py-3">Programme</th>
              <th className="text-left px-4 py-3">Submitted</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-navy-500">Loading...</td></tr>
            )}
            {!loading && applications.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-navy-500">No applications found.</td></tr>
            )}
            {applications.map((a) => (
              <Fragment key={a.id}>
                <tr className="border-t border-navy-900/5 hover:bg-navy-50/50 cursor-pointer" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy-900">{a.fullName}</p>
                    <p className="text-xs text-navy-500">{a.applicationNo} · {a.email}</p>
                  </td>
                  <td className="px-4 py-3 text-navy-700">{a.course.name}</td>
                  <td className="px-4 py-3 text-navy-500">{new Date(a.submittedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                      className="rounded-md border border-navy-900/15 px-2 py-1.5 text-xs focus-ring"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
                {expanded === a.id && (
                  <tr className="bg-navy-50/30 border-t border-navy-900/5">
                    <td colSpan={5} className="px-4 py-4">
                      <p className="text-xs font-semibold text-navy-500 mb-1">Reviewer Notes</p>
                      <textarea
                        defaultValue={a.reviewNotes || ""}
                        onBlur={(e) => saveNotes(a.id, e.target.value)}
                        placeholder="Internal notes about this applicant..."
                        rows={2}
                        className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring"
                      />
                      <p className="mt-2 text-xs text-navy-500">Phone: {a.phone}</p>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {a.idDocumentUrl ? (
                          <a href={a.idDocumentUrl} target="_blank" className="text-xs font-semibold text-rust-500 hover:text-rust-600">
                            View ID Document →
                          </a>
                        ) : (
                          <span className="text-xs text-navy-400">No ID document uploaded</span>
                        )}
                        {a.transcriptUrl && (
                          <a href={a.transcriptUrl} target="_blank" className="text-xs font-semibold text-rust-500 hover:text-rust-600">
                            View Transcript →
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
