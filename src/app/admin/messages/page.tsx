"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/contact");
    const data = await res.json();
    setMessages(data.messages || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function open(m: Message) {
    setExpanded(expanded === m.id ? null : m.id);
    if (!m.isRead) {
      await fetch(`/api/contact/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: true }) });
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/contact/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-extrabold text-navy-900">Contact Messages</h2>
      <div className="card-surface rounded-xl divide-y divide-navy-900/5">
        {loading && <p className="px-4 py-6 text-center text-navy-500">Loading...</p>}
        {!loading && messages.length === 0 && <p className="px-4 py-6 text-center text-navy-500">No messages yet.</p>}
        {messages.map((m) => (
          <div key={m.id}>
            <button onClick={() => open(m)} className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-navy-50/50">
              <div>
                <p className={`font-semibold ${m.isRead ? "text-navy-700" : "text-navy-900"}`}>
                  {!m.isRead && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-rust-500" />}
                  {m.subject}
                </p>
                <p className="text-xs text-navy-500">{m.name} · {m.email} · {new Date(m.createdAt).toLocaleString()}</p>
              </div>
              <span className="text-navy-400 text-sm">{expanded === m.id ? "▲" : "▼"}</span>
            </button>
            {expanded === m.id && (
              <div className="px-5 pb-4">
                <p className="text-sm text-navy-700 whitespace-pre-line">{m.message}</p>
                <button onClick={() => remove(m.id)} className="mt-3 text-xs font-semibold text-red-500 hover:text-red-600">Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
