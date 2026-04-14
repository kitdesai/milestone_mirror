"use client";

import { useState } from "react";

interface PricingModalProps {
  onClose: () => void;
}

export function PricingModal({ onClose }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start checkout");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
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

        {/* What you get */}
        <div className="mb-5">
          <p className="text-sm text-gray-500 mb-3">Premium includes:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="h-4 w-4 text-peach-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <strong>Unlimited</strong> frames
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="h-4 w-4 text-peach-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <strong>Unlimited</strong> children
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="h-4 w-4 text-peach-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Priority support
            </li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Plan selection */}
        <div className="space-y-3 mb-5">
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
              selectedPlan === "monthly"
                ? "border-peach-400 bg-peach-50"
                : "border-cream-200 hover:border-cream-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "monthly" ? "border-peach-500" : "border-gray-300"
              }`}>
                {selectedPlan === "monthly" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-peach-500" />
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Monthly</p>
                <p className="text-xs text-gray-500">Billed monthly</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">$4.99</p>
              <p className="text-xs text-gray-500">/month</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedPlan("yearly")}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors relative ${
              selectedPlan === "yearly"
                ? "border-peach-400 bg-peach-50"
                : "border-cream-200 hover:border-cream-300"
            }`}
          >
            <div className="absolute -top-2.5 left-4 bg-peach-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              Save 17%
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "yearly" ? "border-peach-500" : "border-gray-300"
              }`}>
                {selectedPlan === "yearly" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-peach-500" />
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Yearly</p>
                <p className="text-xs text-gray-500">Billed annually</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">$49.99</p>
              <p className="text-xs text-gray-500">/year</p>
            </div>
          </button>
        </div>

        {/* Continue button */}
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full bg-peach-500 hover:bg-peach-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Redirecting to checkout...
            </span>
          ) : (
            `Continue with ${selectedPlan === "yearly" ? "Yearly" : "Monthly"} Plan`
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Cancel anytime. Secure payment via Stripe.
        </p>
      </div>
    </div>
  );
}
