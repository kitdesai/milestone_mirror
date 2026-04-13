"use client";

import { useState } from "react";

interface PricingModalProps {
  onClose: () => void;
}

export function PricingModal({ onClose }: PricingModalProps) {
  const [isLoading, setIsLoading] = useState<"monthly" | "yearly" | null>(
    null
  );
  const [error, setError] = useState("");

  const handleCheckout = async (plan: "monthly" | "yearly") => {
    setIsLoading(plan);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start checkout");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-gray-800">
            Upgrade to Premium
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Unlock unlimited frames and children to capture every milestone.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleCheckout("monthly")}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-cream-200 hover:border-peach-400 transition-colors disabled:opacity-50"
          >
            <div className="text-left">
              <p className="font-semibold text-gray-800">Monthly</p>
              <p className="text-sm text-gray-500">Billed monthly</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">$4.99</p>
              <p className="text-xs text-gray-500">/month</p>
            </div>
          </button>

          <button
            onClick={() => handleCheckout("yearly")}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-peach-400 bg-peach-50 hover:bg-peach-100 transition-colors disabled:opacity-50 relative"
          >
            <div className="absolute -top-2.5 left-4 bg-peach-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              Save 17%
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Yearly</p>
              <p className="text-sm text-gray-500">Billed annually</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">$49.99</p>
              <p className="text-xs text-gray-500">/year</p>
            </div>
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-peach-200 border-t-peach-500 rounded-full animate-spin" />
            Redirecting to checkout...
          </div>
        )}
      </div>
    </div>
  );
}
