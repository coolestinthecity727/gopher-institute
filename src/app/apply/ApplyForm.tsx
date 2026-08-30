"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import DocumentUploadField from "./DocumentUploadField";

type Course = { id: string; name: string; category: string };

export default function ApplyForm({ courses }: { courses: Course[] }) {
  const params = useSearchParams();
  const preselected = params.get("course") || "";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ applicationNo: string } | null>(null);
  const [idDocumentUrl, setIdDocumentUrl] = useState("");
  const [transcriptUrl, setTranscriptUrl] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = { ...Object.fromEntries(form.entries()), idDocumentUrl, transcriptUrl };

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setResult({ applicationNo: data.applicationNo });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="card-surface rounded-2xl p-8 text-center max-w-xl mx-auto">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rust-500 text-white text-2xl font-bold">
          ✓
        </div>
        <h2 className="mt-4 font-display text-2xl font-extrabold text-navy-900">Application Submitted</h2>
        <p className="mt-2 text-navy-600">
          Your application reference number is:
        </p>
        <p className="mt-2 font-display text-2xl font-extrabold text-rust-500 tracking-wide">
          {result.applicationNo}
        </p>
        <p className="mt-4 text-sm text-navy-500">
          Keep this number safe — use it with the Check Registration portal to track your application status.
          Our admissions team will review your application and contact you using the details you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-8 max-w-3xl mx-auto space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <fieldset className="space-y-4">
        <legend className="font-display font-bold text-navy-900 text-lg">Personal Details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" name="fullName" required />
          <Field label="National ID Number" name="nationalId" required />
          <Field label="Date of Birth" name="dateOfBirth" type="date" required />
          <SelectField label="Gender" name="gender" required options={["Female", "Male", "Prefer not to say"]} />
          <Field label="Email Address" name="email" type="email" required />
          <Field label="Phone Number" name="phone" required placeholder="07xx xxx xxx" />
        </div>
        <Field label="Residential Address" name="address" required />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display font-bold text-navy-900 text-lg">Guardian / Next of Kin (optional)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Guardian Name" name="guardianName" required={false} />
          <Field label="Guardian Phone" name="guardianPhone" required={false} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display font-bold text-navy-900 text-lg">Programme &amp; Qualifications</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-navy-800 mb-1">Programme Applying For</label>
            <select
              name="courseId"
              required
              defaultValue={preselected}
              className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring"
            >
              <option value="" disabled>Select a programme</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.category}</option>
              ))}
            </select>
          </div>
          <Field label="Highest Qualification" name="highestQualification" required placeholder="e.g. O-Level, A-Level" />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display font-bold text-navy-900 text-lg">Supporting Documents</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <DocumentUploadField label="National ID / Birth Certificate Copy" required onUploaded={setIdDocumentUrl} />
          <DocumentUploadField label="Academic Transcript / Certificate Copy" onUploaded={setTranscriptUrl} />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-rust-500 px-6 py-3.5 font-display font-bold text-white hover:bg-rust-400 transition-colors disabled:opacity-60 focus-ring"
      >
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
      <p className="text-xs text-navy-500 text-center">
        By submitting, you confirm the details above are accurate to the best of your knowledge.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = true,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-navy-800 mb-1">
        {label} {required && <span className="text-rust-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  required = true,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-navy-800 mb-1">
        {label} {required && <span className="text-rust-500">*</span>}
      </label>
      <select name={name} required={required} className="w-full rounded-md border border-navy-900/15 px-3 py-2.5 text-sm focus-ring">
        <option value="" disabled selected>Select</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
