"use client";

import { useEffect, useState } from "react";

type Course = { id: string; name: string };
type Lesson = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string | null;
  documentUrl: string | null;
  sortOrder: number;
  published: boolean;
  course: { name: string };
};

const empty = { courseId: "", title: "", description: "", videoUrl: "", documentUrl: "", sortOrder: "0" };

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [filterCourse, setFilterCourse] = useState("");

  async function load() {
    setLoading(true);
    const [lessonRes, courseRes] = await Promise.all([
      fetch("/api/lessons"),
      fetch("/api/courses"),
    ]);
    const lessonData = await lessonRes.json();
    const courseData = await courseRes.json();
    setLessons(lessonData.lessons || []);
    setCourses(courseData.courses || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(l: Lesson) {
    setEditingId(l.id);
    setForm({
      courseId: l.courseId,
      title: l.title,
      description: l.description,
      videoUrl: l.videoUrl || "",
      documentUrl: l.documentUrl || "",
      sortOrder: String(l.sortOrder),
    });
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `/api/lessons/${editingId}` : "/api/lessons";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setEditingId(null);
    setForm(empty);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this lesson?")) return;
    await fetch(`/api/lessons/${id}`, { method: "DELETE" });
    load();
  }

  async function togglePublished(l: Lesson) {
    await fetch(`/api/lessons/${l.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !l.published }),
    });
    load();
  }

  const filtered = filterCourse ? lessons.filter((l) => l.courseId === filterCourse) : lessons;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-navy-900">Lessons</h2>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(empty); }} className="rounded-md bg-rust-500 text-white px-4 py-2 text-sm font-semibold hover:bg-rust-400">
          + Add Lesson
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-navy-600 mb-1">Filter by Programme</label>
        <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring">
          <option value="">All Programmes</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card-surface rounded-xl p-6 space-y-4">
          <h3 className="font-display font-bold text-navy-900">{editingId ? "Edit Lesson" : "New Lesson"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Programme</label>
              <select required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring">
                <option value="">Select a programme</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Lesson Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy-600 mb-1">Description</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Video URL (YouTube, Vimeo, etc.)</label>
              <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Document URL (notes/PDF)</label>
              <input value={form.documentUrl} onChange={(e) => setForm({ ...form, documentUrl: e.target.value })} placeholder="Paste a link, or upload via Photo Gallery's uploader and paste the URL" className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Order (lower shows first)</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-md bg-rust-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-rust-400">{editingId ? "Save Changes" : "Add Lesson"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-md border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-700 hover:bg-navy-50">Cancel</button>
          </div>
        </form>
      )}

      <div className="card-surface rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-navy-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Programme</th>
              <th className="text-left px-4 py-3">Video</th>
              <th className="text-left px-4 py-3">Document</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-navy-500">Loading...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-navy-500">No lessons yet.</td></tr>}
            {filtered.map((l) => (
              <tr key={l.id} className="border-t border-navy-900/5 hover:bg-navy-50/50">
                <td className="px-4 py-3 font-semibold text-navy-900">{l.title}</td>
                <td className="px-4 py-3 text-navy-700">{l.course.name}</td>
                <td className="px-4 py-3 text-navy-500">{l.videoUrl ? "Yes" : "-"}</td>
                <td className="px-4 py-3 text-navy-500">{l.documentUrl ? "Yes" : "-"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => togglePublished(l)} className={`rounded-full px-3 py-1 text-xs font-bold ${l.published ? "bg-emerald-100 text-emerald-800" : "bg-navy-100 text-navy-600"}`}>
                    {l.published ? "Published" : "Hidden"}
                  </button>
                </td>
                <td className="px-4 py-3 space-x-3">
                  <button onClick={() => startEdit(l)} className="text-xs font-semibold text-rust-500 hover:text-rust-600">Edit</button>
                  <button onClick={() => remove(l.id)} className="text-xs font-semibold text-red-500 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}