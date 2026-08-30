"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  studentNumber: string;
  fullName: string;
  email: string;
  status: string;
  course: { name: string };
  certificates: { id: string }[];
  enrollmentDate: string;
  graduationDate?: string | null;
};

const STATUSES = ["CURRENT", "ALUMNI", "SUSPENDED", "WITHDRAWN"];
const STATUS_COLORS: Record<string, string> = {
  CURRENT: "bg-emerald-100 text-emerald-800",
  ALUMNI: "bg-navy-700 text-white",
  SUSPENDED: "bg-amber-100 text-amber-800",
  WITHDRAWN: "bg-red-100 text-red-800",
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (q) params.set("q", q);
    const res = await fetch(`/api/students?${params.toString()}`);
    const data = await res.json();
    setStudents(data.students || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(status === "ALUMNI" ? { graduationDate: new Date().toISOString() } : {}) }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-navy-900">Students (Current &amp; Past)</h2>
        <div className="flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search name, student no, email..."
            className="rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring">
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={load} className="rounded-md bg-navy-800 text-white px-4 py-2 text-sm font-semibold hover:bg-navy-700">Search</button>
        </div>
      </div>

      <div className="card-surface rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-navy-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Student</th>
              <th className="text-left px-4 py-3">Programme</th>
              <th className="text-left px-4 py-3">Enrolled</th>
              <th className="text-left px-4 py-3">Certificates</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Change Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-navy-500">Loading...</td></tr>}
            {!loading && students.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-navy-500">No students found.</td></tr>}
            {students.map((s) => (
              <tr key={s.id} className="border-t border-navy-900/5 hover:bg-navy-50/50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-navy-900">{s.fullName}</p>
                  <p className="text-xs text-navy-500">{s.studentNumber} · {s.email}</p>
                </td>
                <td className="px-4 py-3 text-navy-700">{s.course.name}</td>
                <td className="px-4 py-3 text-navy-500">{new Date(s.enrollmentDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-navy-700">{s.certificates.length}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={s.status}
                    onChange={(e) => updateStatus(s.id, e.target.value)}
                    className="rounded-md border border-navy-900/15 px-2 py-1.5 text-xs focus-ring"
                  >
                    {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
