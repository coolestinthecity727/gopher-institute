"use client";

import { useEffect, useState } from "react";

type Course = {
  id: string;
  name: string;
  category: string;
  duration: string;
  fee: number;
  intake: string | null;
  description: string;
  isActive: boolean;
};

const empty = { name: "", category: "", duration: "", fee: "", intake: "", description: "" };

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses(data.courses || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(c: Course) {
    setEditingId(c.id);
    setForm({ name: c.name, category: c.category, duration: c.duration, fee: String(c.fee), intake: c.intake || "", description: c.description });
    setShowForm(true);
  }

  function startNew() {
    setEditingId(null);
    setForm(empty);
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/courses/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setForm(empty);
    setEditingId(null);
    load();
  }

  async function toggleActive(c: Course) {
    await fetch(`/api/courses/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-navy-900">Programmes</h2>
        <button onClick={startNew} className="rounded-md bg-rust-500 text-white px-4 py-2 text-sm font-semibold hover:bg-rust-400">
          + Add Programme
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card-surface rounded-xl p-6 space-y-4">
          <h3 className="font-display font-bold text-navy-900">{editingId ? "Edit Programme" : "New Programme"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Category</label>
              <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Duration</label>
              <input required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 9 months" className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Tuition Fee (USD)</label>
              <input required type="number" min="0" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy-600 mb-1">Intake Schedule</label>
              <input value={form.intake} onChange={(e) => setForm({ ...form, intake: e.target.value })} placeholder="e.g. January & July" className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy-600 mb-1">Description</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-md bg-rust-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-rust-400">
              {editingId ? "Save Changes" : "Create Programme"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-md border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-700 hover:bg-navy-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card-surface rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-navy-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Programme</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Duration</th>
              <th className="text-left px-4 py-3">Fee</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-navy-500">Loading...</td></tr>}
            {courses.map((c) => (
              <tr key={c.id} className="border-t border-navy-900/5 hover:bg-navy-50/50">
                <td className="px-4 py-3 font-semibold text-navy-900">{c.name}</td>
                <td className="px-4 py-3 text-navy-700">{c.category}</td>
                <td className="px-4 py-3 text-navy-500">{c.duration}</td>
                <td className="px-4 py-3 text-navy-700">${c.fee.toFixed(0)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-navy-100 text-navy-500"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-3">
                  <button onClick={() => startEdit(c)} className="text-xs font-semibold text-rust-500 hover:text-rust-600">Edit</button>
                  <button onClick={() => toggleActive(c)} className="text-xs font-semibold text-navy-500 hover:text-navy-700">
                    {c.isActive ? "Deactivate" : "Activate"}
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
