"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-peach-100 border-t-peach-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-cream-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/icon.svg" alt="Milestone Mirror" width={56} height={56} />
            <h1 className="font-display text-xl font-bold text-gray-800">
              Milestone Mirror
            </h1>
          </div>
          <div className="flex gap-3">
            {user ? (
              <Link
                href="/app"
                className="bg-peach-500 hover:bg-peach-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go to App
              </Link>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="bg-peach-500 hover:bg-peach-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Compare Your Children at the Same Ages
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Create beautiful milestone frames and compare how your children
            looked at the same ages. Cherish those precious moments side by
            side.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8">
            <div className="w-12 h-12 bg-peach-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-peach-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl font-semibold text-gray-800 mb-2">
              Photo Comparison
            </h3>
            <p className="text-gray-500">
              Connect your Dropbox and automatically find photos of your
              children at the same ages based on when the photos were taken.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-rose-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl font-semibold text-gray-800 mb-2">
              Custom Frames
            </h3>
            <p className="text-gray-500">
              Create custom milestone frames like &quot;First Steps&quot; or
              &quot;First Smile&quot; and upload the perfect photos for each
              child.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href={user ? "/app" : "/auth"}
            className="inline-block bg-peach-500 hover:bg-peach-600 text-white font-medium py-3 px-8 rounded-lg text-lg transition-colors"
          >
            {user ? "Open App" : "Get Started Free"}
          </Link>
        </div>
      </main>

      <footer className="border-t border-cream-200 bg-white/50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>
            Milestone Mirror - Your photos stay in your cloud storage.
            <br />
            We prioritize your privacy and data security.
          </p>
          <div className="flex justify-center gap-4 mt-3">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
