"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function AuthNavButton() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-20 h-9 bg-cream-200 rounded-lg animate-pulse" />
    );
  }

  if (user) {
    return (
      <Link
        href="/app"
        className="bg-peach-500 hover:bg-peach-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Go to App
      </Link>
    );
  }

  return (
    <Link
      href="/auth"
      className="bg-peach-500 hover:bg-peach-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
    >
      Sign In
    </Link>
  );
}
