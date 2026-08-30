"use client";

import { useEffect, useState } from "react";
import ImageUploadField from "@/components/ImageUploadField";

type Partner = {
  id: string;
  name: string;
  description: string;
  logoUrl: string | null;
  website: string | null;
  isMinistry: boolean;
};

const empty = { name: "", description: "", logoUrl: "", website: "", isMinistry: false };

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/partners");
    const data = await res.json();
    setPartners(data.partners || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(p: Partner) {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description, logoUrl: p.logoUrl || "", website: p.website || "", isMinistry: p.isMinistry });
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/partners/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch("/api/partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setShowForm(false);
    setForm(empty);
    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Remove this partner?")) return;
    await fetch(`/api/partners/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-navy-900">Partnership Corner</h2>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(empty); }} className="rounded-md bg-rust-500 text-white px-4 py-2 text-sm font-semibold hover:bg-rust-400">
          + Add Partner
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card-surface rounded-xl p-6 space-y-4">
          <h3 className="font-display font-bold text-navy-900">{editingId ? "Edit Partner" : "New Partner"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy-600 mb-1">Organisation Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy-600 mb-1">Description</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1">Website (optional)</label>
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full rounded-md border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div className="sm:col-span-2">
              <ImageUploadField label="Logo" value={form.logoUrl} onChange={(url) => setForm({ ...form, logoUrl: url })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-navy-700 mt-2">
              <input type="checkbox" checked={form.isMinistry} onChange={(e) => setForm({ ...form, isMinistry: e.target.checked })} />
              Feature as founding/government partner
            </label>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-md bg-rust-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-rust-400">{editingId ? "Save Changes" : "Add Partner"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-navy-900/15 px-5 py-2.5 text-sm font-semibold text-navy-700 hover:bg-navy-50">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {loading && <p className="text-navy-500">Loading...</p>}
        {partners.map((p) => (
          <div key={p.id} className="card-surface rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {p.logoUrl && <img src={p.logoUrl} alt="" className="h-9 w-9 rounded object-cover" />}
                <h3 className="font-display font-bold text-navy-900">{p.name}</h3>
              </div>
              {p.isMinistry && <span className="route-tag shrink-0 bg-rust-500 text-white px-2.5 py-1 text-[10px] font-bold uppercase">Founding</span>}
            </div>
            <p className="mt-2 text-sm text-navy-600">{p.description}</p>
            <div className="mt-3 space-x-3">
              <button onClick={() => startEdit(p)} className="text-xs font-semibold text-rust-500 hover:text-rust-600">Edit</button>
              <button onClick={() => remove(p.id)} className="text-xs font-semibold text-red-500 hover:text-red-600">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
