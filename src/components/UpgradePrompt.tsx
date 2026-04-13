"use client";

import { useState } from "react";
import { PricingModal } from "./PricingModal";

interface UpgradePromptProps {
  limitType: "frames" | "children";
  limit: number;
}

export function UpgradePrompt({ limitType, limit }: UpgradePromptProps) {
  const [showPricing, setShowPricing] = useState(false);

  const message =
    limitType === "frames"
      ? `You've reached the free plan limit of ${limit} frames.`
      : `You've reached the free plan limit of ${limit} children.`;

  return (
    <>
      <div className="bg-gradient-to-r from-peach-50 to-rose-50 rounded-xl p-4 border border-peach-200">
        <p className="text-sm text-gray-700 mb-2">{message}</p>
        <button
          onClick={() => setShowPricing(true)}
          className="bg-peach-500 hover:bg-peach-600 text-white font-medium py-1.5 px-4 rounded-lg text-sm transition-colors"
        >
          Upgrade to Premium
        </button>
      </div>
      {showPricing && (
        <PricingModal onClose={() => setShowPricing(false)} />
      )}
    </>
  );
}
