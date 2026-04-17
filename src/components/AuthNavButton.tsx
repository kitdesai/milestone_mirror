"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function AuthNavButton() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ width: 100, height: 40, background: "#F5D0B4", borderRadius: 50, opacity: 0.5 }} />
    );
  }

  const style: React.CSSProperties = {
    background: "#E8845C",
    color: "white",
    padding: "10px 24px",
    borderRadius: 50,
    fontWeight: 600,
    fontSize: "0.95rem",
    textDecoration: "none",
    transition: "background 0.2s, transform 0.2s",
  };

  if (user) {
    return (
      <Link href="/app" style={style}>
        Go to App
      </Link>
    );
  }

  return (
    <Link href="/auth" style={style}>
      Get Started
    </Link>
  );
}
