"use client";

import { useState } from "react";

export default function DocumentUploadField({
  label,
  required,
  onUploaded,
}: {
  label: string;
  required?: boolean;
  onUploaded: (url: string) => void;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setError("");
    setFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/application-document", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      onUploaded(data.url);
      setStatus("done");
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-navy-800 mb-1">
        {label} {required && <span className="text-rust-500">*</span>}
      </label>
      <input
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={handleFile}
        required={required && status !== "done"}
        className="w-full text-sm text-navy-600 file:mr-3 file:rounded-md file:border-0 file:bg-navy-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-navy-700 hover:file:bg-navy-200"
      />
      <p className="mt-1 text-xs text-navy-400">PDF, JPG, PNG or WEBP, up to 5MB.</p>
      {status === "uploading" && <p className="mt-1 text-xs text-navy-500">Uploading {fileName}...</p>}
      {status === "done" && <p className="mt-1 text-xs text-emerald-600">✓ {fileName} uploaded</p>}
      {status === "error" && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
