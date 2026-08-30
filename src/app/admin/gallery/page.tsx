"use client";

import { useEffect, useState } from "react";
import ImageUploadField from "@/components/ImageUploadField";

type GalleryImage = {
  id: string;
  imageUrl: string;
  caption: string;
  category: string;
};

const CATEGORIES = ["Campus Life", "Workshops", "Graduation", "Events"];
const empty = { imageUrl: "", caption: "", category: "Campus Life" };

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/gallery");
    const data = await res.json();
    setImages(data.images || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.imageUrl) {
      setError("Please upload a photo first.");
      return;
    }
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }
    setForm(empty);
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Remove this photo from the gallery?")) return;
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-900">Photo Gallery</h2>
          <p className="text-sm text-navy-500 mt-1">
            Photos of students at work, campus life and graduation, shown on the public Gallery page.
          </p>
        </div>
        <button onClick={() => { setShowForm(true); setForm(empty); setError(""); }} className="rounded-md bg-rust-500 text-white px-4 py-2 text-sm font-semibold hover:bg-rust-400">
          + Add Photo
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card-surface rounded-xl p-6 space-y-4">
          <h3 className="font-display font-bold text-navy-900">New Photo</h3>
          {error && <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
          <ImageUploadField label="Photo" value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Caption</label>
              <input required value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="e.g. Welding students in the workshop" className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-md bg-rust-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-rust-400">Add to Gallery</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-700 hover:bg-navy-50">Cancel</button>
          </div>
        </form>
      )}

      {loading && <p className="text-navy-500">Loading...</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <div key={img.id} className="card-surface rounded-xl overflow-hidden">
            <img src={img.imageUrl} alt={img.caption} className="h-40 w-full object-cover" />
            <div className="p-4">
              <span className="route-tag inline-block bg-navy-100 text-navy-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                {img.category}
              </span>
              <p className="mt-2 text-sm text-navy-700">{img.caption}</p>
              <button onClick={() => remove(img.id)} className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600">Remove</button>
            </div>
          </div>
        ))}
        {!loading && images.length === 0 && <p className="text-navy-500 text-sm">No photos yet — add your first one above.</p>}
      </div>
    </div>
  );
}
