"use client";

import { useEffect, useState } from "react";

type Certificate = {
  id: string;
  certificateNo: string;
  verificationCode: string;
  courseName: string;
  grade: string | null;
  issueDate: string;
  isRevoked: boolean;
  student: { fullName: string; studentNumber: string };
};

type Student = { id: string; fullName: string; studentNumber: string; course: { name: string } };

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [grade, setGrade] = useState("");

  async function load() {
    setLoading(true);
    const [certRes, studentRes] = await Promise.all([
      fetch("/api/certificates"),
      fetch("/api/students"),
    ]);
    const certData = await certRes.json();
    const studentData = await studentRes.json();
    setCertificates(certData.certificates || []);
    setStudents(studentData.students || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function issue(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) return;
    await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, grade }),
    });
    setShowForm(false);
    setStudentId("");
    setGrade("");
    load();
  }

  async function toggleRevoke(c: Certificate) {
    await fetch(`/api/certificates/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRevoked: !c.isRevoked }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-navy-900">Certificates</h2>
        <button onClick={() => setShowForm(!showForm)} className="rounded-md bg-rust-500 text-white px-4 py-2 text-sm font-semibold hover:bg-rust-400">
          + Issue Certificate
        </button>
      </div>

      {showForm && (
        <form onSubmit={issue} className="card-surface rounded-xl p-6 space-y-4">
          <h3 className="font-display font-bold text-navy-900">Issue New Certificate</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Student</label>
              <select required value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring">
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName} — {s.studentNumber} ({s.course.name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Grade / Result (optional)</label>
              <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. Distinction, Merit, Pass" className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
          </div>
          <p className="text-xs text-navy-500">Issuing a certificate automatically marks the student as an Alumnus.</p>
          <div className="flex gap-3">
            <button type="submit" className="rounded-md bg-rust-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-rust-400">Issue Certificate</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-700 hover:bg-navy-50">Cancel</button>
          </div>
        </form>
      )}

      <div className="card-surface rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-navy-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Certificate No.</th>
              <th className="text-left px-4 py-3">Student</th>
              <th className="text-left px-4 py-3">Programme</th>
              <th className="text-left px-4 py-3">Grade</th>
              <th className="text-left px-4 py-3">Issued</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-6 text-center text-navy-500">Loading...</td></tr>}
            {!loading && certificates.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-navy-500">No certificates issued yet.</td></tr>}
            {certificates.map((c) => (
              <tr key={c.id} className="border-t border-navy-900/5 hover:bg-navy-50/50">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-navy-900">{c.certificateNo}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-navy-900">{c.student.fullName}</p>
                  <p className="text-xs text-navy-500">{c.student.studentNumber}</p>
                </td>
                <td className="px-4 py-3 text-navy-700">{c.courseName}</td>
                <td className="px-4 py-3 text-navy-700">{c.grade || "—"}</td>
                <td className="px-4 py-3 text-navy-500">{new Date(c.issueDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${c.isRevoked ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {c.isRevoked ? "Revoked" : "Valid"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleRevoke(c)} className="text-xs font-semibold text-rust-500 hover:text-rust-600">
                    {c.isRevoked ? "Restore" : "Revoke"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
