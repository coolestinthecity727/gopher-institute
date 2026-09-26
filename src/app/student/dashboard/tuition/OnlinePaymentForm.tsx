"use client";

import { useState } from "react";

export default function OnlinePaymentForm({
  outstanding,
}: {
  outstanding: number;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/payments/paynow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to start payment.");
        return;
      }

      if (!data.redirectUrl) {
        setError("Paynow did not provide a payment link.");
        return;
      }

      window.location.href = data.redirectUrl;
    } catch {
      setError("Unable to connect to Paynow. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (outstanding <= 0) {
    return null;
  }

  return (
    <form onSubmit={submitPayment} className="mt-5 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-navy-800">
          Payment Amount (USD)
        </label>
        <input
          type="number"
          min="0.01"
          max={outstanding}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Maximum $${outstanding.toFixed(2)}`}
          required
          className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-3 text-sm outline-none focus:border-navy-500"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Connecting to Paynow..." : "Pay Online with Paynow"}
      </button>

      <p className="text-xs leading-5 text-navy-500">
        You will be securely redirected to Paynow to complete your payment.
      </p>
    </form>
  );
}
