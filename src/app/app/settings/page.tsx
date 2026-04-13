"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionManager } from "@/components/SubscriptionManager";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-cream-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/app" className="flex items-center gap-3">
              <Image src="/icon.svg" alt="Milestone Mirror" width={56} height={56} />
              <div>
                <h1 className="font-display text-xl font-bold text-gray-800">
                  Milestone Mirror
                </h1>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </Link>
          </div>
          <Link
            href="/app"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <h2 className="font-display text-2xl font-bold text-gray-800">
          Settings
        </h2>

        {/* Subscription */}
        <SubscriptionManager />

        {/* Account */}
        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-4">
            Account
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm text-gray-800">{user?.email}</span>
            </div>
            <div className="border-t border-cream-200 pt-3">
              <button
                onClick={logout}
                className="text-sm text-rose-600 hover:text-rose-700 font-medium transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-4">
            Legal
          </h3>
          <div className="space-y-2">
            <Link
              href="/privacy"
              className="block text-sm text-gray-600 hover:text-peach-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="block text-sm text-gray-600 hover:text-peach-600 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
