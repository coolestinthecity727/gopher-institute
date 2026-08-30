"use client";

import { useEffect, useState } from "react";
import ImageUploadField from "@/components/ImageUploadField";

type Post = {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  eventDate: string | null;
  location: string | null;
  published: boolean;
};

const empty = { title: "", category: "NEWS", summary: "", content: "", imageUrl: "", eventDate: "", location: "" };

export default function AdminEventsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/events");
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(p: Post) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      category: p.category,
      summary: p.summary,
      content: p.content,
      imageUrl: p.imageUrl || "",
      eventDate: p.eventDate ? p.eventDate.slice(0, 10) : "",
      location: p.location || "",
    });
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, eventDate: form.eventDate || null };
    if (editingId) {
      await fetch(`/api/events/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setShowForm(false);
    setForm(empty);
    setEditingId(null);
    load();
  }

  async function togglePublished(p: Post) {
    await fetch(`/api/events/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !p.published }) });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-navy-900">News &amp; Events</h2>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(empty); }} className="rounded-md bg-rust-500 text-white px-4 py-2 text-sm font-semibold hover:bg-rust-400">
          + New Post
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card-surface rounded-xl p-6 space-y-4">
          <h3 className="font-display font-bold text-navy-900">{editingId ? "Edit Post" : "New Post"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy-600 mb-1">Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring">
                <option value="NEWS">News</option>
                <option value="EVENT">Event</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Event Date (if applicable)</label>
              <input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy-600 mb-1">Location (if applicable)</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy-600 mb-1">Summary</label>
              <input required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy-600 mb-1">Full Content</label>
              <textarea required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div className="sm:col-span-2">
              <ImageUploadField label="Cover Image" value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-md bg-rust-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-rust-400">{editingId ? "Save Changes" : "Publish Post"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-700 hover:bg-navy-50">Cancel</button>
          </div>
        </form>
      )}

      <div className="card-surface rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-navy-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3"></th>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-4 py-6 text-center text-navy-500">Loading...</td></tr>}
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-navy-900/5 hover:bg-navy-50/50">
                <td className="px-4 py-3">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" className="h-9 w-9 rounded object-cover" />
                  ) : (
                    <div className="h-9 w-9 rounded bg-navy-50" />
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-navy-900">{p.title}</td>
                <td className="px-4 py-3 text-navy-700">{p.category}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.published ? "bg-emerald-100 text-emerald-800" : "bg-navy-100 text-navy-500"}`}>
                    {p.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-3">
                  <button onClick={() => startEdit(p)} className="text-xs font-semibold text-rust-500 hover:text-rust-600">Edit</button>
                  <button onClick={() => togglePublished(p)} className="text-xs font-semibold text-navy-500 hover:text-navy-700">{p.published ? "Unpublish" : "Publish"}</button>
                  <button onClick={() => remove(p.id)} className="text-xs font-semibold text-red-500 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
