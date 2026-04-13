"use client";

import { useState, useEffect } from "react";
import { PricingModal } from "./PricingModal";

interface SubscriptionInfo {
  tier: "free" | "premium";
  subscription: {
    id: string;
    priceId: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export function SubscriptionManager() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    fetch("/api/stripe/status")
      .then((res) => res.json())
      .then((data) => setInfo(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch {
      // ignore
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
      <h3 className="font-display text-lg font-semibold text-gray-800 mb-3">
        Subscription
      </h3>

      {info?.tier === "premium" && info.subscription ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-peach-100 text-peach-700 text-xs font-medium px-2.5 py-1 rounded-full">
              Premium
            </span>
            <span className="text-sm text-gray-500">
              {info.subscription.status === "active"
                ? info.subscription.cancelAtPeriodEnd
                  ? "Cancels at end of period"
                  : "Active"
                : info.subscription.status}
            </span>
          </div>
          {info.subscription.currentPeriodEnd && (
            <p className="text-sm text-gray-500">
              {info.subscription.cancelAtPeriodEnd ? "Access until" : "Renews"}:{" "}
              {new Date(info.subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          <button
            onClick={handleManage}
            disabled={portalLoading}
            className="text-sm text-peach-600 hover:text-peach-700 font-medium transition-colors"
          >
            {portalLoading ? "Loading..." : "Manage Subscription"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-cream-200 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
              Free
            </span>
            <span className="text-sm text-gray-500">
              5 frames, 2 children
            </span>
          </div>
          <button
            onClick={() => setShowPricing(true)}
            className="bg-peach-500 hover:bg-peach-600 text-white font-medium py-1.5 px-4 rounded-lg text-sm transition-colors"
          >
            Upgrade to Premium
          </button>
        </div>
      )}

      {showPricing && (
        <PricingModal onClose={() => setShowPricing(false)} />
      )}
    </div>
  );
}
