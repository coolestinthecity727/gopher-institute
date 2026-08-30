"use client";

import { useState } from "react";

export default function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      onChange(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-navy-600 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="h-14 w-14 rounded-md object-cover border border-navy-900/10" />
        ) : (
          <div className="h-14 w-14 rounded-md bg-navy-50 border border-dashed border-navy-900/20 grid place-items-center text-navy-300 text-xs">
            None
          </div>
        )}
        <div className="flex-1">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={handleFile}
            disabled={uploading}
            className="w-full text-xs text-navy-600 file:mr-3 file:rounded-md file:border-0 file:bg-navy-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-navy-700 hover:file:bg-navy-200"
          />
          <p className="mt-1 text-[11px] text-navy-400">
            {uploading ? "Uploading..." : "JPG, PNG, WEBP, GIF or SVG, up to 5MB. Or paste a URL below."}
          </p>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-md border border-navy-900/15 px-2 py-1.5 text-xs focus-ring"
          />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
